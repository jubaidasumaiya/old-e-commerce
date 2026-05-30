const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const SSLCommerzPayment = require("sslcommerz-lts"); 
const jwt = require("jsonwebtoken"); 
require("dotenv").config();
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

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

// 👤 নতুন যুক্ত করা হলো: Customer User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

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

// ✅ ২. SSLCOMMERZ PAYMENT INITIALIZATION
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
}); // 👈 ভুল বাতিটি এখান থেকে সরানো হয়েছে

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

// 🌍 🔄 অপ্টিমাইজড পাবলিক রুট: FETCH PRODUCTS WITH PAGINATION
app.get("/api/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; 
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const products = await Product.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(searchQuery);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit) || 1,
      totalProducts
    });
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

// 📥 ১৩. BULK IMPORT PRODUCTS
app.get("/admin/import-all-json-products", async (req, res) => {
  try {
    if (!fs.existsSync("products.json")) {
      return res.status(404).send("❌ ব্যাকএন্ড ফোল্ডারে 'products.json' নামে কোনো ফাইল খুঁজে পাওয়া যায়নি!");
    }

    const rawData = fs.readFileSync("products.json", "utf8");
    const oldProducts = JSON.parse(rawData);
    
    const uniqueMap = new Map(oldProducts.map(item => [item.SKU || item.sku, item]));
    const uniqueOldProducts = Array.from(uniqueMap.values());

    const existingProducts = await Product.find({}, { sku: 1 });
    const existingSkus = new Set(existingProducts.map(p => p.sku));

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

    if (formattedProducts.length === 0) {
      return res.send("ℹ️ No new unique products to import. All unique products are already in the database!");
    }

    await Product.insertMany(formattedProducts, { ordered: false });
    res.send(`🎉 Success! ${formattedProducts.length} new products imported to MongoDB successfully!`);
  } catch (err) {
    console.error("Bulk Import Error:", err);
    res.status(500).send("Failed to import products: " + err.message);
  }
});

// 📑 ১৪. FETCH ALL CUSTOMERS FOR ADMIN
app.get("/admin/customers", verifyAdminToken, async (req, res) => {
  try {
    const customers = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    console.error("Fetch Customers Error:", err);
    res.status(500).json({ error: "Failed to fetch registered customers" });
  }
});

// 🔄 ১৫. UPDATE PRODUCT DETAILS (প্রোডাক্টের দাম, স্টক বা তথ্য এডিট করার জন্য)
app.put("/admin/product/:id", verifyAdminToken, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // এটি ডাটাবেজে আপডেট হওয়া নতুন ডেটাটি রিটার্ন করবে
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    
    res.json({ success: true, message: "Product updated successfully!", product: updatedProduct });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 🌍 PUBLIC ROUTE: FETCH SINGLE PRODUCT BY ANY IDENTIFIER
app.get("/api/product/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      product = await Product.findById(identifier);
    }

    if (!product) {
      product = await Product.findOne({ sku: identifier });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found ❌" });
    }

    res.json(product);
  } catch (err) {
    console.error("Fetch Product Details Error:", err);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});

// 🌍 SMART PUBLIC ROUTE: ID অথবা SKU যেকোনো একটি দিয়ে প্রোডাক্ট খুঁজবে
app.get("/api/product/sku/:sku", async (req, res) => {
  try {
    const param = req.params.sku;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(param)) {
      product = await Product.findById(param);
    }

    if (!product) {
      product = await Product.findOne({ 
        sku: { $regex: new RegExp("^" + param.trim() + "$", "i") } 
      });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Fetch Product Error:", err);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});

// ✉️ ইমেইল পাঠানোর কনফিগারেশন (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "complexbd5@gmail.com", // ⚠️ তোমার আসল জিমেইল এখানে দাও
    pass: "wxfg ldiw kouu zfzi",    // ⚠️ জিমেইলের App Password এখানে দিতে হবে
  },
});

