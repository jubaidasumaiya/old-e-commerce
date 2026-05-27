import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { CartProvider } from "./context/CartContext";
import OrderSuccess from "./pages/OrderSuccess";
import OrderHistory from "./pages/OrderHistory";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminOrders from "./pages/AdminOrders";
import AdminLogin from "./pages/AdminLogin";
import OrderDetails from "./pages/OrderDetails";
import ProtectedRoute from "./components/ProtectedRoute"; 
import AdminProducts from "./pages/AdminProducts";


function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* 🌍 পাবলিক রুটস (সবাই দেখতে পাবে) */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:sku" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/admin" element={<AdminLogin />} />

          {/* 🔐 ২. প্রটেক্টেড এডমিন রুটস (লগইন ছাড়া টোটালি ব্লকড) */}
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute>
                <AdminOrders />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/order/:id" 
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/products" 
            element = {
              <ProtectedRoute>
                <AdminProducts />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;