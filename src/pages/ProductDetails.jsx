import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductDetails.css"
const ProductDetails = () => {
  const { sku } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch("/data/products.json");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        const found = data.find((p) => p.SKU === sku);
        if (!found) throw new Error("Product not found");
        setProduct(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [sku]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  const handleAddToCart = () => {
    addToCart(product, Number(quantity));
    navigate("/cart"); // Redirect to Cart page
  };

  return (
    <div className="product-details-container">
      <h2>{product.Product}</h2>
      <img src={product["Image _url"]} alt={product.Product} />
      <p>Price: {product["Selling Price"]}</p>
      <p>Stock: {product["Current stock"]}</p>
      <div>
        <label>Quantity: </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <button onClick={handleAddToCart} className="btn-add-cart">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductDetails;