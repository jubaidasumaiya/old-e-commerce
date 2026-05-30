import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // ➕ ADD TO CART (ছোট ও বড় হাতের SKU হ্যান্ডেল করা হয়েছে)
  const addToCart = (product, quantity) => {
    const productSku = product.sku || product.SKU; // যেকোনো একটি পেলেই নিবে
    
    const exist = cartItems.find((item) => (item.sku || item.SKU) === productSku);
    
    if (exist) {
      setCartItems(
        cartItems.map((item) =>
          (item.sku || item.SKU) === productSku
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }
  };

  // ❌ REMOVE FROM CART
  const removeFromCart = (sku) => {
    setCartItems(cartItems.filter((item) => (item.sku || item.SKU) !== sku));
  };

  // 🔄 UPDATE QUANTITY FIX (এখানেই আসল সমস্যা ছিল)
  const updateQuantity = (sku, quantity) => {
    setCartItems(
      cartItems.map((item) =>
        // ডাইনামিক্যালি চেক করবে যাতে ম্যাচিং মিস না হয়
        (item.sku || item.SKU) === sku 
          ? { ...item, quantity: Number(quantity) } 
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);