import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("admin");
  const token = localStorage.getItem("token");

  // 🔐 যদি এডমিন না হয় বা টোকেন না থাকে, তবে তাকে সরাসরি লগইন পেজে (/admin) পাঠিয়ে দেবে
  if (!isAdmin || !token) {
    return <Navigate to="/admin" replace />;
  }

  // আর যদি লগইন করা থাকে, তবেই সে ভেতরের পেজটি দেখতে পাবে
  return children;
};

export default ProtectedRoute;