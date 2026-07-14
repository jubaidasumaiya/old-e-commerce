import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";

// 🎯 তোমার ক্লাউডিনারি ক্লাউড নেমটি এখানে বসাবে
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME"; 

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // 🎯 সাধারণ জাভাস্ক্রিপ্ট কমেন্ট ব্যবহার করা হলো (ফিক্সড)
        const BACKEND_BASE_URL = import.meta.env.DEV 
          ? `http://${window.location.hostname}:5001` 
          : "https://old-e-commerce-4.onrender.com";

        // 💡 নোট: ব্যাকএন্ডের রুটটি চেক করে নিবে। যদি /api/product হয়, তবে নিচের ইউআরএল থেকে s কেটে দিবে।
        const response = await axios.get(
          `${BACKEND_BASE_URL}/api/products?page=${currentPage}&limit=20&search=${searchTerm}`
        );
        
        // ব্যাকএন্ড যদি অবজেক্ট আকারে ডাটা পাঠায়
        if (response.data && response.data.products) {
          setProducts(response.data.products);
          setTotalPages(response.data.totalPages || 1);
        } else {
          // ব্যাকএন্ড যদি সরাসরি শুধু অ্যারে পাঠায় (সেফটি ফলব্যাক)
          setProducts(Array.isArray(response.data) ? response.data : []);
          setTotalPages(1);
        }
        setError(null); // সফল হলে এরর ক্লিয়ার হবে
      } catch (err) {
        console.error("প্রোডাক্ট লোড করতে ঝামেলা হয়েছে: ", err);
        setError("Failed to load products. Please check backend connection.");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 400); 

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]); 

  if (loading && products.length === 0) 
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading live products...</p>;
    
  if (error) 
    return <p style={{ textAlign: "center", marginTop: "50px", color: "red" }}>{error}</p>;

  return (
    <div className="home-container">
      <div className="hero">
        <h1>Welcome to <span className="highlight">Complex Solution BD</span></h1>
        <p>Discover the best products at unbeatable prices!</p>
      </div>

      <div className="products-section">
        <h2>🛒 Our Products</h2>

        {/* 🔍 SEARCH BAR INPUT */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); 
            }}
            style={{ width: "80%", maxWidth: "500px", padding: "12px 20px", borderRadius: "25px", border: "2px solid #007bff", fontSize: "1rem", outline: "none" }}
          />
        </div>

        {/* ⏳ সার্চিং লোডার */}
        {loading && <p style={{ textAlign: "center", color: "#007bff" }}>Searching...</p>}

        {/* 📦 প্রোডাক্ট গ্রিড */}
        <div className="product-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div className="product-card" key={product.sku}>
                <div className="product-img-wrapper">
                  {/* 🛡️ এক্সেল শিটের ইমেজ এবং ক্লাউডিনারি অটো-ব্যাকআপ লজিক */}
                  <img 
                    src={
                      product.image && !product.image.includes("default.png")
                        ? product.image.includes("https://www.stockfixup.com")
                          ? product.image.replace(
                              "https://www.stockfixup.com/public/uploads/img/",
                              `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/stockfixup/`
                            )
                          : product.image // যদি অলরেডি অন্য কোনো ম্যানুয়াল লিংক থাকে
                        : "https://placehold.co/150?text=No+Image" // ডিফল্ট ইমেজের ক্ষেত্রে প্লেসহোল্ডার
                    } 
                    alt={product.name} 
                    className="product-img" 
                    onError={(e) => { e.target.src = "https://placehold.co/150?text=Image+Error"; }}
                  />
                </div>
                <h3 title={product.name}>{product.name}</h3>
                <p className="price">৳{product.price}</p>
                <p className="stock">{product.stock > 0 ? `Stock: ${product.stock} pcs` : "Out of stock"}</p>
                <Link to={`/product/${product.sku}`} className="details-btn">View Details</Link>
              </div>
            ))
          ) : (
            !loading && <p style={{ width: "100%", gridColumn: "1/-1", color: "gray", textAlign: "center" }}>No products found!</p>
          )}
        </div>

        {/* 📄 PAGINATION BUTTONS */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</button>
            <span> Page {currentPage} of {totalPages} </span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;