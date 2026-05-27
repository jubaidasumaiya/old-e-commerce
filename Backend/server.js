const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const SSLCommerzPayment = require("sslcommerz-lts"); 
const jwt = require("jsonwebtoken"); 
require("dotenv").config();
const fs = require("fs");

const app = express();
const JWT_SECRET = "mySuperSecretAdminKey123"; 

// ✅ CORS কনফিগারেশন
app.use(cors({
    origin: ["https://delicate-parfait-780e6f.netlify.app", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// 🔗 MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 🔢 ১. AUTO-INCREMENT COUNTER SCHEMA (ইনভয়েস ট্র্যাক রাখার জন্য)
const counterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model("Counter", counterSchema);

// 🧾 Order Schema (invoiceNumber যোগ করা হলো)
const orderSchema = new mongoose.Schema(
  {
    invoiceNumber: Number, 
    customer: { name: String, phone: String, address: String, email: String },
    items: [{ name: String, price: Number, quantity: Number }],
    paymentMethod: String,
    trxId: String, 
    totalAmount: Number,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);
const Order = mongoose.model("Order", orderSchema);

// 🛍️ Product Schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true }, 
    price: { type: Number, required: true },
    description: String,
    image: String, 
    stock: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);

// 🔐 JWT ভেরিফিকেশন মিডলওয়্যার
const verifyAdminToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Access denied. No token provided." });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.admin = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token. Authorization failed." });
  }
};

app.get("/", (req, res) => res.send("Backend is running successfully!"));

