import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👁️ আইকন ইম্পোর্ট করা হলো
import "./Auth.css";

// 🎯 এই লাইনটি মিসিং ছিল! (ডায়নামিক ইউআরএল লজিক)
const BACKEND_BASE_URL = import.meta.env.DEV 
  ? `http://${window.location.hostname}:5001` 
  : "https://old-e-commerce-4.onrender.com";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 পাসওয়ার্ড দেখানোর স্টেট
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/api/auth/login`, formData);
      localStorage.setItem("customerToken", res.data.token);
      localStorage.setItem("customerUser", JSON.stringify(res.data.user));
      alert(res.data.message);
      navigate("/");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back! 👋</h2>

        <form onSubmit={handleLogin}>
          
          {/* ইমেইল এড্রেস */}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
          </div>
          
          {/* পাসওয়ার্ড এবং ফরগট লিংক */}
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Enter password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* 🔗 নতুন সিএসএস ক্লাস সহ ফরগট পাসওয়ার্ড লিংক */}
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* লগইন বাটন */}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;