import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

// 👈 ফিক্স: পোর্ট ৫০০০ থেকে পরিবর্তন করে ৫০০১ করা হলো
const BACKEND_URL = "http://localhost:5001";

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    paymentMethod: "cod",
  });

  // টোটাল ক্যালকুলেশন লজিক
  const totalAmount = cartItems.reduce((sum, item) => {
    const itemPrice = item["Selling Price"] || item.price || 0;
    const cleanPrice = typeof itemPrice === "string" 
      ? parseFloat(itemPrice.replace(/[^\d.]/g, "")) 
      : parseFloat(itemPrice);
      
    return sum + (cleanPrice || 0) * (item.quantity || 1);
  }, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    const { name, email, address, phone, paymentMethod } = form;

    if (!name.trim() || !email.trim() || !address.trim() || !phone.trim()) {
      alert("Please fill in all required fields!");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setIsProcessing(true);

    // প্রতিটি অর্ডারের জন্য একটি ইউনিক ট্রানজেকশন আইডি তৈরি করা হলো
    const uniqueTrxId = `TXN_${Date.now()}`;

    const orderDetails = {
      customer: { name, email, phone, address },
      items: cartItems.map((item) => {
        const itemPrice = item["Selling Price"] || item.price || 0;
        const cleanPrice = typeof itemPrice === "string"
          ? parseFloat(itemPrice.replace(/[^\d.]/g, ""))
          : parseFloat(itemPrice);

        return {
          sku: item.SKU || item.sku || "N/A",
          name: item.Product || item.name,
          price: cleanPrice || 0,
          quantity: item.quantity || 1,
        };
      }),
      totalAmount,
      paymentMethod: paymentMethod === "online" ? "SSLCommerz" : "COD",
      trxId: uniqueTrxId,
      date: new Date().toISOString(),
    };

    try {
      // পেমেন্ট মেথড অনুযায়ী আলাদা এন্ডপয়েন্টে হিট করবে
      const endpoint = paymentMethod === "cod" ? "/cod-order" : "/init";
      
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        alert("Server returned invalid response.");
        setIsProcessing(false);
        return;
      }

      if (!res.ok) {
        alert(data.error || "Server error. Try again!");
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === "cod") {
        clearCart();
        navigate("/order-success", { state: orderDetails });
      } else if (paymentMethod === "online") {
        if (data.url) {
          // 🚀 এখানে ইউজারকে SSLCommerz-এর অফিশিয়াল পেমেন্ট পেজে রিডাইরেক্ট করা হচ্ছে
          window.location.href = data.url;
        } else {
          alert("Payment initiation failed. Try again!");
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="order-summary">
        <h3>🧾 Order Summary</h3>
        {cartItems.length === 0 && <p>Your cart is empty.</p>}
        {cartItems.map((item, idx) => {
          const itemPrice = item["Selling Price"] || item.price || 0;
          const cleanPrice = typeof itemPrice === "string"
            ? parseFloat(itemPrice.replace(/[^\d.]/g, ""))
            : parseFloat(itemPrice);

          return (
            <p key={idx}>
              {item.Product || item.name} × {item.quantity} = ৳
              {(cleanPrice || 0) * (item.quantity || 1)}
            </p>
          );
        })}
        <h3 className="total">Total: ৳{totalAmount}</h3>
      </div>

      <form className="checkout-form" onSubmit={handleOrder}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Full Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <div className="payment-method">
          <h3>💰 Payment Method</h3>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={form.paymentMethod === "cod"}
              onChange={handleChange}
            />
            Cash on Delivery
          </label>

          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={form.paymentMethod === "online"}
              onChange={handleChange}
            />
            Online Payment (bKash, Nagad, Cards)
          </label>
        </div>

        {form.paymentMethod === "online" && (
          <div className="payment-box">
            <h4>🔒 Secure Payment Gateway</h4>
            <p style={{ fontSize: "0.9rem", color: "#555", margin: "5px 0" }}>
              You will be redirected to SSLCommerz secure page to complete your payment using bKash, Nagad, Rocket or Cards.
            </p>
            <div className="payment-options" style={{ opacity: 0.7, pointerEvents: "none" }}>
              <img src="https://seeklogo.com/images/B/bkash-logo-041A88A9D0-seeklogo.com.png" alt="Bkash" style={{ width: "50px", marginRight: "10px" }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Nagad_Logo.svg/2560px-Nagad_Logo.svg.png" alt="Nagad" style={{ width: "50px" }} />
            </div>
          </div>
        )}

        <button type="submit" className="btn-place-order" disabled={isProcessing}>
          {isProcessing ? "⏳ Redirecting to Payment..." : "✅ Place Order"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;