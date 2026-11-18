const jwt = require("jsonwebtoken");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// .env에 값이 없으면 뒤에 적은 기본값("mySuperSecretKey1234!@#$")이 자동으로 들어갑니다!
const jwtSecret = process.env.JWT_SECRET || "mySuperSecretKey1234!@#$";

const checkLogin = async (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.username = decoded.username;
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
};

module.exports = checkLogin;
