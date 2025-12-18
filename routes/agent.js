const express = require("express");
const Call = require("../models/Call");
const { isLoggedIn, isAgent } = require("../middlewares/auth");

const router = express.Router();

// add call form
router.get("/calls/new", isLoggedIn, isAgent, (req, res) => {
  res.render("calls/new");
});

// save call
router.post("/calls", isLoggedIn, isAgent, async (req, res) => {
  try {
    const call = new Call({
      agent: req.user._id,
      ...req.body,
      followUpDate: req.body.followUpDate || null,
    });

    await call.save();
    res.redirect("/calls");
  } catch (err) {
    res.send(err.message);
  }
});

// list own calls
router.get("/calls", isLoggedIn, isAgent, async (req, res) => {
  const calls = await Call.find({ agent: req.user._id }).sort({ createdAt: -1 });
  res.render("calls/index", { calls });
});

module.exports = router;
