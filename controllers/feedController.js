const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const path = require("node:path");
const Post = require("../models/postModel");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const jwtSecret = process.env.JWT_SECRET;

const getFeed = asyncHandler((req, res) => {
  let userId = null;
  let username = null;
  if (req.cookies.token && jwtSecret) {
    try {
      const decoded = jwt.verify(req.cookies.token, jwtSecret);
      userId = decoded.id;
      username = decoded.username;
    } catch (error) {
      res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
    }
  }

  const tag = typeof req.query.tag === "string" ? req.query.tag : "";
  res.render("feed", {
    posts: Post.findAll({ userId, tag }),
    tag,
    username,
  });
});

const createPost = asyncHandler((req, res) => {
  Post.create({
    userId: req.userId,
    storeName: req.body.storeName || "",
    imageUrl: req.body.imageUrl || "",
    caption: req.body.caption || "",
    tags: req.body.tags || "",
  });
  res.redirect("/");
});

const toggleLike = asyncHandler((req, res) => {
  Post.toggleLike({ postId: Number(req.params.id), userId: req.userId });
  res.redirect("back");
});

const addComment = asyncHandler((req, res) => {
  Post.addComment({
    postId: Number(req.params.id),
    userId: req.userId,
    content: req.body.content || "",
  });
  res.redirect("back");
});

module.exports = { getFeed, createPost, toggleLike, addComment };
