import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 সার্চ ট্র্যাকিং স্টেট
  const productsPerPage = 20; 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/products");
        setProducts(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading live products...</p>;
  if (error) return <p style={{ textAlign: "center", marginTop: "50px", color: "red" }}>{error}</p>;

  // 🔍 সার্চ লজিক: নাম বা SKU মিললে প্রোডাক্ট দেখাবে
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic based on filtered products
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;

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
              setCurrentPage(1); // সার্চ করলে পেজিনেশন ১ নম্বর পেজে রিসেট হবে
            }}
            style={{ width: "80%", maxWidth: "500px", padding: "12px 20px", borderRadius: "25px", border: "2px solid #007bff", fontSize: "1rem", outline: "none" }}
          />
        </div>

        <div className="product-grid">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <div className="product-card" key={product.sku}>
                <img src={product.image || "https://via.placeholder.com/150"} alt={product.name} className="product-img" />
                <h3 title={product.name}>{product.name}</h3>
                <p>Price: ৳{product.price}</p>
                <p>Stock: {product.stock > 0 ? `${product.stock} pcs` : "Out of stock"}</p>
                <Link to={`/product/${product.sku}`} className="details-btn">View Details</Link>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", width: "100%", gridColumn: "1/-1", color: "gray" }}>No products found!</p>
          )}
        </div>

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