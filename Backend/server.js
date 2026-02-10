const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 MongoDB connection
mongoose
  .connect(
    "mongodb+srv://complexbd5_db_user:jubaidaComplex@cluster0.58aeizx.mongodb.net/?appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// 🧾 Order Schema
const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: String,
      phone: String,
      address: String,
    },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    paymentMethod: String,
    totalAmount: Number,
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

// ✅ COD Order
app.post("/cod-order", async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      paymentMethod: "COD",
    });

    await order.save();

    res.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ error: "Order failed" });
  }
});

// ✅ Fetch REAL orders
app.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});