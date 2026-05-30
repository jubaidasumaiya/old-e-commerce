import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const savedUser = localStorage.getItem("customerUser") ? JSON.parse(localStorage.getItem("customerUser")) : null;

  // 📝 পাসওয়ার্ড চেঞ্জের স্টেটসমূহ
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!savedUser) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Please login to view your profile! 🔑</h2>
        <button onClick={() => navigate("/login")} style={{ background: "#007bff", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", marginTop: "15px" }}>Go to Login</button>
      </div>
    );
  }

  // 🚀 পাসওয়ার্ড সাবমিট হ্যান্ডলার
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put("http://192.168.0.100:5001/api/auth/change-password", {
        email: savedUser.email,
        currentPassword,
        newPassword,
      });
      
      alert(res.data.message);
      // পাসওয়ার্ড চেঞ্জ হলে সেফটির জন্য লগআউট করিয়ে দেওয়া ভালো
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerUser");
      navigate("/login");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update password ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "30px", backgroundColor: "#f8f9fa", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", fontFamily: "'Poppins', sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: "25px" }}>👤 My Profile</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div style={{ background: "white", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "block" }}>FULL NAME</span>
          <strong style={{ fontSize: "16px", color: "#1e293b" }}>{savedUser.name}</strong>
        </div>

        <div style={{ background: "white", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "block" }}>EMAIL ADDRESS</span>
          <strong style={{ fontSize: "16px", color: "#1e293b" }}>{savedUser.email}</strong>
        </div>
      </div>

      {/* 🎛️ পাসওয়ার্ড ফর্ম টগল বাটন */}
      <button 
        onClick={() => setShowForm(!showForm)}
        style={{ width: "100%", background: showForm ? "#64748b" : "#28a745", color: "white", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", marginTop: "20px", fontWeight: "600" }}
      >
        {showForm ? "✕ Cancel Password Change" : "🔒 Change Password"}
      </button>

      {/* 📉 পাসওয়ার্ড পরিবর্তনের লাইভ ফর্ম */}
      {showForm && (
        <form onSubmit={handlePasswordChange} style={{ marginTop: "20px", background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>Current Password:</label>
            <input 
              type="password" 
              required 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>New Password:</label>
            <input 
              type="password" 
              required 
              minLength="6"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", background: "#007bff", color: "white", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            {loading ? "Updating..." : "Confirm Update 🚀"}
          </button>
        </form>
      )}

      <button 
        onClick={() => navigate("/my-orders")} 
        style={{ width: "100%", background: "none", border: "2px solid #007bff", color: "#007bff", padding: "11px", borderRadius: "8px", cursor: "pointer", marginTop: "15px", fontWeight: "bold" }}
      >
        View My Orders 📋
      </button>
    </div>
  );
};

export default CustomerProfile;