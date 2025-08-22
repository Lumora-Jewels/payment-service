const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/", paymentController.createPayment);
router.put("/status", paymentController.updatePaymentStatus);
router.get("/", paymentController.getPayments);
router.get("/:id", paymentController.getPaymentById);

module.exports = router;
