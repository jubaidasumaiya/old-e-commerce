import React from "react";
import { useLocation, Link } from "react-router-dom";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state;

  if (!order) {
    return (
      <div className="order-success-container">
        <h2>No order details found!</h2>
        <Link to="/">Go back to Home</Link>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <h2>🎉 Your Order Has Been Placed Successfully!</h2>
      <h3>Order Summary</h3>
      <p>
        <strong>Name:</strong> {order.customer.name}
      </p>
      <p>
        <strong>Address:</strong> {order.customer.address}
      </p>
      <p>
        <strong>Phone:</strong> {order.customer.phone}
      </p>
      <p>
        <strong>Payment Method:</strong> {order.paymentMethod}
      </p>
      {order.paymentMethod === "online" && (
        <p>
          <strong>Transaction ID:</strong> {order.trxId}
        </p>
      )}

      <h3>Items Ordered</h3>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.name} × {item.quantity} = ৳{item.price * item.quantity}
          </li>
        ))}
      </ul>

      <h3>Total: ৳{order.totalAmount}</h3>
      <p>
        <strong>Order Date:</strong> {order.date}
      </p>

      <Link to="/" className="btn-back-home">
        🏠 Back to Home
      </Link>
    </div>
  );
};

export default OrderSuccess;