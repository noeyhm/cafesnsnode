const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(path.join(dataDirectory, "contacts.sqlite"));
database.exec("PRAGMA foreign_keys = ON");
database.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    office TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
    storeName TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    caption TEXT NOT NULL,
    tags TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(postId, userId)
  );
`);

const postCount = database.prepare("SELECT COUNT(*) AS count FROM posts").get().count;
if (postCount === 0) {
  const addPost = database.prepare(
    "INSERT INTO posts (storeName, imageUrl, caption, tags) VALUES (?, ?, ?, ?)"
  );
  const addSamples = () => {
    database.exec("BEGIN");
    try {
      addPost.run(
        "오후의 온도",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85",
        "딸기 한가득 올린 봄 시즌 케이크가 나왔어요. 오늘 방문하시면 아메리카노도 1,000원 할인!",
        "#부평카페 #신메뉴 #아메리카노할인"
      );
      addPost.run(
        "소소한 식탁",
        "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85",
        "점심 한정 바질 크림 파스타 오픈했어요. 직접 만든 소스로 향긋하게 준비했습니다.",
        "#부평맛집 #오픈이벤트 #신메뉴"
      );
      addPost.run(
        "커피와 페이지",
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1000&q=85",
        "고소한 피스타치오 라떼를 소개합니다. 이번 주말까지 인증샷을 보여주시면 쿠키를 드려요 ☕",
        "#강남카페 #인증샷이벤트 #피스타치오라떼"
      );
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  };
  addSamples();
}

module.exports = () => database;
