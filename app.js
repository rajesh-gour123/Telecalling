if(process.env.NODE_ENV != "production"){
    require('dotenv').config() 
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");

// Passport config
require("./config/passport")(passport);

// Routes
const authRoutes = require("./routes/auth");
const agentRoutes = require("./routes/agent");
const adminRoutes = require("./routes/admin");

const app = express();

/* =======================
   DATABASE
======================= */
const mongo_URL = process.env.MONGO_URL;

mongoose
  .connect(mongo_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* =======================
   APP CONFIG
======================= */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/* =======================
   SESSION
======================= */
app.use(
  session({
    secret: "talle colling",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

/* =======================
   PASSPORT
======================= */
app.use(passport.initialize());
app.use(passport.session());

/* =======================
   GLOBAL USER (for navbar)
======================= */
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

/* =======================
   ROUTES
======================= */
app.get("/", (req, res) => {
  res.send("App is running");
});

app.get("/create-admin", async (req, res) => {
  const bcrypt = require("bcrypt");
  const User = require("./models/User");

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    return res.send("Admin already exists");
  }

  const hashed = await bcrypt.hash("admin123", 10);

  await User.create({
    username: "admin",
    password: hashed,
    role: "admin",
  });

  res.send("Admin created successfully");
});

app.use(authRoutes);        // /login, /logout
app.use(agentRoutes);       // /calls, /calls/new
app.use("/admin", adminRoutes); // /admin/calls, /admin/stats, /admin/calls/export

/* =======================
   SERVER
======================= */
const PORT = 8080;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
