import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Barcode from "react-barcode";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./invoice.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(
        `http://192.168.0.100:5001/admin/order/${id}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (res.data) {
        setOrder(res.data);
      } else {
        setError("Order not found!");
      }
    } catch (err) {
      setError("Failed to fetch order details from server.");
    }
  };

  const handlePrint = () => window.print();

  const handlePDF = () => {
    const input = invoiceRef.current;
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      
      const formattedInvoiceNo = order?.invoiceNumber 
        ? `INV-${String(order.invoiceNumber).padStart(4, '0')}`
        : order?.trxId;
      pdf.save(`invoice-${formattedInvoiceNo}.pdf`);
    });
  };

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>❌ {error}</h2>
        <button onClick={() => navigate("/admin/orders")} style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>⏳ Loading order details...</h2>
      </div>
    );
  }

  const discount = order.discount || 0;
  const subtotal = order.totalAmount + discount;

  // 👈 ইনভয়েস নম্বর ফরম্যাটিং লজিক (১ কে INV-0001 বানাবে)
  const formattedInvoiceNo = order.invoiceNumber 
    ? `INV-${String(order.invoiceNumber).padStart(4, "0")}` 
    : order.trxId; // পুরনো অর্ডারে নম্বর না থাকলে ট্রানজেকশন আইডি দেখাবে ব্যাকআপ হিসেবে

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto 10px auto" }} className="no-print">
        <button 
          onClick={() => navigate("/admin/orders")} 
          style={{ padding: "8px 15px", background: "#555", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

      <div className="invoice-container" ref={invoiceRef}>
        {/* HEADER */}
        <div className="invoice-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <img 
              src={`${window.location.origin}/logo.png`}  
              alt="Company Logo" 
              style={{ width: "70px", height: "70px", objectFit: "contain" }} 
            />
            <div>
              <h2 style={{ margin: "0 0 5px 0", color: "#333" }}>Complex Solution BD</h2>
              <p style={{ margin: "0", color: "#666", fontSize: "0.9rem" }}>Dhaka, Bangladesh | 01XXXXXXXXX</p>
              <p style={{ margin: "0", color: "#666", fontSize: "0.9rem" }}>complexbd@gmail.com</p>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: "0 0 5px 0", color: "#007bff", letterSpacing: "1px" }}>INVOICE</h1>
            <p style={{ margin: "3px 0", fontSize: "0.9rem" }}><b>Invoice No:</b> {formattedInvoiceNo}</p>
            <p style={{ margin: "3px 0", fontSize: "0.9rem" }}><b>Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* 📊 BARCODE + QR CODE (কোম্পানির নিজস্ব সিকিউর ফরম্যাট) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
          {/* বারকোডে এখন অফিসিয়াল ইনভয়েস নম্বর ও টেক্সট প্রিন্ট হবে */}
          <Barcode value={formattedInvoiceNo} width={1.5} height={45} fontSize={12} />
          
          {/* কিউআর কোড স্ক্যান করলে সরাসরি অ্যাডমিনের এই স্পেসিফিক অর্ডার পেজ ওপেন হবে */}
          <QRCodeCanvas value={`${window.location.origin}/admin/order/${order._id}`} size={75} />
        </div>

        {/* CUSTOMER */}
        <div className="customer-box" style={{ margin: "20px 0", lineHeight: "1.6" }}>
          <h4>📋 Customer Info</h4>
          <p><b>Name:</b> {order.customer?.name}</p>
          <p><b>Phone:</b> {order.customer?.phone}</p>
          <p><b>Address:</b> {order.customer?.address}</p>
        </div>

        {/* ITEMS */}
        <table className="invoice-table" style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Product</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Qty</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Price</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{item.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{item.quantity}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>৳{item.price}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>৳{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTAL */}
        <div className="total-box" style={{ textAlign: "right", marginTop: "20px", lineHeight: "1.8" }}>
          <p>Subtotal: ৳{subtotal}</p>
          <p>Discount: ৳{discount}</p>
          <h3 style={{ margin: "5px 0" }}>Total: ৳{order.totalAmount}</h3>
          <p><b>Payment Method:</b> {order.paymentMethod}</p>
          <p>
            <b>Status:</b>{" "}
            <span className={`status-${order.status?.toLowerCase()}`} style={{ fontWeight: "bold" }}>
              {order.status}
            </span>
          </p>
        </div>
      </div>

      {/* BUTTONS */}
      <div style={{ textAlign: "center", marginTop: "20px" }} className="no-print">
        <button className="print-btn" onClick={handlePrint} style={{ marginRight: "10px", padding: "10px 20px", background: "black", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          🖨 Print Invoice
        </button>

        <button className="print-btn" onClick={handlePDF} style={{ padding: "10px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          📄 Download PDF
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;