import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
    navigate("/admin"); // লগআউট করে সরাসরি লগইন পেজে পাঠিয়ে দেবে
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

  // প্রথমবার পেজ লোড হলে ডেটা ফেচ করবে
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

      // 👈 ফিক্স: স্ট্যাটাস পরিবর্তনের সাথে সাথে অর্ডার লিস্ট এবং সামারি কার্ড দুটোই রিয়েল-টাইমে আপডেট হবে
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

      // 👈 ফিক্স: অর্ডার ডিলিট হওয়ার সাথে সাথে সামারি কার্ডের টোটাল সংখ্যাও রিয়েল-টাইমে কমে যাবে
      fetchOrders();
      fetchSummary();
    } catch (err) {
      console.log("Delete Order Error:", err);
    }
  };

  // 🔍 SEARCH + FILTER
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.customer?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      order.customer?.phone?.includes(search);

    const matchFilter =
      filter === "All"
        ? true
        : (order.status || "")
            .toLowerCase()
            .includes(filter.toLowerCase());

    return matchSearch && matchFilter;
  });

  return (
    <div className="admin-container">
     {/* 🔝 TOP HEADER WITH LOGOUT & MANAGE PRODUCTS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <h2 style={{ margin: 0 }}>📦 Admin Orders Dashboard</h2>
        
        {/* ✅ বাটন দুটিকে একসাথে ডানপাশে পাশাপাশি রাখার জন্য এই ছোট div-টি ব্যবহার করুন */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => navigate("/admin/products")}
            style={{ background: "#007bff", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            🛍️ Manage Products
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

      {/* 🔍 SEARCH + FILTER */}
      <div className="filter-box">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Delivered">Delivered</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* 📦 TABLE */}
      <table>
        <thead>
          <tr>
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
            >
              <td>{order.customer?.name}</td>
              <td>{order.customer?.phone}</td>
              <td>৳{order.totalAmount}</td>
              <td>{order.paymentMethod}</td>
              <td>{order.status}</td>

              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(order._id, "Pending");
                  }}
                >
                  Pending
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(order._id, "Paid");
                  }}
                >
                  Paid
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(order._id, "Delivered");
                  }}
                >
                  Delivered
                </button>

                <button
                  className="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOrder(order._id);
                  }}
                >
                  Delete
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