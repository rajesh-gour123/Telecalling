function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).send("Access denied: Admin only");
}

function isAgent(req, res, next) {
  if (req.user && req.user.role === "agent") {
    return next();
  }
  res.status(403).send("Access denied: Agent only");
}

module.exports = {
  isLoggedIn,
  isAdmin,
  isAgent,
};