// ✅ ADMIN LOGIN ROUTE
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === "admin@mail.com" && password === "admin123") {
      const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
      return res.json({ success: true, message: "Login successful", token });
    } else {
      return res.status(401).json({ error: "Invalid email or password ❌" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ ২. SSLCOMMERZ PAYMENT INITIALIZATION (অটো ইনভয়েস সহ)
app.post("/init", async (req, res) => {
  try {
    const store_id = "compl6909d09f73645"; 
    const store_passwd = "compl6909d09f73645@ssl"; 
    const is_live = false; 

    const orderData = req.body;
    const finalAmount = orderData.totalAmount <= 0 ? 10 : orderData.totalAmount;

    const counter = await Counter.findOneAndUpdate(
      { id: "invoiceId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const order = new Order({
      ...orderData,
      invoiceNumber: counter.seq, 
      totalAmount: finalAmount,
      status: "Pending",
    });
    await order.save();

    const data = {
      total_amount: finalAmount,
      currency: "BDT",
      tran_id: orderData.trxId, 
      success_url: `http://localhost:5001/payment/success`, 
      fail_url: `http://localhost:5001/payment/fail`,       
      cancel_url: `http://localhost:5001/payment/cancel`,   
      ipn_url: "http://localhost:5001/payment/ipn",
      shipping_method: "Courier",
      product_name: "E-commerce Products",
      product_category: "General",
      product_profile: "general",
      cus_name: orderData.customer?.name || "Unknown Customer",
      cus_email: orderData.customer?.email || "customer@mail.com",
      cus_add1: orderData.customer?.address || "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: orderData.customer?.phone || "01700000000",
      ship_name: orderData.customer?.name || "Unknown Customer",
      ship_add1: orderData.customer?.address || "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: "1000",
      ship_country: "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then((apiResponse) => {
      let GatewayPageURL = apiResponse.GatewayPageURL;
      if (GatewayPageURL) {
        res.json({ url: GatewayPageURL });
      } else {
        res.status(400).json({ error: "Payment session creation failed" });
      }
    });
  } catch (err) {
    console.error("Payment Init Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ ৩. PAYMENT SUCCESS ROUTE
app.post("/payment/success", async (req, res) => {
  try {
    const { tran_id } = req.body; 
    await Order.findOneAndUpdate({ trxId: tran_id }, { status: "Paid" });
    res.redirect(`http://localhost:5173/order-success?tran_id=${tran_id}`);
  } catch (err) {
    res.status(500).send("Payment success processing failed");
  }
});

// ✅ ৪. PAYMENT FAIL ROUTE
app.post("/payment/fail", async (req, res) => {
  try {
    const { tran_id } = req.body;
    await Order.findOneAndUpdate({ trxId: tran_id }, { status: "Failed" });
    res.redirect("http://localhost:5173/checkout"); 
  } catch (err) {
    res.status(500).send("Payment fail processing failed");
  }
});

// ✅ ৫. PAYMENT CANCEL ROUTE
app.post("/payment/cancel", async (req, res) => {
  try {
    const { tran_id } = req.body;
    await Order.findOneAndUpdate({ trxId: tran_id }, { status: "Cancelled" });
    res.redirect("http://localhost:5173/checkout");
  } catch (err) {
    res.status(500).send("Payment cancel processing failed");
  }
});

// ✅ ৬. COD Order Route (অটো ইনভয়েস সহ)
app.post("/cod-order", async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { id: "invoiceId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const order = new Order({
      ...req.body,
      invoiceNumber: counter.seq, 
      paymentMethod: "COD",
    });
    await order.save();
    res.json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ error: "Order failed to save in database" });
  }
});

// ✅ ৭. Fetch ALL orders
app.get("/orders", verifyAdminToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ ৮. GET SINGLE ORDER BY TRXID
app.get("/order/:trxId", async (req, res) => {
  try {
    const order = await Order.findOne({ trxId: req.params.trxId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// ✅ ৯. GET SINGLE ORDER BY MONGO_ID
app.get("/admin/order/:id", verifyAdminToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// ✅ ১০. GET ADMIN SUMMARY
app.get("/admin/summary", verifyAdminToken, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ status: "Paid" });
    const revenueData = await Order.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    res.json({ totalOrders, totalRevenue, paidOrders });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// ➕ ১. ADD NEW PRODUCT
app.post("/admin/product/add", verifyAdminToken, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({ success: true, message: "Product added successfully!", product: newProduct });
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ error: "Failed to add product. Make sure SKU is unique." });
  }
});

// 📑 ২. FETCH ALL PRODUCTS FOR ADMIN
app.get("/admin/products", verifyAdminToken, async (req, res) => {
  try {
    const products = Product.find ? await Product.find().sort({ createdAt: -1 }) : [];
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ❌ ৩. DELETE PRODUCT
app.delete("/admin/product/:id", verifyAdminToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ✅ ১১. UPDATE ORDER STATUS
app.put("/order/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// 🌍 PUBLIC ROUTE: FETCH ALL PRODUCTS FOR CUSTOMERS
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }); 
    res.json(products);
  } catch (err) {
    console.error("Public Fetch Products Error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ✅ ১২. DELETE ORDER
app.delete("/order/:id", verifyAdminToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});
// 📥 ১৩. BULK IMPORT PRODUCTS (GET Method & Exact Path Match)
// ব্রাউজারে সরাসরি http://localhost:5001/admin/import-all-json-products লিখে এন্টার দিলেই এটি কাজ করবে।
app.get("/admin/import-all-json-products", async (req, res) => {
  try {
    // ১. চেক করা ব্যাকএন্ড ফোল্ডারে products.json ফাইলটি আছে কিনা
    if (!fs.existsSync("products.json")) {
      return res.status(404).send("❌ ব্যাকএন্ড ফোল্ডারে 'products.json' নামে কোনো ফাইল খুঁজে পাওয়া যায়নি! ফাইলটি আগে রাখুন।");
    }

    // ২. ফাইল রিড করা
    const rawData = fs.readFileSync("products.json", "utf8");
    const oldProducts = JSON.parse(rawData);
    
    // ৩. JSON ফাইলের ডুপ্লিকেট SKU ফিল্টার করা
    const uniqueMap = new Map(oldProducts.map(item => [item.SKU || item.sku, item]));
    const uniqueOldProducts = Array.from(uniqueMap.values());

    // ৪. ডাটাবেজে আগে থেকে কোন কোন SKU আছে তা চেক করা
    const existingProducts = await Product.find({}, { sku: 1 });
    const existingSkus = new Set(existingProducts.map(p => p.sku));

    // ৫. ডাটাবেজের সাথে মিলিয়ে শুধুমাত্র নতুন প্রোডাক্টগুলো আলাদা করা
    const formattedProducts = [];
    uniqueOldProducts.forEach((item) => {
      const skuStr = String(item.SKU || item.sku || "").trim();
      
      if (skuStr && !existingSkus.has(skuStr)) {
        formattedProducts.push({
          name: item.Product || item.name || "Unnamed Product",
          sku: skuStr,
          price: Number(item["Selling Price"] || item.price) || 0,
          stock: Number(item["Current stock"] || item.stock) || 0,
          image: item["Image _url"] || item.image || "https://via.placeholder.com/150",
          description: item.Description || item.description || "No description available."
        });
      }
    });

    // কোনো নতুন প্রোডাক্ট না থাকলে
    if (formattedProducts.length === 0) {
      return res.send("ℹ️ No new unique products to import. All unique products are already in the database!");
    }

    // ৬. ডাটাবেজে একসাথে ইনসার্ট করা
    await Product.insertMany(formattedProducts, { ordered: false });

    res.send(`🎉 Success! ${formattedProducts.length} new products imported to MongoDB successfully!`);
  } catch (err) {
    console.error("Bulk Import Error:", err);
    res.status(500).send("Failed to import products: " + err.message);
  }
});
// 🚀 SERVER PORT
const PORT = 5001; 
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));