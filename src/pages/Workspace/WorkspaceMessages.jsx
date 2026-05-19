import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../services/api";
import "./WorkspaceMessages.css";

/**
 * Hộp thư – nhắn tin với freelancer / người thuê.
 * API:
 *   GET    /chat                         -> danh sách hội thoại
 *   GET    /chat/:id/messages            -> tin nhắn trong hội thoại
 *   POST   /chat/:id/messages            -> gửi tin nhắn { noiDung, loaiTinNhan? }
 */
const WorkspaceMessages = () => {
  const { currentUser } = useOutletContext();
  const currentUserId = currentUser?.taiKhoanId ?? currentUser?.id;

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

  const bodyRef = useRef(null);

  // ── Load danh sách hội thoại ──
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingList(true);
      setListError(null);
      try {
        const res = await api.chat.getConversations();
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setConversations(list);
        // tự chọn hội thoại đầu tiên nếu chưa chọn
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
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load tin nhắn khi đổi hội thoại ──
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    const load = async () => {
      setLoadingMessages(true);
      setThreadError(null);
      try {
        const res = await api.chat.getMessages(activeId);
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMessages(list);
      } catch (err) {
        if (!cancelled) setThreadError(err.message || "Không tải được tin nhắn");
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // ── Auto scroll xuống cuối khi messages thay đổi ──
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, activeId]);

  // ── Xác định người còn lại ──
  const getPartner = (conv) => {
    if (!conv) return null;
    const m1 = conv.thanhVien1;
    const m2 = conv.thanhVien2;
    if (!m1 && !m2) return null;
    if (m1?.taiKhoanId === currentUserId) return m2;
    if (m2?.taiKhoanId === currentUserId) return m1;
    return m2 || m1;
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
      const sameDay = d.toDateString() === now.toDateString();
      if (sameDay) {
        return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      }
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // ── Gửi tin nhắn ──
  const handleSend = async (e) => {
    e?.preventDefault?.();
    const content = draft.trim();
    if (!content || !activeId || sending) return;

    setSending(true);
    setThreadError(null);

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      tinNhanId: tempId,
      nguoiGui: {
        taiKhoanId: currentUserId,
        hoTen: currentUser?.hoTen || "Bạn",
      },
      noiDung: content,
      loaiTinNhan: "VanBan",
      ngayGui: new Date().toISOString(),
      _pending: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setDraft("");

    try {
      const res = await api.chat.sendMessage(activeId, {
        noiDung: content,
        loaiTinNhan: "VanBan",
      });
      const sent = res?.data || res;
      // Thay tin nhắn tạm bằng tin nhắn thực
      setMessages((prev) =>
        prev.map((m) =>
          m.tinNhanId === tempId
            ? {
                ...optimisticMsg,
                ...sent,
                _pending: false,
              }
            : m
        )
      );
      // Cập nhật tin nhắn cuối ở list
      setConversations((prev) =>
        prev.map((c) =>
          (c.cuocHoiThoaiId ?? c.id) === activeId
            ? { ...c, tinNhanCuoi: content }
            : c
        )
      );
    } catch (err) {
      // Rollback optimistic
      setMessages((prev) => prev.filter((m) => m.tinNhanId !== tempId));
      setDraft(content);
      setThreadError(err.message || "Gửi tin nhắn thất bại");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="wl-content-box" style={{ padding: 0, overflow: "hidden" }}>
      <div className="wl-content-header" style={{ padding: "20px 24px", marginBottom: 0, borderBottom: "1px solid #e2e8f0" }}>
        <h2>Tin nhắn</h2>
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
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const id = conv.cuocHoiThoaiId ?? conv.id;
                const partner = getPartner(conv);
                const name = partner?.hoTen || "Người dùng";
                return (
                  <div
                    key={id}
                    className={`wm-conv-item ${activeId === id ? "active" : ""}`}
                    onClick={() => setActiveId(id)}
                  >
                    <div className="wm-avatar">{initials(name)}</div>
                    <div className="wm-conv-info">
                      <div className="wm-conv-name">{name}</div>
                      <div className="wm-conv-last">
                        {conv.tinNhanCuoi || "Chưa có tin nhắn"}
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
                    {activePartner?.email || activePartner?.vaiTro || ""}
                  </div>
                </div>
              </header>

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
                      <div
                        key={m.tinNhanId}
                        className={`wm-msg-row ${isMe ? "me" : ""}`}
                      >
                        <div>
                          {!isMe && (
                            <div className="wm-msg-sender">
                              {m.nguoiGui?.hoTen || "Người dùng"}
                            </div>
                          )}
                          <div className={`wm-msg-bubble ${isMe ? "me" : "them"}`}>
                            {m.noiDung}
                          </div>
                          <div className="wm-msg-time" style={{ textAlign: isMe ? "right" : "left" }}>
                            {formatTime(m.ngayGui)}
                            {m._pending && " • Đang gửi…"}
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
                  onChange={(e) => setDraft(e.target.value)}
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
