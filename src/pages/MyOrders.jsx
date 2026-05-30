import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderTracking from "../components/OrderTracking"; 

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 🔄 লোকাল স্টোরেজ থেকে কাস্টমারের ডেটা নেওয়া
    const storedUser = localStorage.getItem("customerUser");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const userEmail = user.email; 

        if (userEmail) {
          // 🔗 ব্যাকএন্ড থেকে কাস্টমারের আসল অর্ডার হিস্ট্রি নিয়ে আসা
          axios.get(`http://localhost:5001/api/my-orders/${userEmail.trim()}`)
            .then(res => {
              setOrders(res.data);
              setLoading(false);
            })
            .catch(err => {
              console.error("Fetch orders error:", err);
              setError("Failed to load orders ❌");
              setLoading(false);
            });
        } else {
          setError("Email not found in your session! ❌");
          setLoading(false);
        }
      } catch (e) {
        console.error("JSON Parse Error:", e);
        setError("Something went wrong with user session ❌");
        setLoading(false);
      }
    } else {
      setError("Please log in to view your order history! ⚠️");
      setLoading(false);
    }
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: "50px", fontSize: "18px" }}>Loading your orders... ⏳</div>;
  if (error) return <div style={{ textAlign: "center", padding: "50px", color: "#e11d48", fontWeight: "bold" }}>{error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "'Poppins', sans-serif" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>📋 My Order History ({orders.length})</h2>
      
      {orders.length === 0 ? (
        <p style={{ textAlign: "center", color: "#64748b", marginTop: "40px", fontSize: "16px" }}>
          You haven't placed any orders yet! 🛍️
        </p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={{ border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", marginBottom: "25px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            
            {/* 🧾 ইনভয়েস হেডার */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "15px", fontSize: "14px" }}>
              <span><b>Invoice:</b> #{order.invoiceNumber}</span>
              <span><b>Total Amount:</b> ৳{order.totalAmount}</span>
              <span style={{ color: "#007bff", fontWeight: "bold" }}>{order.paymentMethod}</span>
            </div>

            {/* 🛍️ আইটেম লিস্ট */}
            <div style={{ marginBottom: "20px", fontSize: "14px", color: "#475569" }}>
              <b>Items:</b> {order.items && order.items.length > 0 
                ? order.items.map(item => `${item.name} (${item.quantity}pcs)`).join(", ") 
                : "Product details unavailable"}
            </div>
            
            {/* 🎯 লাইভ ট্র্যাকিং বার */}
            <OrderTracking currentStatus={order.status} /> 
            
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;