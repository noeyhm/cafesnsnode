const express = require("express");
const router = express.Router();
const checkLogin = require("../middlewares/checkLogin");
const { getFeed, createPost, toggleLike, addComment } = require("../controllers/feedController");

router.get("/", getFeed);
router.post("/posts", checkLogin, createPost);
router.post("/posts/:id/like", checkLogin, toggleLike);
router.post("/posts/:id/comments", checkLogin, addComment);

module.exports = router;
