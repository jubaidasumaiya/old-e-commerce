import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (cartItems.length === 0)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Your cart is empty!</h2>
        <Link to="/">Go back to Products</Link>
      </div>
    );

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.SKU}>
              <td>
                <img src={item["Image _url"]} alt={item.Product} />
                {item.Product}
              </td>
              <td>{item["Selling Price"]}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.SKU, e.target.value)}
                />
              </td>
              <td>
                ৳{(parseFloat(item["Selling Price"].replace(/[^0-9.-]+/g, "")) * item.quantity).toFixed(2)}
              </td>
              <td>
                <button onClick={() => removeFromCart(item.SKU)} className="btn-remove">
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-actions">
        <button onClick={handleCheckout} className="btn-checkout">
          Proceed to Checkout
        </button>
        <button onClick={clearCart} className="btn-clear">
          Clear Cart
        </button>
      </div>
    </div>
  );
};

export default Cart;