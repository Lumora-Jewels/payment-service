const Payment = require("../models/Payment");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment (Stripe)
exports.createPayment = async (req, res) => {
  const { userId, orderId, amount, currency } = req.body;

  try {
    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // in cents
      currency: currency || "usd",
      metadata: { userId, orderId }
    });

    // Save payment in DB
    const payment = new Payment({
      userId,
      orderId,
      amount,
      currency: currency || "usd",
      method: "card",
      status: "pending",
      stripePaymentIntentId: paymentIntent.id
    });

    await payment.save();

    res.status(201).json({
      payment,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update payment status after webhook or confirmation
exports.updatePaymentStatus = async (req, res) => {
  const { paymentId, status } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    payment.status = status;
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
