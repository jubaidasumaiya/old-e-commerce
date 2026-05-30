import React, { useState, useEffect } from "react"; // 👈 useEffect যুক্ত করা হলো
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // ⏱️ টাইমারের জন্য স্টেট (৫ মিনিট = ৩০০ সেকেন্ড)
  const [timeLeft, setTimeLeft] = useState(300);

  // ⏱️ টাইমার কাউন্টডাউন করার জন্য ইফেক্ট
  useEffect(() => {
    // শুধুমাত্র ২ নম্বর ধাপে (OTP পেজে) এবং সময় বাকি থাকলে টাইমার চলবে
    if (step !== 2 || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // ক্লিনআপ ফাংশন (মেমোরি লিক বন্ধ করতে)
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  // ⏱️ সেকেন্ডকে MM:SS ফরম্যাটে রূপান্তর করার ফাংশন
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // 📧 ধাপ ১: ওটিপি পাঠানো
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://192.168.0.100:5001/api/auth/forgot-password", { email });
      alert(res.data.message);
      setTimeLeft(300); // ⏱️ ওটিপি সফলভাবে গেলে টাইমার আবার ৩০০ সেকেন্ডে রিসেট হবে
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔑 ধাপ ২: পাসওয়ার্ড রিসেট করা
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // টাইমার শেষ হয়ে গেলে সাবমিট ব্লক করা
    if (timeLeft <= 0) {
      alert("OTP has expired! Please request a new one. ❌");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://192.168.0.100:5001/api/auth/reset-password", { email, otp, newPassword });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "80px auto", padding: "30px", backgroundColor: "#f8f9fa", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", fontFamily: "'Poppins', sans-serif" }}>
      
      {step === 1 ? (
        /* 📧 STEP 1 FORM: ENTER EMAIL */
        <form onSubmit={handleSendOTP}>
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>🔒 Forgot Password?</h3>
          <p style={{ fontSize: "14px", color: "#64748b", textAlign: "center", marginBottom: "20px" }}>Enter your registered email below to receive a 6-digit verification code.</p>
          
          <div style={{ marginBottom: "15px" }}>
            <input 
              type="email" 
              placeholder="Enter your Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", background: "#007bff", color: "white", border: "none", padding: "11px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            {loading ? "Sending OTP..." : "Send Reset Code 📩"}
          </button>
        </form>
      ) : (
        /* 🔑 STEP 2 FORM: ENTER OTP & NEW PASSWORD */
        <form onSubmit={handleResetPassword}>
          <h3 style={{ textAlign: "center", marginBottom: "10px" }}>🔑 Reset Password</h3>
          
          {/* ⏱️ লাইভ কাউন্টডাউন টাইমার সেকশন */}
          <div style={{ textAlign: "center", marginBottom: "20px", fontSize: "14px", fontWeight: "500" }}>
            {timeLeft > 0 ? (
              <span style={{ color: "#e11d48", backgroundColor: "#ffe4e6", padding: "4px 10px", borderRadius: "20px" }}>
                ⏳ Time Remaining: {formatTime(timeLeft)}
              </span>
            ) : (
              <span style={{ color: "#7f1d1d", backgroundColor: "#fee2e2", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold" }}>
                ❌ OTP Expired!
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "5px" }}>Enter 6-Digit OTP:</label>
            <input 
              type="text" 
              maxLength="6" 
              required 
              disabled={timeLeft <= 0} // টাইমার শেষ হলে ইনপুট লক হবে
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", textAlign: "center", fontSize: "18px", letterSpacing: "5px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "5px" }}>Enter New Password:</label>
            <div className="password-wrapper" style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                minLength="6" 
                required 
                disabled={timeLeft <= 0}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 40px 10px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
              <span 
                className="password-toggle-icon" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", cursor: "pointer", color: "#64748b" }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* কাস্টম বাটন: টাইমার থাকলে সাবমিট হবে, শেষ হয়ে গেলে রিসেন্ড অপশন আসবে */}
          {timeLeft > 0 ? (
            <button type="submit" disabled={loading} style={{ width: "100%", background: "#28a745", color: "white", border: "none", padding: "11px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              {loading ? "Resetting..." : "Confirm New Password 🎉"}
            </button>
          ) : (
            <button type="button" onClick={handleSendOTP} disabled={loading} style={{ width: "100%", background: "#475569", color: "white", border: "none", padding: "11px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
              {loading ? "Sending..." : "Resend New OTP 🔄"}
            </button>
          )}
        </form>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <span onClick={() => navigate("/login")} style={{ color: "#007bff", cursor: "pointer", fontSize: "14px" }}>Back to Login</span>
      </div>
    </div>
  );
};

export default ForgotPassword;