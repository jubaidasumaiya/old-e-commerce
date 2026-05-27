import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const { state } = useLocation();
  const [order, setOrder] = useState(state || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 👈 ফিক্স ১: ইউআরএল (URL) থেকে tran_id কুয়েরি প্যারামিটার রিড করা
    const searchParams = new URLSearchParams(window.location.search);
    const tranId = searchParams.get("tran_id");

    // যদি COD হয় তবে স্টেট থেকে trxId নেবে, আর অনলাইন পেমেন্ট হলে URL থেকে tran_id নেবে
    const targetTrxId = order?.trxId || tranId;

    if (!targetTrxId) {
      setError("No order details found.");
      return;
    }

    // 👈 ফিক্স ২: ট্রানজেকশন আইডি দিয়ে ডাটাবেস থেকে একদম লেটেস্ট পেইড (Paid) অর্ডার ডাটা ফেচ করা
    axios
      .get(`http://localhost:5001/order/${targetTrxId}`)
      .then((res) => {
        if (res.data) {
          setOrder(res.data);
        } else {
          setError("Order not found in database.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load order from server.");
      });
  }, []);

  if (error) {
    return (
      <div className="order-success-container">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <Link to="/">🏠 Back to Home</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-success-container">
        <h2>⏳ Loading order details...</h2>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <h2>🎉 Order Placed Successfully!</h2>

      <div className="customer-details">
        <p><b>Name:</b> {order.customer?.name}</p>
        <p><b>Email:</b> {order.customer?.email}</p>
        <p><b>Phone:</b> {order.customer?.phone}</p>
        <p><b>Address:</b> {order.customer?.address}</p>
      </div>

      <div className="payment-details">
        <p><b>Payment Method:</b> {order.paymentMethod}</p>
        <p><b>Transaction ID:</b> {order.trxId}</p>
        <p><b>Order Status:</b> <span className={`status-${order.status?.toLowerCase()}`}>{order.status}</span></p>
      </div>

      <h3>📦 Items Ordered</h3>
      <ul>
        {order.items?.map((item, idx) => (
          <li key={idx}>
            {item.name} × {item.quantity} = ৳{(item.price || 0) * (item.quantity || 1)}
          </li>
        ))}
      </ul>

      <h3 className="total">Total Amount: ৳{order.totalAmount}</h3>

      <Link to="/" className="btn-home">🏠 Back to Home</Link>
    </div>
  );
};

export default OrderSuccess;