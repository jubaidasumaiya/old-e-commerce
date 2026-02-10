import React from "react";
import "./Navbar.css";
import { FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1 className="logo">Complex Solution BD</h1>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/cart">Cart <FaShoppingCart /></a></li>
        <li><a href="/order-history">Order History</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;