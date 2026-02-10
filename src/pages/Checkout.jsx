import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const BACKEND_URL = `https://vitejsvitenabmb9fe-plm4--5173--cf284e50.local-credentialless.webcontainer.io`;

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    paymentMethod: "cod",
    trxId: "",
  });

  const totalAmount = cartItems.reduce(
    (sum, item) =>
      sum + parseFloat(item.price || 0) * (item.quantity || 1),
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    const { name, email, address, phone, paymentMethod, trxId } = form;

    if (!name || !email || !address || !phone) {
      alert("Please fill in all required fields!");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderDetails = {
      customer: { name, email, phone, address },
      items: cartItems.map((item) => ({
        sku: item.SKU || item.sku,
        name: item.Product || item.name,
        price: parseFloat(
          (item["Selling Price"] || item.price || 0)
            .toString()
            .replace(/[^\d.]/g, "")
        ),
        quantity: item.quantity || 1,
      })),
      totalAmount,
      paymentMethod,
      trxId: paymentMethod === "online" ? trxId || `tran_${Date.now()}` : "COD",
      date: new Date().toISOString(),
    };

    try {
      const endpoint = paymentMethod === "cod" ? "/cod-order" : "/init";
      const res = await fetch(`https://vitejsvitenabmb9fe-plm4--5173--cf284e50.local-credentialless.webcontainer.io${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        alert("Server returned invalid response.");
        return;
      }

      if (!res.ok) {
        alert(data.error || "Server error. Try again!");
        return;
      }

      if (paymentMethod === "cod") {
        clearCart();
        navigate("/order-success", { state: orderDetails });
      } else if (paymentMethod === "online") {
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Payment initiation failed. Try again!");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="order-summary">
        <h3>🧾 Order Summary</h3>
        {cartItems.length === 0 && <p>Your cart is empty.</p>}
        {cartItems.map((item, idx) => (
          <p key={idx}>
            {item.Product || item.name} × {item.quantity} = ৳
            {parseFloat(
              (item["Selling Price"] || item.price || 0)
                .toString()
                .replace(/[^\d.]/g, "")
            ) * (item.quantity || 1)}
          </p>
        ))}
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
            Online Payment
          </label>
        </div>

        {form.paymentMethod === "online" && (
          <div className="payment-box">
            <h4>Send Money To (for test purpose):</h4>
            <div className="payment-options">
              <div className="payment-item">
                <img
                  src="https://seeklogo.com/images/B/bkash-logo-041A88A9D0-seeklogo.com.png"
                  alt="Bkash"
                />
                <p>01912922241</p>
              </div>
              <div className="payment-item">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Nagad_Logo.svg/2560px-Nagad_Logo.svg.png"
                  alt="Nagad"
                />
                <p>01791712766</p>
              </div>
            </div>

            <input
              type="text"
              name="trxId"
              placeholder="Enter Transaction ID (Optional)"
              value={form.trxId}
              onChange={handleChange}
            />
          </div>
        )}

        <button type="submit" className="btn-place-order">
          ✅ Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;