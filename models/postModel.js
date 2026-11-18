const getDatabase = require("../config/dbConnect");
const database = getDatabase();

const Post = {
  findAll({ userId = null, tag = "" } = {}) {
    const searchTag = tag.trim();
    const posts = database.prepare(`
      SELECT posts.*, users.username AS author,
        (SELECT COUNT(*) FROM likes WHERE likes.postId = posts.id) AS likeCount,
        (SELECT COUNT(*) FROM comments WHERE comments.postId = posts.id) AS commentCount,
        EXISTS(SELECT 1 FROM likes WHERE likes.postId = posts.id AND likes.userId = ?) AS liked
      FROM posts
      LEFT JOIN users ON users.id = posts.userId
      WHERE (? = '' OR posts.tags LIKE ? OR posts.storeName LIKE ? OR posts.caption LIKE ?)
      ORDER BY posts.id DESC
    `).all(userId, searchTag, `%${searchTag}%`, `%${searchTag}%`, `%${searchTag}%`);

    const getComments = database.prepare(`
      SELECT comments.content, comments.createdAt, users.username AS author
      FROM comments JOIN users ON users.id = comments.userId
      WHERE comments.postId = ? ORDER BY comments.id
    `);
    return posts.map((post) => ({
      ...post,
      comments: getComments.all(post.id),
    }));
  },

  create({ userId, storeName, imageUrl, caption, tags }) {
    const cleanStoreName = storeName.trim();
    const cleanImageUrl = imageUrl.trim();
    const cleanCaption = caption.trim();
    const cleanTags = tags.trim();
    if (!cleanStoreName || !cleanImageUrl || !cleanCaption || !cleanTags) {
      throw new Error("매장명, 사진 주소, 소개, 해시태그를 모두 입력해 주세요.");
    }

    const parsedUrl = new URL(cleanImageUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("사진 주소는 http 또는 https URL이어야 합니다.");
    }

    return database.prepare(`
      INSERT INTO posts (userId, storeName, imageUrl, caption, tags)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, cleanStoreName, cleanImageUrl, cleanCaption, cleanTags);
  },

  toggleLike({ postId, userId }) {
    const existing = database.prepare(
      "SELECT id FROM likes WHERE postId = ? AND userId = ?"
    ).get(postId, userId);
    if (existing) {
      database.prepare("DELETE FROM likes WHERE id = ?").run(existing.id);
      return false;
    }
    database.prepare("INSERT INTO likes (postId, userId) VALUES (?, ?)").run(postId, userId);
    return true;
  },

  addComment({ postId, userId, content }) {
    const cleanContent = content.trim();
    if (!cleanContent) throw new Error("댓글 내용을 입력해 주세요.");
    database.prepare(
      "INSERT INTO comments (postId, userId, content) VALUES (?, ?, ?)"
    ).run(postId, userId, cleanContent);
  },
};

module.exports = Post;