// মেমোরিতে সাময়িকভাবে OTP সেভ রাখার জন্য একটি অবজেক্ট (প্রজেক্ট সহজ রাখার জন্য)
let otpStore = {}; 

// 1️⃣ FORGOT PASSWORD: ওটিপি জেনারেট ও ইমেইল পাঠানো
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    // ✅ বদলে এভাবে লেখো (যদি তোমার মডেলের নাম Customer হয়):
    // 🔄 বদল করে আবার এটি লেখো:
const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: "No account found with this email! ❌" });
    }

    // ৬ ডিজিটের র্যান্ডম ওটিপি তৈরি
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // ওটিপিটি ৫ মিনিটের জন্য মেমোরিতে সেভ রাখা হলো
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    // কাস্টমারের ইমেইলে ওটিপি পাঠানো
    const mailOptions = {
      from: 'complexbd5@gmail.com',
      to: email,
      subject: "Password Reset OTP - Complex Solution BD",
      text: `Your 6-digit password reset OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "A 6-digit OTP has been sent to your email! 📩" });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
});

// 2️⃣ RESET PASSWORD: ওটিপি ম্যাচ করে নতুন পাসওয়ার্ড সেট করা
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // ওটিপি চেক করা
    const record = otpStore[email];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP! ❌" });
    }

    // পাসওয়ার্ড হ্যাশ করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ডাটাবেজে আপডেট করা
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // কাজ শেষ হলে ওটিপি মেমোরি থেকে ডিলিট করে দেওয়া
    delete otpStore[email];

    res.json({ message: "Password reset successfully! Log in with your new password. 🎉" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// 👤 📝 CUSTOMER SIGNUP ROUTE (পাসওয়ার্ড হ্যাশ করে সেভ করবে)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "এই ইমেইল দিয়ে অলরেডি অ্যাকাউন্ট খোলা আছে! ⚠️" });
    }

    // 🔐 রেজিস্ট্রেশনের সময়ই পাসওয়ার্ড হ্যাশ (Encrypt) করা হলো
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: "অ্যাকাউন্ট তৈরি সফল হয়েছে! 🎉" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//👤 🔑 CUSTOMER LOGIN ROUTE (bcrypt দিয়ে ম্যাচ করবে)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ১. ইমেইল দিয়ে ইউজার খোঁজা
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "ভুল ইমেইল অথবা পাসওয়ার্ড! ❌" });
    }

    // 🔐 ২. bcrypt.compare দিয়ে ডাটাবেজের হ্যাশ পাসওয়ার্ডের সাথে মেলানো হলো
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "ভুল ইমেইল অথবা পাসওয়ার্ড! ❌" });
    }

    const token = jwt.sign({ id: user._id, role: "customer" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "লগইন সফল হয়েছে! 👋",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔐 CUSTOMER: পাসওয়ার্ড পরিবর্তন করার এপিআই
app.put("/api/auth/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // ১. কাস্টমারকে ডাটাবেজে খোঁজা
    const user = await User.findOne({ email }); // তোমার মডেলের নাম User বা Customer যা আছে তা লিখবে
    if (!user) {
      return res.status(404).json({ error: "User not found ❌" });
    }

    // ২. পুরোনো পাসওয়ার্ড ম্যাচ করে কি না তা চেক করা (bcrypt দিয়ে)
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect! ❌" });
    }

    // ৩. নতুন পাসওয়ার্ডটি হ্যাশ (Encrypt) করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ৪. ডাটাবেজে নতুন পাসওয়ার্ড সেভ করা
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully! 🎉" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ error: "Server error, failed to change password" });
  }
});



// 🌍 অপ্টিমাইজড রুট: বড়/ছোট হাতের অক্ষরের অমিল থাকলেও অর্ডার খুঁজে বের করবে
app.get("/api/my-orders/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    const orders = await Order.find({ 
      "customer.email": { $regex: new RegExp("^" + email.trim() + "$", "i") } 
    }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error("Fetch Customer Orders Error:", err);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
});

// 🚀 SERVER PORT
const PORT = 5001; 
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));