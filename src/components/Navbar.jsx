import React from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./Navbar.css";
import { FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  
  // 💾 LocalStorage থেকে কাস্টমারের লগইন ডেটা চেক করা
  const customerToken = localStorage.getItem("customerToken");
  const savedUser = localStorage.getItem("customerUser") ? JSON.parse(localStorage.getItem("customerUser")) : null;

  // 🚪 লগআউট হ্যান্ডলার
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerUser");
      alert("Logged out successfully! 👋");
      navigate("/login");
      window.location.reload(); // হেডার রিফ্রেশ করে লগইন বাটন ফিরিয়ে আনার জন্য
    }
  };

  return (
    <nav className="navbar">
      {/* লোগোতে ক্লিক করলে যেন হোমপেজে যায় */}
      <h1 className="logo">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          Complex Solution BD
        </Link>
      </h1>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/cart">Cart <FaShoppingCart /></Link></li>

        {/* 🔐 লগইন কন্ডিশন চেক (কোটেশন ছাড়া savedUser ভ্যারিয়েবল ব্যবহার করা হলো) */}
        {customerToken && savedUser ? (
          <>
            {/* কাস্টমার লগইন থাকলে My Orders, নাম এবং Logout বাটন দেখাবে */}
            <li><Link to="/my-orders">My Orders</Link></li>
            <li className="nav-user-name">
  <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
    👋 {savedUser.name}
  </Link>
</li>
            <li>
              <button onClick={handleLogout} className="nav-logout-btn">
                Logout
              </button>
            </li>
            
          </>
        ) : (
          <>
            {/* কাস্টমার লগইন না থাকলে Login এবং Register বাটন দেখাবে */}
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;