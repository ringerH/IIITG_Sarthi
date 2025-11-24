import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/config";
import { io } from "socket.io-client";
import "../styles/chat.css"; 
import "../App.css"; 

const RIDE_SERVICE_URL = import.meta.env.VITE_RIDE_URL || "http://localhost:5003";

export default function Chat() {
  const { id } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // --- No logic changes below ---
  const localUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}") || {}
      : {};
  const userId = localUser._id || localUser.id;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      setError(null);
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
        setError(err.response?.data?.message || err.message || "Failed to load chat.");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
    // Add this line to get the correct URL from environment variables
   
    const socket = io(RIDE_SERVICE_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
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

    socket.on("chatCreated", (info) => {
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
      const msg = {
        chatId: id,
        senderId: userId,
        text,
        createdAt: new Date().toISOString(),
      };
      try {
        socketRef.current?.emit("message", msg);
      } catch (e) {}

      await api.post(`/chats/${id}/messages`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  
  // --- End of logic ---

  // Handle "Enter" key to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents new line
      handleSend();
    }
  };
  
  // Helper to format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="profile-page-container">
      <h2 className="page-title">Chat</h2>
      <div className="chat-window">
        {loading ? (
          <div className="chat-window-empty">Loading chat...</div>
        ) : error ? (
          <div className="chat-window-empty error-message">{error}</div>
        ) : messages.length === 0 ? (
          <div className="chat-window-empty">No messages yet.</div>
        ) : (
          messages.map((m, i) => (
            <div
              key={m._id || i} // Use _id if available, fallback to index
              className={`message-row ${
                m.senderId === String(userId)
                  ? "message-row-sent"
                  : "message-row-received"
              }`}
            >
              <div
                className={`message-bubble ${
                  m.senderId === String(userId)
                    ? "message-bubble-sent"
                    : "message-bubble-received"
                }`}
              >
                <div className="message-text">{m.text}</div>
                <div className="message-timestamp">
                  {formatTimestamp(m.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown} // Send on Enter
          placeholder="Type a message"
          className="form-input" // Re-use existing class
        />
        <button
          onClick={handleSend}
          className="btn btn-primary page-action" // Re-use existing classes
          disabled={!text.trim()} // Visually disable button
        >
          Send
        </button>
      </div>
    </div>
  );
}