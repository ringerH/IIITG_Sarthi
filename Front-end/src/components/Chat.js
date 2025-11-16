import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/config";
import { io } from "socket.io-client";

export default function Chat() {
  const { id } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const localUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}") || {}
      : {};
  const userId = localUser._id || localUser.id;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const r = await api.get(`/chats/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.data && r.data.chat) {
          setChat(r.data.chat);
          setMessages(r.data.chat.messages || []);
        }
      } catch (err) {
        console.error("Error fetching chat:", err);
      }
    };

    fetchChat();

    // connect socket
    const socket = io("http://localhost:5003", { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      // join chat room and user room
      try {
        if (id) socket.emit("join", id);
        if (userId) socket.emit("joinUser", userId);
      } catch (e) {}
    });

    socket.on("message", (payload) => {
      if (!payload) return;
      if (payload.chatId && payload.chatId === id) {
        setMessages((m) => [...m, payload]);
      }
    });

    // chatCreated notifications could be handled here if needed
    socket.on("chatCreated", (info) => {
      // if the created chat is the current chat we can fetch messages
      if (info?.chatId === id) {
        api
          .get(`/chats/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((r) => {
            if (r.data?.chat) setMessages(r.data.chat.messages || []);
          });
      }
    });

    return () => {
      try {
        socket.disconnect();
      } catch (e) {}
    };
  }, [id, userId, token]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text || text.trim() === "") return;
    const payload = { text };
    try {
      // Optimistically send via socket
      const msg = {
        chatId: id,
        senderId: userId,
        text,
        createdAt: new Date().toISOString(),
      };
      try {
        socketRef.current?.emit("message", msg);
      } catch (e) {}

      // Persist via REST for reliability
      await api.post(`/chats/${id}/messages`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 20 }}>
      <h2>Chat</h2>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          minHeight: 300,
          maxHeight: 500,
          overflow: "auto",
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: "#666" }}>No messages yet.</div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: 8,
                display: "flex",
                flexDirection:
                  m.senderId === String(userId) ? "row-reverse" : "row",
              }}
            >
              <div
                style={{
                  background:
                    m.senderId === String(userId) ? "#e6f7ff" : "#f3f3f3",
                  padding: 8,
                  borderRadius: 6,
                  maxWidth: "70%",
                }}
              >
                <div style={{ fontSize: 13, color: "#222" }}>{m.text}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
                  {new Date(m.createdAt || m.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd",
          }}
        />
        <button
          onClick={handleSend}
          className="btn page-action"
          style={{ marginLeft: 8 }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
