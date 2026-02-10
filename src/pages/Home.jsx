import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20; // 4 rows × 5 columns

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/data/products.json");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading products...
      </p>
    );

  if (error)
    return (
      <p style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
        {error}
      </p>
    );

  // Pagination logic
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero">
        <h1>
          Welcome to <span className="highlight">Complex Solution BD</span>
        </h1>
        <p>Discover the best products at unbeatable prices!</p>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <h2>🛒 Our Products</h2>
        <div className="product-grid">
          {currentProducts.map((product) => (
            <div className="product-card" key={product.SKU}>
              <img
                src={product["Image _url"] || "https://via.placeholder.com/150"}
                alt={product.Product}
                className="product-img"
              />
              <h3 title={product.Product}>{product.Product}</h3>
              <p>Price: {product["Selling Price"]}</p>
              <p>Stock: {product["Current stock"]}</p>
              <Link
                to={`/product/${product.SKU}`}
                className="details-btn"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            {" "}Page {currentPage} of {totalPages}{" "}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;