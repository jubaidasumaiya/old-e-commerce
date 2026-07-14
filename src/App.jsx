import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { CartProvider } from "./context/CartContext";
import OrderSuccess from "./pages/OrderSuccess";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminOrders from "./pages/AdminOrders";
import AdminLogin from "./pages/AdminLogin";
import OrderDetails from "./pages/OrderDetails";
import ProtectedRoute from "./components/ProtectedRoute"; 
import AdminProducts from "./pages/AdminProducts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminCustomers from "./pages/AdminCustomers";
import MyOrders from "./pages/MyOrders"; 
import CustomerProfile from "./pages/CustomerProfile";
import ForgotPassword from "./pages/ForgotPassword";
import AdminInbox from "./pages/AdminInbox";

// ➕ ১. ওপরে চ্যাট কম্পোনেন্টটি ইমপোর্ট করো
import Chat from "./components/Chat"; 

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route 
  path="/admin/inbox" 
  element = {
    <ProtectedRoute>
      <AdminInbox />
    </ProtectedRoute>
  } 
/>
          
          {/* 👤 কাস্টমারের নিজস্ব রুট (লগইন করা ইউজারদের জন্য) */}
          <Route path="/my-orders" element={<MyOrders />} /> 
          <Route path="/profile" element={<CustomerProfile />} />

          {/* 🔒 এডমিন রুট (লগইন পেজ) */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* 🔐 প্রটেক্টেড এডমিন রুটস (লগইন ছাড়া টোটালি ব্লকড) */}
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

          {/* ✅ সিকিউরিটি ফিক্স: কাস্টমার লিস্ট এখন প্রটেক্টেড রাউটের ভেতরে */}
          <Route 
            path="/admin/customers" 
            element = {
              <ProtectedRoute>
                <AdminCustomers />
              </ProtectedRoute>
            } 
          />
        </Routes>

        {/* ➕ ২. এখানে চ্যাটবক্সটি ফিক্সড পজিশনে বসিয়ে দেওয়া হলো */}
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
          <Chat />
        </div>

        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;