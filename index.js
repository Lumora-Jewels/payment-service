const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
