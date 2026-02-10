import React, { useState, useEffect } from "react";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20; // এক পেজে 20 products

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/product.json"); // public folder
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading products...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  // Pagination calculations
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="products-page">
      <h2>All Products</h2>
      <div className="products-grid">
        {currentProducts.map((product) => (
          <div className="product-card" key={product.SKU}>
            <img
              src={product["Image _url"] ? product["Image _url"] : "https://via.placeholder.com/150"}
              alt={product.Product}
              className="product-img"
            />
            <h3 title={product.Product}>{product.Product}</h3>
            <p>Price: {product["Selling Price"]}</p>
            <p>
              Stock:{" "}
              {parseFloat(product["Current stock"]) > 0
                ? product["Current stock"]
                : "Out of Stock"}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination buttons */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Products;