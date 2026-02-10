import React, { useEffect, useState } from "react";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const BACKEND_URL = "https://vitejsvitenabmb9fe-plm4--5173--cf284e50.local-credentialless.webcontainer.io";
    fetch(`https://vitejsvitenabmb9fe-plm4--5173--cf284e50.local-credentialless.webcontainer.io/orders`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(err));
  }, []);

  if (orders.length === 0)
    return <h3 style={{ textAlign: "center", marginTop: "50px" }}>No orders found!</h3>;

  return (
    <div className="order-history-container">
      <h2>📜 My Orders</h2>
      {orders.map((order, idx) => (
        <div className="order-card" key={idx}>
          <h3>Order #{idx + 1}</h3>
          <p>
            <strong>Name:</strong> {order.customer.name}
          </p>
          {order.customer.email && (
            <p>
              <strong>Email:</strong> {order.customer.email}
            </p>
          )}
          <p>
            <strong>Phone:</strong> {order.customer.phone}
          </p>
          <p>
            <strong>Address:</strong> {order.customer.address}
          </p>
          <p>
            <strong>Payment:</strong> {order.paymentMethod}
          </p>
          <p>
            <strong>Transaction ID:</strong> {order.trxId}
          </p>
          <p>
            <strong>Date:</strong> {order.date}
          </p>
          <h4>Items:</h4>
          <ul>
            {order.items?.map((item, i) => (
              <li key={i}>
                {item.name} × {item.quantity} = ৳{item.price * item.quantity}
              </li>
            ))}
          </ul>
          <h4>Total: ৳{order.totalAmount}</h4>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;