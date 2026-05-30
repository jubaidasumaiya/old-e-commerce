import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminOrders.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const navigate = useNavigate();

  // 🔓 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin"); 
  };

  const token = localStorage.getItem("token");

  // 📦 FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5001/orders", {
        headers: {
          Authorization: token,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.log("Fetch Orders Error:", err);
    }
  };

  // 📊 FETCH SUMMARY
  const fetchSummary = async () => {
    try {
      const res = await axios.get("http://localhost:5001/admin/summary", {
        headers: {
          Authorization: token,
        },
      });
      setSummary(res.data);
    } catch (err) {
      console.log("Fetch Summary Error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSummary();
  }, []);

  // 🔁 UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5001/order/${id}/status`,
        { status },
        {
          headers: { Authorization: token },
        }
      );
      fetchOrders();
      fetchSummary();
    } catch (err) {
      console.log("Update Status Error:", err);
    }
  };

  // ❌ DELETE ORDER
  const deleteOrder = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/order/${id}`, {
        headers: { Authorization: token },
      });
      fetchOrders();
      fetchSummary();
    } catch (err) {
      console.log("Delete Order Error:", err);
    }
  };

  // 🔍 SEARCH + FILTER (নতুন স্ট্যাটাসসহ আপডেট করা)
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.phone?.includes(search);

    const matchFilter =
      filter === "All"
        ? true
        : (order.status || "").toLowerCase() === filter.toLowerCase();

    return matchSearch && matchFilter;
  });

  return (
    <div className="admin-container">
      {/* 🔝 TOP HEADER WITH LOGOUT, MANAGE PRODUCTS & VIEW CUSTOMERS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <h2 style={{ margin: 0 }}>📦 Admin Orders Dashboard</h2>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => navigate("/admin/products")}
            style={{ background: "#007bff", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            🛍️ Manage Products
          </button>

          <button 
            onClick={() => navigate("/admin/customers")}
            style={{ background: "#28a745", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            👥 View Customers
          </button>

          <button 
            onClick={handleLogout}
            style={{ background: "#dc3545", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            Logout 🔓
          </button>
        </div>
      </div>

      {/* 🔥 SUMMARY CARDS */}
      <div className="summary-box">
        <div className="card">
          <h3>Total Orders</h3>
          <p>{summary.totalOrders || 0}</p>
        </div>

        <div className="card">
          <h3>Total Revenue</h3>
          <p>৳{summary.totalRevenue || 0}</p>
        </div>

        <div className="card">
          <h3>Paid Orders</h3>
          <p>{summary.paidOrders || 0}</p>
        </div>
      </div>

      {/* 🔍 SEARCH + FILTER (সবগুলো নতুন ড্রপডাউন অপশন যুক্ত করা হয়েছে) */}
      <div className="filter-box">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Pending">Pending ⏳</option>
          <option value="Paid">Paid 💰</option>
          <option value="Processing">Processing ⚙️</option>
          <option value="Shipped">Shipped 🚚</option>
          <option value="Delivered">Delivered ✅</option>
          <option value="Failed">Failed ❌</option>
        </select>
      </div>

      {/* 📦 TABLE */}
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((order) => (
            <tr
              key={order._id}
              onClick={() => navigate(`/admin/order/${order._id}`)}
              style={{ cursor: "pointer" }}
              className="order-row-hover"
            >
              <td><b>#{order.invoiceNumber || "N/A"}</b></td>
              <td>{order.customer?.name}</td>
              <td>{order.customer?.phone}</td>
              <td>৳{order.totalAmount}</td>
              <td>{order.paymentMethod}</td>
              <td>
                <span className={`status-badge ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </td>

              {/* 🛠️ অ্যাকশন কলামটি ড্রপডাউন দিয়ে অপ্টিমাইজ করা হলো */}
              <td onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                
                <button
                  className="view-btn"
                  onClick={() => navigate(`/admin/order/${order._id}`)}
                  style={{ padding: "6px 10px", borderRadius: "4px", cursor: "pointer" }}
                >
                  Details 👁️
                </button>

                {/* 🎯 স্মার্ট স্ট্যাটাস চেঞ্জার ড্রপডাউন */}
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  style={{
                    padding: "6px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  <option value="Pending">Pending ⏳</option>
                  <option value="Paid">Paid 💰</option>
                  <option value="Processing">Processing ⚙️</option>
                  <option value="Shipped">Shipped 🚚</option>
                  <option value="Delivered">Delivered ✅</option>
                  <option value="Failed">Failed ❌</option>
                </select>

                <button
                  className="delete-btn"
                  onClick={() => {
                    if(window.confirm("অর্ডারটি ডিলিট করতে চান?")) {
                      deleteOrder(order._id);
                    }
                  }}
                  style={{ padding: "6px 10px", borderRadius: "4px", cursor: "pointer" }}
                >
                  Delete ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;