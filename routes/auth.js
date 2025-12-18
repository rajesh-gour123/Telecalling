const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    if (req.user.role === "admin") {
      return res.redirect("/admin/calls");
    }
    res.redirect("/calls");
  }
);

router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

module.exports = router;
