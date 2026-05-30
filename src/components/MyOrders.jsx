import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderTracking from "../components/OrderTracking"; // 🎯 লাইভ ট্র্যাকিং বার

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 🔄 ১. লোকাল স্টোরেজ থেকে লগইন করা কাস্টমারের ডেটা নেওয়া হচ্ছে
    const storedUser = localStorage.getItem("user");
    

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const userEmail = user.email; // 📧 ডাইনামিক আসল ইমেইল আইডি

        // 🔗 ২. ব্যাকএন্ড থেকে কাস্টমারের আসল অর্ডার হিস্ট্রি নিয়ে আসা
        axios.get(`http://localhost:5001/api/my-orders/${userEmail}`)
          .then(res => {
            setOrders(res.data);
            setLoading(false);
          })
          .catch(err => {
            console.error("Fetch orders error:", err);
            setError("Failed to load orders ❌");
            setLoading(false);
          });
      } catch (e) {
        console.error("JSON Parse Error:", e);
        setError("Something went wrong with user session ❌");
        setLoading(false);
      }
    } else {
      // যদি কাস্টমার লগইন করা না থাকে
      setError("Please log in to view your order history! ⚠️");
      setLoading(false);
    }
  }, []);

  // ⏳ লোডিং অবস্থা দেখালে ইউজার বুঝবে ডেটা আসছে
  if (loading) return <div style={{ textAlign: "center", padding: "50px", fontSize: "18px", fontWeight: "500" }}>Loading your orders... ⏳</div>;
  
  // ⚠️ কোনো এরর বা লগইন না থাকলে এই মেসেজ দেখাবে
  if (error) return <div style={{ textAlign: "center", padding: "50px", color: "#e11d48", fontSize: "16px", fontWeight: "bold" }}>{error}</div>;

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
            
            {/* 🧾 ইনভয়েস হেডার সেকশন */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "15px", fontSize: "14px" }}>
              <span><b>Invoice:</b> #{order.invoiceNumber}</span>
              <span><b>Total Amount:</b> ৳{order.totalAmount}</span>
              <span style={{ color: "#007bff", fontWeight: "bold" }}>{order.paymentMethod}</span>
            </div>

            {/* 🛍️ অর্ডারের ভেতরের আইটেমগুলোর লিস্ট */}
            <div style={{ marginBottom: "20px", fontSize: "14px", color: "#475569" }}>
              <b>Items:</b> {order.items && order.items.length > 0 
                ? order.items.map(item => `${item.name} (${item.quantity}pcs)`).join(", ") 
                : "Product details unavailable"}
            </div>
            
            {/* 🎯 লাইভ ট্র্যাকিং বার কম্পোনেন্ট */}
            <OrderTracking currentStatus={order.status} /> 
            
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;