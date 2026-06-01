import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👁️ আইকন ইম্পোর্ট করা হলো
import "./Auth.css";

// 🎯 ডায়নামিক ইউআরএল লজিক (লোকাল এবং লাইভ রেন্ডার সার্ভার হ্যান্ডেল করবে)
const BACKEND_BASE_URL = import.meta.env.DEV 
  ? `http://${window.location.hostname}:5001` 
  : "https://old-e-commerce-4.onrender.com";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 পাসওয়ার্ড দেখানোর স্টেট
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🎯 এখানে এখন ডায়নামিক ইউআরএল ব্যবহার করা হয়েছে
      const res = await axios.post(`${BACKEND_BASE_URL}/api/auth/register`, formData);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account 🎉</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            {/* 👁️ পাসওয়ার্ড ইনপুট র‍্যাপার */}
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} // 👈 স্টেট অনুযায়ী টাইপ চেঞ্জ হবে
                name="password" 
                placeholder="Create a password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;