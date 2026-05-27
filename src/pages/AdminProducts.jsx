import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminProducts.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 সার্চ টার্মের জন্য নতুন স্টেট
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
    image: "",
    stock: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 📦 FETCH ALL PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5001/admin/products", {
        headers: { Authorization: token },
      });
      setProducts(res.data);
    } catch (err) {
      console.log("Fetch Products Error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✍️ HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ➕ HANDLE ADD PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/admin/product/add", formData, {
        headers: { Authorization: token },
      });
      alert("Product Added Successfully! 🎉");
      
      // ফর্ম খালি করা এবং প্রোডাক্ট লিস্ট রিফ্রেশ করা
      setFormData({ name: "", sku: "", price: "", description: "", image: "", stock: "" });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add product ❌");
    }
  };

  // ❌ HANDLE DELETE PRODUCT
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5001/admin/product/${id}`, {
          headers: { Authorization: token },
        });
        fetchProducts();
      } catch (err) {
        console.log("Delete Product Error:", err);
      }
    }
  };

  // 🔍 FILTER PRODUCTS LOGIC (Name অথবা SKU দিয়ে ফিল্টার হবে)
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-products-container">
      {/* 🔝 NAV BUTTONS */}
      <div className="admin-nav-box">
        <button className="nav-btn" onClick={() => navigate("/admin/orders")}>
          📋 View Orders Dashboard
        </button>
        <h2>🛍️ Product Management</h2>
      </div>

      {/* ➕ ADD PRODUCT FORM */}
      <form className="product-form" onSubmit={handleSubmit}>
        <h3>Add New Product</h3>
        <div className="form-grid">
          <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="sku" placeholder="SKU (Unique Code)" value={formData.sku} onChange={handleChange} required />
          <input type="number" name="price" placeholder="Price (৳)" value={formData.price} onChange={handleChange} required />
          <input type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleChange} required />
          <input type="text" name="image" placeholder="Image URL (e.g., /images/product.jpg)" value={formData.image} onChange={handleChange} />
        </div>
        <textarea name="description" placeholder="Product Description..." value={formData.description} onChange={handleChange} rows="3"></textarea>
        <button type="submit" className="submit-btn">Upload Product 🚀</button>
      </form>

      {/* 📊 PRODUCTS TABLE HEADER & SEARCH BAR */}
      <div className="table-header-container">
        <h3>📦 Available Products ({filteredProducts.length})</h3>
        
        {/* 🔍 SEARCH INPUT FIELD */}
        <input
          type="text"
          className="product-search-input"
          placeholder="Name বা SKU দিয়ে সার্চ করুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📊 PRODUCTS TABLE */}
      <table className="products-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <tr key={p._id}>
                <td><b>{p.sku}</b></td>
                <td>{p.name}</td>
                <td>৳{p.price}</td>
                <td>{p.stock} pcs</td>
                <td>
                  <button className="p-delete-btn" onClick={() => handleDelete(p._id)}>
                    Delete ❌
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি! ⚠️
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;