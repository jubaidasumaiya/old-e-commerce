import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

 // 🔐 LOGIN FUNCTION (আপডেট করা হলো)
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5001/admin/login", {
        email: email.trim(),
        password: password.trim(),
      });

      // ✅ ফিক্স: টোকেনের সাথে এডমিন স্ট্যাটাসও সেভ করা হলো যাতে ProtectedRoute আটকে না দেয়
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", "true"); 

      navigate("/admin/orders");
    } catch (err) {
      alert("Invalid login ❌");
      console.log(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>🔐 Admin Login</h2>

        {/* EMAIL */}
        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            style={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eye}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

// 🎨 STYLES
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f4f4f4",
  },
  box: {
    padding: "30px",
    background: "white",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    textAlign: "center",
    width: "300px",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "black",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  eye: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  },
};

export default AdminLogin;