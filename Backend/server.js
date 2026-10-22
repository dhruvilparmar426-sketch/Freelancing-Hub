
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Serve frontend files from public/
app.use(express.static(path.join(__dirname, "public")));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// Database schemas
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "developer"],
      default: "user",
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    tools: [{ type: String }],
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requirements: { type: String, required: true },
    developerDescription: { type: String, default: "" },
    suggestions: { type: String, default: "" },
    deliveryDetails: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "accepted", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

// Authentication middleware
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in first." });
  }

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function developerOnly(req, res, next) {
  if (req.auth.role !== "developer") {
    return res.status(403).json({ message: "Developer access only." });
  }
  next();
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Freelancing Hub API is running." });
});

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        message: "Name, email and a password of at least 8 characters are required.",
      });
    }

    // Public signup cannot grant developer privileges.
    // Developer accounts must be granted by a trusted admin process.
    if (role === "developer") {
      return res.status(403).json({
        message: "Developer accounts must be created or approved by an administrator.",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: "user",
    });

    res.status(201).json({
      message: "Account created successfully.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed." });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ message: "Login failed." });
  }
});

// Get products (public)
app.get("/api/products", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const products = await Product.find(filter)
      .populate("developer", "name")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch {
    res.status(500).json({ message: "Could not load products." });
  }
});

// Create product (developer only)
app.post("/api/products", authenticate, developerOnly, async (req, res) => {
  try {
    const { title, description, category, image, price, tools } = req.body;

    if (!title || !description || !category || price === undefined ||
        !Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        message: "Valid title, description, category and price are required.",
      });
    }

    const product = await Product.create({
      title,
      description,
      category,
      image: image || "",
      price: Number(price),
      tools: Array.isArray(tools) ? tools : [],
      developer: req.auth.id,
    });

    res.status(201).json(product);
  } catch {
    res.status(500).json({ message: "Could not create product." });
  }
});

// Record product view
app.post("/api/products/:id/view", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ views: product.views });
  } catch {
    res.status(400).json({ message: "Invalid product ID." });
  }
});

// Record Explore click
app.post("/api/products/:id/click", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ clicks: product.clicks });
  } catch {
    res.status(400).json({ message: "Invalid product ID." });
  }
});

// Create order (logged-in user)
app.post("/api/orders", authenticate, async (req, res) => {
  try {
    const { productId, requirements } = req.body;

    if (!productId || !requirements?.trim()) {
      return res.status(400).json({
        message: "Product and project requirements are required.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });

    if (product.developer.toString() === req.auth.id) {
      return res.status(400).json({ message: "You cannot order your own product." });
    }

    const order = await Order.create({
      product: product._id,
      customer: req.auth.id,
      developer: product.developer,
      requirements: requirements.trim(),
      price: product.price,
    });

    res.status(201).json({ message: "Order request sent.", order });
  } catch {
    res.status(400).json({ message: "Could not create order." });
  }
});

// Customer: view own orders
app.get("/api/orders/my", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.auth.id })
      .populate("product", "title image")
      .populate("developer", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Could not load your orders." });
  }
});

// Developer: Order Box
app.get("/api/orders/inbox", authenticate, developerOnly, async (req, res) => {
  try {
    const orders = await Order.find({ developer: req.auth.id })
      .populate("product", "title image")
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Could not load the Order Box." });
  }
});

// Developer: accept order and add notes/suggestions
app.patch("/api/orders/:id/accept", authenticate, developerOnly, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      developer: req.auth.id,
      status: "pending",
    });

    if (!order) {
      return res.status(404).json({ message: "Pending order not found." });
    }

    order.developerDescription = String(req.body.description || "").slice(0, 5000);
    order.suggestions = String(req.body.suggestions || "").slice(0, 5000);
    order.status = "accepted";
    await order.save();

    res.json({ message: "Order accepted.", order });
  } catch {
    res.status(400).json({ message: "Could not accept order." });
  }
});

// Developer: deliver order in one action
app.patch("/api/orders/:id/deliver", authenticate, developerOnly, async (req, res) => {
  try {
    const deliveryDetails = String(req.body.deliveryDetails || "").trim();

    if (!deliveryDetails) {
      return res.status(400).json({ message: "Delivery details are required." });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      developer: req.auth.id,
      status: "accepted",
    });

    if (!order) {
      return res.status(404).json({ message: "Accepted order not found." });
    }

    order.deliveryDetails = deliveryDetails.slice(0, 10000);
    order.status = "delivered";
    await order.save();

    res.json({ message: "Order delivered.", order });
  } catch {
    res.status(400).json({ message: "Could not deliver order." });
  }
});

// Developer dashboard metrics
app.get("/api/dashboard", authenticate, developerOnly, async (req, res) => {
  try {
    const [products, orders, pending, accepted, delivered] = await Promise.all([
      Product.find({ developer: req.auth.id }),
      Order.countDocuments({ developer: req.auth.id }),
      Order.countDocuments({ developer: req.auth.id, status: "pending" }),
      Order.countDocuments({ developer: req.auth.id, status: "accepted" }),
      Order.find({ developer: req.auth.id, status: "delivered" }).select("price"),
    ]);

    res.json({
      totalProducts: products.length,
      totalViews: products.reduce((sum, p) => sum + p.views, 0),
      totalClicks: products.reduce((sum, p) => sum + p.clicks, 0),
      totalOrders: orders,
      pendingOrders: pending,
      acceptedOrders: accepted,
      deliveredOrders: delivered.length,
      deliveredOrderValue: delivered.reduce((sum, o) => sum + o.price, 0),
    });
  } catch {
    res.status(500).json({ message: "Could not load dashboard metrics." });
  }
});

// Gemini AI chat (API key stays on the server)
app.post("/api/chat", authenticate, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ message: "Gemini API key is not configured." });
    }

    const message = String(req.body.message || "").trim();
    if (!message || message.length > 10000) {
      return res.status(400).json({ message: "Enter a message up to 10,000 characters." });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ message: "Gemini request failed." });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");

    res.json({ reply: reply || "No response received." });
  } catch {
    res.status(502).json({ message: "Could not connect to Gemini." });
  }
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error." });
});

// Start server only after configuration check
const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error("Set MONGODB_URI and JWT_SECRET in your .env file.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Freelancing Hub server running at http://localhost:${PORT}`);
});
