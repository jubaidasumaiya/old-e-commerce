import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductDetails.css";

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
        // 🌐 লোকাল JSON ফাইলের বদলে এখন আমাদের লাইভ ব্যাকএন্ড থেকে ডেটা আসবে
        const res = await fetch(`http://192.168.0.100:5001/api/product/sku/${sku}`);
        if (!res.ok) throw new Error("Product not found in database");
        const data = await res.json();
        setProduct(data);
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
    navigate("/cart"); // কার্ট পেজে রিডাইরেক্ট করবে
  };

  return (
    <div className="product-details-container">
      {/* 🔄 মঙ্গোডিবি স্কিমার নতুন Keys অনুযায়ী পরিবর্তন করা হলো */}
      <h2>{product.name}</h2>
      
      <img 
        src={product.image || "https:///placehold.co.com/150"} 
        alt={product.name} 
        onError={(e) => { e.target.src = "https:///placehold.co.com/150"; }}
      />
      
      <p className="product-price">Price: ৳{product.price}</p>
      <p className="product-stock">Stock: {product.stock} pcs</p>
      
      {product.description && (
        <p className="product-description">Description: {product.description}</p>
      )}

      <div className="quantity-selector">
        <label>Quantity: </label>
        <input
          type="number"
          min="1"
          max={product.stock > 0 ? product.stock : 1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <button onClick={handleAddToCart} className="btn-add-cart">
  Add to Cart 🛒
</button>
    </div>
  );
};

export default ProductDetails;