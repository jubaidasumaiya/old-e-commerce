const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  items: [
    {
      name: String,
      sku: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  paymentMethod: String,
  trxId: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);