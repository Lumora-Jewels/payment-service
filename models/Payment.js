const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "usd" },
  method: { type: String, enum: ["card", "paypal", "wallet"], default: "card" },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  stripePaymentIntentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
