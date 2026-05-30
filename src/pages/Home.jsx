import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";

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
       {/* 🎯 স্মার্ট হাইব্রিড ইউআরএল লজিক */}
 const BACKEND_BASE_URL = import.meta.env.DEV 
  ? `http://${window.location.hostname}:5001` // লোকাল বা মোবাইলে চললে আইপি ধরবে
  : "https://old-e-commerce-4.onrender.com"; // 🚀 এখানে তোমার আসল লাইভ রেন্ডার লিংক বসে গেছে!
        const response = await axios.get(
          `${BACKEND_BASE_URL}/api/products?page=${currentPage}&limit=20&search=${searchTerm}`
        );
        
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
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
                  <img src={product.image || "https://via.placeholder.com/150"} alt={product.name} className="product-img" />
                </div>
                <h3 title={product.name}>{product.name}</h3>
                <p className="price">৳{product.price}</p>
                <p className="stock">{product.stock > 0 ? `Stock: ${product.stock} pcs` : "Out of stock"}</p>
                <Link to={`/product/${product.sku}`} className="details-btn">View Details</Link>
              </div>
            ))
          ) : (
            !loading && <p style={{ textAlign: "center", width: "100%", gridColumn: "1/-1", color: "gray" }}>No products found!</p>
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