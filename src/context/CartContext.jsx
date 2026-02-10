import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity) => {
    const exist = cartItems.find((item) => item.SKU === product.SKU);
    if (exist) {
      setCartItems(
        cartItems.map((item) =>
          item.SKU === product.SKU
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }
  };

  const removeFromCart = (sku) => {
    setCartItems(cartItems.filter((item) => item.SKU !== sku));
  };

  const updateQuantity = (sku, quantity) => {
    setCartItems(
      cartItems.map((item) =>
        item.SKU === sku ? { ...item, quantity: Number(quantity) } : item
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