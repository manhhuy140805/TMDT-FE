import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8080/chat";

/**
 * Hook quản lý kết nối Socket.IO cho chat realtime.
 * - Tự connect khi có userId, disconnect khi unmount.
 * - Expose socket instance + trạng thái connected.
 */
const useSocket = (userId) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      query: { userId: String(userId) },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("[socket] connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("[socket] connect_error:", err.message);
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [userId]);

  return { socket: socketRef, connected };
};

export default useSocket;
