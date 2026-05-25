import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import useSocket from "../../hooks/useSocket";
import "./WorkspaceMessages.css";

/**
 * Hộp thư – nhắn tin realtime với freelancer / người thuê.
 *
 * REST (load history):
 *   GET /users/:id/conversations
 *   GET /chat/:id/messages
 *
 * WebSocket (realtime):
 *   emit: joinConversation, leaveConversation, sendMessage, markAsRead, typing
 *   listen: newMessage, messagesRead, userTyping, messageNotification, error
 */
const WorkspaceMessages = () => {
  const { currentUser } = useOutletContext();
  const currentUserId = currentUser?.taiKhoanId ?? currentUser?.id;
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedConvId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [threadError, setThreadError] = useState(null);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  // Track unread: set chứa conversationId có tin nhắn mới chưa đọc
  const [unreadIds, setUnreadIds] = useState(new Set());
  const [activeJob, setActiveJob] = useState(null);
  // Mapping: conversationId → { type: 'contract'|'request', id, title }
  const [convContexts, setConvContexts] = useState({});

  const bodyRef = useRef(null);
  const prevActiveRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ── Socket.IO ──
  const { socket, connected } = useSocket(currentUserId);

  // ── Load danh sách hội thoại (REST) ──
  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    const load = async () => {
      setLoadingList(true);
      setListError(null);
      try {
        const res = await api.chat.getConversations(currentUserId);
        if (cancelled) return;
        const list = res?.conversations || res?.data || (Array.isArray(res) ? res : []);
        setConversations(list);
        if (list.length > 0 && !activeId) {
          setActiveId(list[0].cuocHoiThoaiId ?? list[0].id);
        }
      } catch (err) {
        if (!cancelled) setListError(err.message || "Không tải được danh sách hội thoại");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ── Sync URL param ?conversationId=X → setActiveId ──
  useEffect(() => {
    if (!requestedConvId || !conversations.length) return;
    const targetId = Number(requestedConvId);
    const found = conversations.find(
      (c) => Number(c.cuocHoiThoaiId ?? c.id) === targetId
    );
    if (found) {
      setActiveId(found.cuocHoiThoaiId ?? found.id);
      setUnreadIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      // Xóa query param sau khi đã apply để tránh re-trigger
      setSearchParams({}, { replace: true });
    }
  }, [requestedConvId, conversations, setSearchParams]);

  // ── Load tin nhắn history khi đổi hội thoại (REST) ──
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    const load = async () => {
      setLoadingMessages(true);
      setThreadError(null);
      try {
        const res = await api.chat.getMessages(activeId);
        if (cancelled) return;
        const list = res?.messages || res?.data || (Array.isArray(res) ? res : []);
        setMessages(list);
      } catch (err) {
        if (!cancelled) setThreadError(err.message || "Không tải được tin nhắn");
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeId]);

  // ── Load context (yêu cầu / công việc) cho mỗi hội thoại ──
  useEffect(() => {
    if (!conversations.length) {
      setConvContexts({});
      return;
    }

    let cancelled = false;

    const loadContexts = async () => {
      // 1. Lấy mapping từ localStorage (do RequestDetailPage lưu khi tạo conversation từ yêu cầu)
      let localMap = {};
      try {
        localMap = JSON.parse(localStorage.getItem("chat_contexts") || "{}");
      } catch {
        localMap = {};
      }

      // 2. Build context map cho từng conversation
      const contextMap = {};
      const jobsToFetch = [];

      conversations.forEach((conv) => {
        const id = conv.cuocHoiThoaiId ?? conv.id;
        // Ưu tiên: nếu hội thoại đã liên kết hợp đồng (congViecId) thì gọi API
        if (conv.congViecId) {
          jobsToFetch.push({ convId: id, jobId: conv.congViecId });
        } else if (localMap[id]) {
          // Fallback: lấy từ localStorage (yêu cầu)
          contextMap[id] = localMap[id];
        }
      });

      // 3. Fetch song song thông tin hợp đồng
      const jobResults = await Promise.allSettled(
        jobsToFetch.map((j) =>
          api.contracts.getDetail(j.jobId).then((res) => ({
            convId: j.convId,
            jobId: j.jobId,
            data: res?.contract || res?.data || res,
          }))
        )
      );

      jobResults.forEach((r) => {
        if (r.status === "fulfilled" && r.value) {
          const { convId, jobId, data } = r.value;
          contextMap[convId] = {
            type: "contract",
            id: jobId,
            title: data?.yeuCau?.tieuDe || `Hợp đồng #${jobId}`,
            link: `/workspace/jobs/${jobId}`,
          };
        }
      });

      if (!cancelled) setConvContexts(contextMap);
    };

    loadContexts();
    return () => { cancelled = true; };
  }, [conversations]);

  // ── activeJob: tương thích ngược cho phần thread header ──
  useEffect(() => {
    const ctx = convContexts[activeId];
    if (ctx?.type === "contract") {
      setActiveJob({ yeuCau: { tieuDe: ctx.title }, congViecId: ctx.id });
    } else {
      setActiveJob(null);
    }
  }, [activeId, convContexts]);

  // ── Join/Leave room khi đổi hội thoại ──
  useEffect(() => {
    const s = socket.current;

    // Leave room cũ
    if (s && connected && prevActiveRef.current && prevActiveRef.current !== activeId) {
      s.emit("leaveConversation", { cuocHoiThoaiId: prevActiveRef.current });
    }

    // Join room mới + mark as read
    if (activeId) {
      if (s && connected) {
        s.emit("joinConversation", { cuocHoiThoaiId: activeId });
        s.emit("markAsRead", { cuocHoiThoaiId: activeId, userId: currentUserId });
      }
      // Fallback REST: luôn gọi để đảm bảo backend cập nhật trạng thái đọc
      api.chat.markAsRead(activeId, currentUserId).catch((err) => {
        console.warn("[chat] markAsRead REST failed:", err.message);
      });
    }

    prevActiveRef.current = activeId;
  }, [activeId, connected, socket, currentUserId]);

  // ── Listen socket events ──
  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const handleNewMessage = (msg) => {
      if (Number(msg.cuocHoiThoaiId) === Number(activeId)) {
        setMessages((prev) => {
          // Nếu tin nhắn do mình gửi → thay thế optimistic msg
          if (msg.nguoiGui?.taiKhoanId === currentUserId) {
            const pendingIdx = prev.findIndex(
              (m) => m._pending && m.noiDung === msg.noiDung
            );
            if (pendingIdx >= 0) {
              const updated = [...prev];
              updated[pendingIdx] = { ...msg, _pending: false };
              return updated;
            }
          }
          // Tránh duplicate (nếu đã có tinNhanId này)
          if (prev.some((m) => m.tinNhanId === msg.tinNhanId)) return prev;
          // Tin nhắn từ người khác → append
          return [...prev, msg];
        });
        // Mark as read ngay nếu tin từ người khác
        if (msg.nguoiGui?.taiKhoanId !== currentUserId) {
          s.emit("markAsRead", { cuocHoiThoaiId: activeId, userId: currentUserId });
        }
      }
      // Cập nhật tinNhanCuoi ở list + track ai gửi cuối
      setConversations((prev) =>
        prev.map((c) =>
          Number(c.cuocHoiThoaiId ?? c.id) === Number(msg.cuocHoiThoaiId)
            ? { ...c, tinNhanCuoi: msg.noiDung, lastSenderId: msg.nguoiGui?.taiKhoanId }
            : c
        )
      );
      // Nếu tin nhắn từ người khác và conversation không phải đang active → đánh dấu unread
      if (msg.nguoiGui?.taiKhoanId !== currentUserId && Number(msg.cuocHoiThoaiId) !== Number(activeId)) {
        setUnreadIds((prev) => new Set([...prev, msg.cuocHoiThoaiId]));
      }
    };

    const handleNotification = (data) => {
      // Tin nhắn đến conversation khác (unread badge)
      const convId = data.cuocHoiThoaiId;
      setConversations((prev) =>
        prev.map((c) =>
          Number(c.cuocHoiThoaiId ?? c.id) === Number(convId)
            ? { ...c, tinNhanCuoi: data.message?.noiDung || c.tinNhanCuoi }
            : c
        )
      );
      // Đánh dấu unread
      if (Number(convId) !== Number(activeId)) {
        setUnreadIds((prev) => new Set([...prev, convId]));
      }
    };

    const handleTyping = (data) => {
      if (Number(data.cuocHoiThoaiId) === Number(activeId) && data.userId !== currentUserId) {
        setPartnerTyping(data.isTyping);
      }
    };

    const handleMessagesRead = (data) => {
      // Khi đối phương đọc tin → cập nhật daDoc cho tin nhắn mình gửi
      if (Number(data.cuocHoiThoaiId) === Number(activeId) && data.userId !== currentUserId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.nguoiGui?.taiKhoanId === currentUserId && !m.daDoc
              ? { ...m, daDoc: true }
              : m
          )
        );
      }
    };

    const handleError = (err) => {
      console.warn("[socket] error:", err.message);
    };

    s.on("newMessage", handleNewMessage);
    s.on("messageNotification", handleNotification);
    s.on("userTyping", handleTyping);
    s.on("messagesRead", handleMessagesRead);
    s.on("error", handleError);

    return () => {
      s.off("newMessage", handleNewMessage);
      s.off("messageNotification", handleNotification);
      s.off("userTyping", handleTyping);
      s.off("messagesRead", handleMessagesRead);
      s.off("error", handleError);
    };
  }, [socket, activeId, currentUserId]);

  // ── Auto scroll xuống cuối ──
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, activeId]);

  // ── Helpers ──
  const getPartner = (conv) => {
    if (!conv) return null;
    const m1 = conv.thanhVien1;
    const m2 = conv.thanhVien2;
    // So sánh cả taiKhoanId dạng number và string
    const uid = Number(currentUserId);
    if (Number(m1?.taiKhoanId) === uid) return m2;
    if (Number(m2?.taiKhoanId) === uid) return m1;
    return m2 || m1;
  };

  // Kiểm tra xem chuỗi có phải là ISO timestamp không
  const isTimestamp = (str) => {
    if (!str || typeof str !== "string") return false;
    return /^\d{4}-\d{2}-\d{2}T/.test(str);
  };

  const getLastMessage = (conv) => {
    const msg = conv.tinNhanCuoi;
    if (!msg) return "Chưa có tin nhắn";
    // Nếu tinNhanCuoi là timestamp thì không hiển thị nó
    if (isTimestamp(msg)) return "Chưa có tin nhắn";
    return msg;
  };

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const kw = search.toLowerCase();
    return conversations.filter((c) => {
      const partner = getPartner(c);
      const name = (partner?.hoTen || "").toLowerCase();
      const last = (c.tinNhanCuoi || "").toLowerCase();
      return name.includes(kw) || last.includes(kw);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, search, currentUserId]);

  const activeConversation = conversations.find(
    (c) => (c.cuocHoiThoaiId ?? c.id) === activeId
  );
  const activePartner = getPartner(activeConversation);

  const initials = (name) =>
    (name || "?")
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(-2)
      .join("")
      .toUpperCase();

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      }
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // ── Gửi tin nhắn qua WebSocket ──
  const handleSend = useCallback(async (e) => {
    e?.preventDefault?.();
    const content = draft.trim();
    if (!content || !activeId || sending) return;

    setSending(true);
    setThreadError(null);

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      tinNhanId: tempId,
      cuocHoiThoaiId: activeId,
      nguoiGui: { taiKhoanId: currentUserId, hoTen: currentUser?.hoTen || "Bạn" },
      noiDung: content,
      loaiTin: "VanBan",
      daDoc: false,
      ngayTao: new Date().toISOString(),
      _pending: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setDraft("");

    const s = socket.current;
    if (s && connected) {
      // Gửi qua WebSocket
      s.emit("sendMessage", {
        cuocHoiThoaiId: activeId,
        nguoiGuiId: currentUserId,
        noiDung: content,
        loaiTin: "VanBan",
      });
      // Server sẽ emit newMessage lại — ta thay thế optimistic msg
      // Đợi 1 chút rồi bỏ _pending (newMessage event sẽ handle)
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.tinNhanId === tempId ? { ...m, _pending: false } : m))
        );
        setSending(false);
      }, 300);
    } else {
      // Fallback: gửi qua REST nếu socket không available
      try {
        const res = await api.chat.sendMessage(activeId, {
          cuocHoiThoaiId: activeId,
          nguoiGuiId: currentUserId,
          noiDung: content,
          loaiTin: "VanBan",
        });
        const sent = res?.data || res;
        setMessages((prev) =>
          prev.map((m) => (m.tinNhanId === tempId ? { ...optimisticMsg, ...sent, _pending: false } : m))
        );
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.tinNhanId !== tempId));
        setDraft(content);
        setThreadError(err.message || "Gửi tin nhắn thất bại");
      } finally {
        setSending(false);
      }
    }

    // Cập nhật tinNhanCuoi ở list
    setConversations((prev) =>
      prev.map((c) =>
        (c.cuocHoiThoaiId ?? c.id) === activeId ? { ...c, tinNhanCuoi: content, lastSenderId: currentUserId } : c
      )
    );
  }, [draft, activeId, sending, currentUserId, currentUser, socket, connected]);

  // ── Typing indicator ──
  const handleInputChange = (e) => {
    setDraft(e.target.value);
    const s = socket.current;
    if (s && connected && activeId) {
      s.emit("typing", { cuocHoiThoaiId: activeId, userId: currentUserId, isTyping: true });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        s.emit("typing", { cuocHoiThoaiId: activeId, userId: currentUserId, isTyping: false });
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="wl-content-box wm-page">
      <div className="wm-page-header">
        <h2>Tin nhắn</h2>
        {connected && <span style={{ fontSize: "11px", color: "#10b981", marginLeft: "12px" }}>● Online</span>}
      </div>

      <div className="wm-wrapper">
        {/* ============ Sidebar list ============ */}
        <aside className="wm-list">
          <div className="wm-list-header">
            <h3>Hội thoại</h3>
            <input
              className="wm-list-search"
              type="text"
              placeholder="Tìm theo tên hoặc nội dung…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="wm-list-body">
            {loadingList ? (
              <div className="wm-list-loading">
                <i className="fa-solid fa-circle-notch fa-spin" /> Đang tải…
              </div>
            ) : listError ? (
              <div className="wm-list-empty">
                <i className="fa-solid fa-triangle-exclamation" />
                <div>{listError}</div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="wm-list-empty">
                <i className="fa-regular fa-comments" />
                <div>Chưa có hội thoại nào.</div>
                <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "8px" }}>
                  Bấm "Nhắn tin" ở trang chi tiết yêu cầu để bắt đầu trò chuyện.
                </div>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const id = conv.cuocHoiThoaiId ?? conv.id;
                const partner = getPartner(conv);
                const name = partner?.hoTen || "Người dùng";
                const hasUnread = unreadIds.has(id);
                const ctx = convContexts[id];
                return (
                  <div
                    key={id}
                    className={`wm-conv-item ${Number(activeId) === Number(id) ? "active" : ""}`}
                    onClick={() => {
                      setActiveId(id);
                      // Đọc rồi → xóa khỏi unread
                      setUnreadIds((prev) => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                      });
                    }}
                  >
                    <div className="wm-avatar">{initials(name)}</div>
                    <div className="wm-conv-info">
                      <div className="wm-conv-name">{name}</div>
                      {ctx && (
                        <div className="wm-conv-context">
                          <i className={`fa-solid ${ctx.type === "contract" ? "fa-briefcase" : "fa-file-lines"}`}></i>
                          <span title={ctx.title}>
                            {ctx.type === "contract" ? "Công việc:" : "Yêu cầu:"} {ctx.title}
                          </span>
                        </div>
                      )}
                      <div className={`wm-conv-last ${hasUnread ? "unread" : ""}`}>
                        {getLastMessage(conv)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ============ Thread ============ */}
        <section className="wm-thread">
          {!activeConversation ? (
            <div className="wm-thread-empty">
              <i className="fa-regular fa-comments" />
              <p>Chọn một hội thoại để bắt đầu nhắn tin.</p>
            </div>
          ) : (
            <>
              <header className="wm-thread-header">
                <div className="wm-avatar lg">{initials(activePartner?.hoTen)}</div>
                <div>
                  <div className="wm-conv-name">{activePartner?.hoTen || "Người dùng"}</div>
                  <div className="wm-conv-meta">
                    {partnerTyping ? (
                      <span style={{ color: "#0ea5e9", fontStyle: "italic" }}>Đang nhập…</span>
                    ) : (
                      activePartner?.email || activePartner?.vaiTro || ""
                    )}
                  </div>
                </div>
              </header>

              {(() => {
                const ctx = convContexts[activeId];
                if (!ctx) return null;
                const isContract = ctx.type === "contract";
                return (
                  <div className="wm-thread-context">
                    <i className={`fa-solid ${isContract ? "fa-briefcase" : "fa-file-lines"}`} style={{ color: "#0EA5E9" }}></i>
                    <span className="wm-thread-context-text">
                      Trao đổi về {isContract ? "công việc" : "yêu cầu"}:{" "}
                      <strong>{ctx.title}</strong>
                    </span>
                    <Link
                      to={isContract ? ctx.link : `/requests/${ctx.id}`}
                      className="wm-thread-context-link"
                    >
                      Xem chi tiết
                      <i className="fa-solid fa-chevron-right" style={{ fontSize: "11px", marginLeft: "4px" }}></i>
                    </Link>
                  </div>
                );
              })()}

              <div className="wm-thread-body" ref={bodyRef}>
                {loadingMessages ? (
                  <div className="wm-list-loading">
                    <i className="fa-solid fa-circle-notch fa-spin" /> Đang tải tin nhắn…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="wm-thread-empty" style={{ flex: 1 }}>
                    <p>Chưa có tin nhắn. Hãy gửi lời chào!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const senderId = m.nguoiGui?.taiKhoanId;
                    const isMe = senderId === currentUserId;
                    return (
                      <div key={m.tinNhanId} className={`wm-msg-row ${isMe ? "me" : ""}`}>
                        <div>
                          {!isMe && (
                            <div className="wm-msg-sender">{m.nguoiGui?.hoTen || "Người dùng"}</div>
                          )}
                          <div className={`wm-msg-bubble ${isMe ? "me" : "them"}`}>
                            {m.noiDung}
                          </div>
                          <div className="wm-msg-time" style={{ textAlign: isMe ? "right" : "left" }}>
                            {formatTime(m.ngayTao || m.ngayGui)}
                            {m._pending && " • Đang gửi…"}
                            {isMe && !m._pending && (
                              <span style={{ marginLeft: "6px", fontSize: "11px", color: m.daDoc ? "#0ea5e9" : "#94a3b8" }}>
                                {m.daDoc ? (
                                  <><i className="fa-solid fa-check-double"></i> Đã đọc</>
                                ) : (
                                  <><i className="fa-solid fa-check"></i> Đã gửi</>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {threadError && <div className="wm-error-banner">{threadError}</div>}

              <form className="wm-thread-footer" onSubmit={handleSend}>
                <textarea
                  className="wm-input"
                  rows={1}
                  placeholder="Nhập tin nhắn…"
                  value={draft}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="wm-send-btn"
                  disabled={sending || !draft.trim()}
                  title="Gửi (Enter)"
                >
                  {sending ? (
                    <i className="fa-solid fa-circle-notch fa-spin" />
                  ) : (
                    <i className="fa-solid fa-paper-plane" />
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default WorkspaceMessages;
