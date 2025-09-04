const Payment = require("../models/Payment");
const Stripe = require("stripe");
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Create payment (Stripe or COD)
exports.createPayment = async (req, res) => {
  const { userId, orderId, amount, currency, method } = req.body;

  try {
    let payment;
    
    if (method === 'cash_on_delivery') {
      // For COD, create payment directly without Stripe
      payment = new Payment({
        userId,
        orderId,
        amount,
        currency: currency || "usd",
        method: "cash_on_delivery",
        status: "pending"
      });
      
      await payment.save();
      
      res.status(201).json({
        payment,
        message: "COD payment created successfully"
      });
    } else {
      // For card payments, use Stripe if available
      if (!stripe) {
        return res.status(400).json({ 
          error: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." 
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // in cents
        currency: currency || "usd",
        metadata: { userId, orderId }
      });

      // Save payment in DB
      payment = new Payment({
        userId,
        orderId,
        amount,
        currency: currency || "usd",
        method: method || "card",
        status: "pending",
        stripePaymentIntentId: paymentIntent.id
      });

      await payment.save();

      res.status(201).json({
        payment,
        clientSecret: paymentIntent.client_secret
      });
    }
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
