import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminProducts.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isEditing, setIsEditing] = useState(false); // ✍️ এডিট মোড ট্র্যাক করার জন্য
  const [editId, setEditId] = useState(null);        // 🆔 যে প্রোডাক্ট এডিট হচ্ছে তার আইডি
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

  // ✍️ TRIGGER EDIT MODE (টেবিলের এডিট বাটনে ক্লিক করলে ফর্ম ফিলাপ হবে)
  const handleEditClick = (p) => {
    setIsEditing(true);
    setEditId(p._id);
    setFormData({
      name: p.name,
      sku: p.sku,
      price: p.price,
      description: p.description || "",
      image: p.image || "",
      stock: p.stock,
    });
    // স্ক্রল করে পেজের ওপরে ফর্মে নিয়ে যাওয়ার জন্য (ঐচ্ছিক)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ❌ CANCEL EDIT MODE
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: "", sku: "", price: "", description: "", image: "", stock: "" });
  };

  // ➕ / 🔄 HANDLE SUBMIT (ADD OR UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // 🔄 প্রোডাক্ট আপডেট করার রিকোয়েস্ট (PUT)
        await axios.put(`http://localhost:5001/admin/product/${editId}`, formData, {
          headers: { Authorization: token },
        });
        alert("Product Updated Successfully! 🔄");
      } else {
        // ➕ নতুন প্রোডাক্ট অ্যাড করার রিকোয়েস্ট (POST)
        await axios.post("http://localhost:5001/admin/product/add", formData, {
          headers: { Authorization: token },
        });
        alert("Product Added Successfully! 🎉");
      }
      
      // স্টেট রিসেট ও রিফ্রেশ
      handleCancelEdit();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save product ❌");
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

  // 🔍 FILTER PRODUCTS LOGIC
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

      {/* ➕ / ✍️ DYNAMIC FORM */}
<form className="product-form" onSubmit={handleSubmit}>
  <h3>{isEditing ? "✍️ Edit Product Details" : "Add New Product"}</h3>
  
  <div className="form-grid">
    {/* প্রোডাক্ট নাম */}
    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontWeight: "bold", fontSize: "14px", color: "#475569", textAlign: "left" }}>Product Name:</label>
      <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
    </div>

    {/* এসকেইউ কোড */}
    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontWeight: "bold", fontSize: "14px", color: "#475569", textAlign: "left" }}>SKU (Unique Code):</label>
      <input type="text" name="sku" placeholder="SKU (Unique Code)" value={formData.sku} onChange={handleChange} required />
    </div>

    {/* প্রোডাক্টের দাম */}
    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontWeight: "bold", fontSize: "14px", color: "#475569", textAlign: "left" }}>Price (৳):</label>
      <input type="number" name="price" placeholder="Price (৳)" value={formData.price} onChange={handleChange} required />
    </div>

    {/* স্টক পরিমাণ */}
    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontWeight: "bold", fontSize: "14px", color: "#475569", textAlign: "left" }}>Stock Quantity:</label>
      <input type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleChange} required />
    </div>

    {/* ইমেজের লিংক */}
    <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontWeight: "bold", fontSize: "14px", color: "#475569", textAlign: "left" }}>Image URL:</label>
      <input type="text" name="image" placeholder="Image URL (e.g., /images/product.jpg)" value={formData.image} onChange={handleChange} />
    </div>
  </div>

  {/* ডেসক্রিপশন বা বিবরণ */}
  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "15px" }}>
    <label style={{ fontWeight: "bold", fontSize: "14px", color: "#475569", textAlign: "left" }}>Product Description:</label>
    <textarea name="description" placeholder="Product Description..." value={formData.description} onChange={handleChange} rows="3"></textarea>
  </div>
  
  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
    <button type="submit" className="submit-btn" style={{ background: isEditing ? "#28a745" : "#007bff" }}>
      {isEditing ? "Update Product 🔄" : "Upload Product 🚀"}
    </button>
    
    {isEditing && (
      <button type="button" onClick={handleCancelEdit} className="submit-btn" style={{ background: "#6c757d" }}>
        Cancel Edit ❌
      </button>
    )}
  </div>
</form>

      {/* 📊 PRODUCTS TABLE HEADER & SEARCH BAR */}
      <div className="table-header-container">
        <h3>📦 Available Products ({filteredProducts.length})</h3>
        <input
          type="text"
          className="product-search-input"
          placeholder="Name বা SKU দিয়ে সার্চ করুন..."
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
                  {/* ✍️ এডিট বাটন */}
                  <button 
                    onClick={() => handleEditClick(p)}
                    style={{ background: "#ffc107", color: "#212529", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", marginRight: "5px", fontWeight: "bold" }}
                  >
                    Edit ✍️
                  </button>

                  <button className="p-delete-btn" onClick={() => handleDelete(p._id)}>
                    Delete ❌
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি! ⚠️
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;