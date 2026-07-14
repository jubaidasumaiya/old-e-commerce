import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./AdminInbox.css";

// ✅ এই নতুন লাইনটা দিয়ে রিপ্লেস করো:
const socket = io.connect("https://old-e-commerce-4.onrender.com", {
  transports: ["websocket", "polling"]
});

const AdminInbox = () => {
  const [activeRoom, setActiveRoom] = useState(""); // 👈 কোন কাস্টমারের চ্যাট এখন খোলা
  const [roomsList, setRoomsList] = useState([]);    // 👈 কতজন কাস্টমার চ্যাট করছে তাদের লিস্ট
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  // ১. সকেট নোটিফিকেশন লিসেনার (নতুন কোনো কাস্টমার মেসেজ দিলে লিস্ট আপডেট হবে)
  useEffect(() => {
    socket.on("new_chat_notification", (data) => {
      // যদি এই রুমটি আমাদের লিস্টে না থাকে, তবে লিস্টে যোগ করো
      setRoomsList((prev) => {
        if (!prev.includes(data.roomId)) {
          return [...prev, data.roomId];
        }
        return prev;
      });

      // যদি অ্যাডমিন বর্তমানে সেই রুমে থাকে, তবে লাইভ মেসেজ স্ক্রিনে দেখাও
      if (data.roomId === activeRoom) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => socket.off("new_chat_notification");
  }, [activeRoom]);

  // ২. অ্যাডমিন যখন কোনো নির্দিষ্ট কাস্টমার ট্যাবে ক্লিক করবে
  const handleRoomSelect = async (roomId) => {
    setActiveRoom(roomId);
    socket.emit("join_room", roomId); // অ্যাডমিন ওই কাস্টমারের সকেট রুমে প্রবেশ করল

    // ডাটাবেজ থেকে ওই নির্দিষ্ট কাস্টমারের চ্যাট হিস্ট্রি লোড করা
    try {
      const res = await fetch(`https://old-e-commerce-4.onrender.com/api/messages/${roomId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (replyText.trim() !== "" && activeRoom) {
      const messageData = {
        roomId: activeRoom, // 👈 একটিভ কাস্টমারের রুমে রিপ্লাই যাবে
        text: replyText,
        sender: "Admin",
        time: new Date().toLocaleTimeString(),
      };

      socket.emit("send_message", messageData);
      setReplyText("");
    }
  };

  return (
    <div className="admin-inbox-container">
      {/* বাম পাশের সাইডবার: এখানে সব কাস্টমারের লিস্ট চলে আসবে স্বয়ংক্রিয়ভাবে */}
      <div className="sidebar">
        <h3>Active Customers 👥</h3>
        {roomsList.length === 0 ? <p style={{color: '#888', fontSize: '14px'}}>No active chats</p> : 
          roomsList.map((room, idx) => (
            <div 
              key={idx} 
              className={`user-token ${activeRoom === room ? "active" : ""}`}
              onClick={() => handleRoomSelect(room)}
            >
              👤 Client ({room.replace("room_", "")})
            </div>
          ))
        }
      </div>

      {/* ডান পাশের মেইন চ্যাট উইন্ডো */}
      <div className="chat-window">
        {activeRoom ? (
          <>
            <div className="chat-header">
              <h4>Chatting with: {activeRoom}</h4>
              <small>● Real-time Room Session</small>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => {
                const isAdmin = msg.sender === "Admin";
                return (
                  <div key={index} className="message-wrapper" style={{ justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                    <div className="message-bubble" style={{ backgroundColor: isAdmin ? "#1890ff" : "#fff", color: isAdmin ? "#fff" : "#333", borderTopRightRadius: isAdmin ? "0px" : "16px", borderTopLeftRadius: isAdmin ? "16px" : "0px" }}>
                      <strong>{msg.sender}</strong>
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendReply} className="chat-input-form">
              <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type reply..." />
              <button type="submit">Reply 🚀</button>
            </form>
          </>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#888" }}>
            👈 Select a customer from sidebar to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInbox;