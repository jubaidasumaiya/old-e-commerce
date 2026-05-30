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
          {cartItems.map((item) => {
            const itemKey = item.sku || item.SKU || item._id;

            return (
              <tr key={itemKey}>
                <td>
                  <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} />
                  {item.name}
                </td>
                <td>৳{item.price}</td>
                
                {/* 🎛️ QUANTITY CONTROL AREA (INLINE STYLE FIXED) */}
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                    
                    {/* ➖ MINUS BUTTON (Dark Gray Background, White Text) */}
                    <button
                      type="button"
                      onClick={() => {
                        const currentQty = Number(item.quantity) || 1;
                        if (currentQty > 1) {
                          updateQuantity(itemKey, currentQty - 1);
                        }
                      }}
                      style={{ 
                        width: "32px", 
                        height: "32px", 
                        padding: "0", 
                        backgroundColor: "#334155", 
                        color: "#ffffff", 
                        border: "none", 
                        borderRadius: "6px", 
                        cursor: "pointer", 
                        fontWeight: "bold", 
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      -
                    </button>

                    {/* 🔢 INPUT FIELD */}
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        updateQuantity(itemKey, val > 0 ? val : 1);
                      }}
                      style={{ 
                        width: "45px", 
                        height: "32px", 
                        textAlign: "center", 
                        border: "1px solid #cbd5e1", 
                        borderRadius: "6px", 
                        fontWeight: "bold",
                        color: "#000000",
                        backgroundColor: "#ffffff",
                        padding: "0",
                        margin: "0"
                      }}
                    />

                    {/* ➕ PLUS BUTTON (Bright Blue Background, White Text) */}
                    <button
                      type="button"
                      onClick={() => {
                        const currentQty = Number(item.quantity) || 1;
                        updateQuantity(itemKey, currentQty + 1);
                      }}
                      style={{ 
                        width: "32px", 
                        height: "32px", 
                        padding: "0", 
                        backgroundColor: "#007bff", 
                        color: "#ffffff", 
                        border: "none", 
                        borderRadius: "6px", 
                        cursor: "pointer", 
                        fontWeight: "bold", 
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      +
                    </button>

                  </div>
                </td>

                <td>
                  ৳{(Number(item.price) * item.quantity).toFixed(2)}
                </td>
                <td>
                  <button onClick={() => removeFromCart(itemKey)} className="btn-remove">
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ➡️ BOTTOM ACTIONS AREA: Right Side Alignment Fixed */}
      <div className="cart-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", width: "100%", marginTop: "20px" }}>
        <button onClick={handleCheckout} className="btn-checkout" style={{ order: 1 }}>
          Proceed to Checkout 🚀
        </button>
        <button onClick={clearCart} className="btn-clear" style={{ order: 2 }}>
          Clear Cart 🗑️
        </button>
      </div>
    </div>
  );
};

export default Cart;