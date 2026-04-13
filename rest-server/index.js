// ============================================================
//  REST SERVER  –  runs on port 3001
//
//  TEACHING POINTS shown in comments throughout:
//   • Fixed response shapes (server decides what you get)
//   • Multiple round-trips to assemble related data (N+1 problem)
//   • Standard HTTP verbs: GET, POST, PUT, DELETE
//   • Each resource lives at its own URL
// ============================================================

const express = require("express");
const cors    = require("cors");
const { users, posts, comments } = require("../data");

const app = express();
app.use(cors());
app.use(express.json());

// ── Utility: simulate DB delay ────────────────────────────────
const delay = (ms = 30) => new Promise(r => setTimeout(r, ms));

// ── Request logger ────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[REST]  ${req.method} ${req.path}`);
  next();
});

// ============================================================
//  ENDPOINTS
// ============================================================

// GET /api/feed
// Returns posts – but WITHOUT author info!
// The client must make N more requests to get each author.
// --> This is the N+1 problem.
app.get("/api/feed", async (req, res) => {
  await delay();
  // We return MORE data than the client might need
  // (e.g. commentIds even if the UI doesn't display them).
  // This is called OVER-FETCHING.
  res.json({
    data: posts,
    meta: { total: posts.length, note: "⚠️  Author info not included – make N extra requests to /api/users/:id" },
  });
});

// GET /api/feed/full
// Same feed but now joins author data server-side.
// This avoids N+1 on the client, but the endpoint is now
// very specific – it can't be reused for a "compact" feed.
app.get("/api/feed/full", async (req, res) => {
  await delay();
  const enriched = posts.map(post => ({
    ...post,
    author: users.find(u => u.id === post.authorId),
    // Still returning commentIds even if the caller doesn't want them
    // → OVER-FETCHING
  }));
  res.json({ data: enriched });
});

// GET /api/posts/:id
// Single post – no author, no comments.
// Need separate requests to get those.
app.get("/api/posts/:id", async (req, res) => {
  await delay();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json({ data: post });
});

// GET /api/posts/:id/comments
// Comments for a post. Each comment lacks author name – another N+1 lurks!
app.get("/api/posts/:id/comments", async (req, res) => {
  await delay();
  const postComments = comments.filter(c => c.postId === req.params.id);
  res.json({ data: postComments, meta: { note: "⚠️  Each comment's author name requires GET /api/users/:id" } });
});

// GET /api/users
// Returns ALL fields for ALL users – even if the caller
// only wanted names and avatars.  → OVER-FETCHING
app.get("/api/users", async (req, res) => {
  await delay();
  res.json({ data: users });
});

// GET /api/users/:id
app.get("/api/users/:id", async (req, res) => {
  await delay();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ data: user });
});

// POST /api/posts  (create a post)
app.post("/api/posts", async (req, res) => {
  await delay();
  const { authorId, content } = req.body;
  if (!authorId || !content)
    return res.status(400).json({ error: "authorId and content are required" });
  const post = {
    id: String(Date.now()),
    authorId,
    content,
    imageUrl: null,
    createdAt: new Date().toISOString(),
    likes: 0,
    commentIds: [],
  };
  posts.unshift(post);
  res.status(201).json({ data: post });
});

// PUT /api/posts/:id/like  (increment likes)
app.put("/api/posts/:id/like", async (req, res) => {
  await delay();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  post.likes += 1;
  res.json({ data: post });
});

// DELETE /api/posts/:id
app.delete("/api/posts/:id", async (req, res) => {
  await delay();
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Post not found" });
  posts.splice(index, 1);
  res.json({ message: "Post deleted" });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🟦  REST server running at http://localhost:${PORT}`);
  console.log("    Try: GET /api/feed");
  console.log("         GET /api/feed/full");
  console.log("         GET /api/users\n");
});
