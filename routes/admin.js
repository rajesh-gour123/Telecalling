const express = require("express");
const Call = require("../models/Call");
const ExcelJS = require("exceljs");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const { isLoggedIn, isAdmin } = require("../middlewares/auth");

const router = express.Router();

/* GET change password page */
router.get("/change-password", isLoggedIn, isAdmin, (req, res) => {
  res.render("admin/change-password");
});

/* POST change password (with secret) */
router.post("/change-password", isLoggedIn, isAdmin, async (req, res) => {
  const { newPassword, secret } = req.body;

  // check secret code
  if (secret !== process.env.ADMIN_PASSWORD_SECRET) {
    return res.status(403).send("Invalid secret code");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await User.findByIdAndUpdate(req.user._id, {
    password: hashed,
  });

  res.redirect("/admin/calls");
});
// all calls
router.get("/calls", isLoggedIn, isAdmin, async (req, res) => {
  const calls = await Call.find({})
    .populate("agent", "username")
    .sort({ createdAt: -1 });

  res.render("admin/calls", { calls });
});

// stats
router.get("/stats", isLoggedIn, isAdmin, async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const totalCallsToday = await Call.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  const callsPerAgent = await Call.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: "$agent", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "agent",
      },
    },
    { $unwind: "$agent" },
  ]);

  res.render("admin/stats", { totalCallsToday, callsPerAgent });
});


router.get("/follow-ups", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Today's follow-ups
    const todayFollowUps = await Call.find({
      status: "Call later",
      followUpDate: { $gte: start, $lte: end },
    })
      .populate("agent", "username")
      .sort({ followUpDate: 1 });

    // Overdue follow-ups
    const overdueFollowUps = await Call.find({
      status: "Call later",
      followUpDate: { $lt: start },
    })
      .populate("agent", "username")
      .sort({ followUpDate: 1 });

    res.render("admin/followups", {
      todayFollowUps,
      overdueFollowUps,
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading follow-ups");
  }
});


// excel export
router.get("/calls/export", isLoggedIn, isAdmin, async (req, res) => {
  const calls = await Call.find({}).populate("agent", "username");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Calls");

  sheet.columns = [
    { header: "Agent", key: "agent", width: 20 },
    { header: "Customer", key: "customerName", width: 20 },
    { header: "Mobile", key: "mobileNumber", width: 15 },
    { header: "Date", key: "callDate", width: 15 },
    { header: "Time", key: "callTime", width: 10 },
    { header: "Status", key: "status", width: 15 },
  ];

  calls.forEach(c =>
    sheet.addRow({
      agent: c.agent.username,
      customerName: c.customerName,
      mobileNumber: c.mobileNumber,
      callDate: c.callDate.toDateString(),
      callTime: c.callTime,
      status: c.status,
    })
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=calls.xlsx"
  );
  await workbook.xlsx.write(res);
  res.end();
});


router.get("/agents/new", isLoggedIn, isAdmin, (req, res) => {
  res.render("admin/new-agent");
});


router.post("/agents", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = new User({
      username,
      password: hashedPassword,
      role: "agent",
    });

    await agent.save();
    res.redirect("/admin/agents");
  } catch (err) {
    console.error(err);
    res.send("Error creating agent");
  }
});

router.get("/agents", isLoggedIn, isAdmin, async (req, res) => {
  const agents = await User.find({ role: "agent" });
  res.render("admin/agents", { agents });
});


router.post("/agents/:id/delete", isLoggedIn, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin/agents");
  } catch (err) {
    res.send("Error deleting agent");
  }
});
module.exports = router;
