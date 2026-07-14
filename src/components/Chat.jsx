import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// ✅ এই নতুন লাইনটা দিয়ে রিপ্লেস করো:
const socket = io.connect("https://old-e-commerce-4.onrender.com", {
  transports: ["websocket", "polling"]
});

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false); // ➕ চ্যাটবক্স খোলা না বন্ধ তা ট্র্যাক করার জন্য
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [roomId, setRoomId] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 🔑 কাস্টমারের জন্য একটি ইউনিক রুম আইডি তৈরি বা রিড করা
    let savedRoomId = localStorage.getItem("customer_chat_room");
    if (!savedRoomId) {
      savedRoomId = "room_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("customer_chat_room", savedRoomId);
    }
    setRoomId(savedRoomId);

    // সকেটে এই রুমে জয়েন করা
    socket.emit("join_room", savedRoomId);

    // ডাটাবেজ থেকে কেবল এই রুমের পুরনো চ্যাট আনা
    const fetchChat = async () => {
      try {
        const res = await fetch(`https://old-e-commerce-4.onrender.com/api/messages/${savedRoomId}`);
        const data = await res.json();
        setChatHistory(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChat();

    // লাইভ মেসেজ রিসিভ করা
    socket.on("receive_message", (data) => {
      setChatHistory((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      const messageData = {
        roomId: roomId, // ➕ রুম আইডি পাঠানো হচ্ছে
        text: message,
        sender: "Customer",
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("send_message", messageData);
      setMessage("");
    }
  };

  // 🔹 চ্যাটবক্স যদি বন্ধ থাকে, তবে শুধু একটা গোল চ্যাট বাটন দেখাবে
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#1890ff", color: "#fff", border: "none", cursor: "pointer", fontSize: "24px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}
      >
        💬
      </button>
    );
  }

  // 🔹 চ্যাটবক্স খোলা থাকলে পুরো উইন্ডো দেখাবে
  return (
    <div style={{ width: "320px", height: "400px", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "#1890ff", color: "#fff", padding: "10px", display: "flex", justifyContent: "between", alignItems: "center", fontWeight: "bold" }}>
        <span>Live Support 💬</span>
        <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px", marginLeft: "auto" }}>✖</button>
      </div>
      <div style={{ flex: 1, padding: "10px", overflowY: "auto", backgroundColor: "#f9f9f9" }}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "Customer" ? "right" : "left", margin: "8px 0" }}>
            <span style={{ backgroundColor: msg.sender === "Customer" ? "#1890ff" : "#e4e6eb", color: msg.sender === "Customer" ? "#fff" : "#333", padding: "6px 12px", borderRadius: "10px", display: "inline-block", maxWidth: "70%" }}>
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", padding: "5px", borderTop: "1px solid #eee" }}>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type..." style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }} />
        <button type="submit" style={{ padding: "8px 12px", backgroundColor: "#1890ff", color: "#fff", border: "none", borderRadius: "4px", marginLeft: "4px", cursor: "pointer" }}>Send</button>
      </form>
    </div>
  );
};

export default Chat;