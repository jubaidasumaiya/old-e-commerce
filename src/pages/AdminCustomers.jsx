import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ⬅️ নেভিগেশনের জন্য ইম্পোর্ট করা হলো
import "./AdminProducts.css"; 

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 সার্চ স্টেটের জন্য নতুন লাইন
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); // 🔄 নেভিগেট ফাংশন ইনিশিয়েট করা হলো
  const token = localStorage.getItem("token"); 

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("http://192.168.0.100:5001/admin/customers", {
          headers: { Authorization: token },
        });
        setCustomers(res.data);
      } catch (err) {
        console.error("Fetch Customers Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [token]);

  // 🔍 FILTER CUSTOMERS LOGIC (নাম অথবা ইমেইল দিয়ে রিয়েল-টাইম ফিল্টার হবে)
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading customers list... ⏳</p>;

  return (
    <div className="admin-products-container">
      {/* 🔝 TOP NAV BAR: ড্যাশবোর্ডে ফিরে যাওয়ার বাটন */}
      <div className="admin-nav-box">
        <button className="nav-btn" onClick={() => navigate("/admin/orders")}>
          ⬅️ Back to Orders Dashboard
        </button>
        <h2>👥 Registered Customers Management</h2>
      </div>

      {/* 📊 TABLE HEADER WITH SEARCH BAR */}
      <div className="table-header-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3>📊 Total Registered Customers: ({filteredCustomers.length})</h3>
        
        {/* 🔍 কাস্টমার সার্চ ইনপুট ফিল্ড */}
        <input
          type="text"
          className="product-search-input"
          placeholder="নাম বা ইমেইল দিয়ে সার্চ করুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* 📋 CUSTOMERS DATA TABLE */}
      <table className="products-table">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Joined Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((c) => (
              <tr key={c._id}>
                <td><small style={{ color: "#888" }}>{c._id}</small></td>
                <td><b>{c.name}</b></td>
                <td>{c.email}</td>
                <td>{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                কোনো কাস্টমার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি! ⚠️
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCustomers;