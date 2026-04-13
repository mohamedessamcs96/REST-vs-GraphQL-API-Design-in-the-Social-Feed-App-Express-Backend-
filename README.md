# 📰 REST vs GraphQL — News Feed Teaching Demo

A complete Node.js project for teaching the difference between REST and GraphQL APIs using a Facebook-style news feed.

---

## 🗂️ Project Structure

```
newsfeed-demo/
├── data.js                  ← shared mock database (used by both servers)
├── rest-server/
│   ├── index.js             ← REST API  (port 3001)
│   └── package.json
├── graphql-server/
│   ├── index.js             ← GraphQL API  (port 3002)
│   └── package.json
└── frontend/
    ├── server.js            ← static file server  (port 3000)
    ├── package.json
    └── public/
        └── index.html       ← the comparison UI
```

---

## 🚀 Quick Start

You need **Node.js 16+** installed.

### Step 1 — Install dependencies

```bash
# Install for each server
cd rest-server    && npm install && cd ..
cd graphql-server && npm install && cd ..
cd frontend       && npm install && cd ..
```

### Step 2 — Start the servers (3 separate terminals)

```bash
# Terminal 1 — REST API
cd rest-server && node index.js

# Terminal 2 — GraphQL API
cd graphql-server && node index.js

# Terminal 3 — Frontend
cd frontend && node server.js
```

### Step 3 — Open the browser

👉 **http://localhost:3000**

You'll see a split UI with the REST feed on the left and the GraphQL feed on the right.

---

## ▶️ Run Only the REST Server

If you only want to explore the REST API (no frontend needed):

```bash
cd rest-server
npm install   # first time only
node index.js
```

The REST API will be available at **http://localhost:3001**

| Example | Command |
|---------|---------|
| All posts | `curl http://localhost:3001/api/feed` |
| Posts with author | `curl http://localhost:3001/api/feed/full` |
| Single post | `curl http://localhost:3001/api/posts/101` |
| All users | `curl http://localhost:3001/api/users` |

---

## ▶️ Run Only the GraphQL Server

If you only want to explore the GraphQL API (no frontend needed):

```bash
cd graphql-server
npm install   # first time only
node index.js
```

The GraphQL API will be available at **http://localhost:3002/graphql**

Open that URL in your browser to launch the **GraphiQL interactive playground** — no extra tools needed.

Example queries you can run in GraphiQL:

```graphql
# Minimal feed — only the fields you need
{
  feed {
    content
    likes
  }
}

# Feed with nested author — one request, no N+1
{
  feed {
    content
    likes
    author {
      name
      avatar
    }
  }
}

# Single post by ID
{
  post(id: "101") {
    content
    author { name }
    comments { text }
  }
}

# Create a post (mutation)
mutation {
  createPost(authorId: "1", content: "Hello from GraphQL!") {
    id
    content
    createdAt
  }
}

# Like a post (mutation)
mutation {
  likePost(id: "101") {
    id
    likes
  }
}
```

Or use `curl`:

```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ feed { content likes author { name } } }"}'
```

---

## 🎓 Teaching Guide

### Concept 1 — Multiple endpoints vs. single endpoint

| REST | GraphQL |
|------|---------|
| `GET /api/feed` | `POST /graphql` |
| `GET /api/users` | (same endpoint) |
| `GET /api/posts/:id` | (same endpoint) |

**Demo:** Open the Network tab in DevTools. Click "Reload" on both feeds. REST makes 1 call to `/api/feed/full`. GraphQL makes 1 call to `/graphql`. Both get the same data — but with different approaches.

---

### Concept 2 — Over-fetching (REST problem)

With REST, open the **REST Explorer** tab and call `GET /api/feed`:

```json
{
  "id": "101",
  "authorId": "1",
  "content": "...",
  "imageUrl": null,
  "createdAt": "...",
  "likes": 42,
  "commentIds": ["c1", "c2"]   ← you might not need these!
}
```

The server always returns the same shape. If your UI only needs `content` and `likes`, you still get everything else. This wastes bandwidth — especially on mobile.

**GraphQL solution:** Run this query:
```graphql
{
  feed {
    content
    likes
  }
}
```
You get *only* `content` and `likes`. Nothing else.

---

### Concept 3 — The N+1 Problem (REST problem)

To show a news feed with author names in REST:

1. `GET /api/feed` → 5 posts (but no author names, only `authorId`)
2. `GET /api/users/1` → fetch Alice
3. `GET /api/users/2` → fetch Bob
4. `GET /api/users/3` → fetch Clara
5. `GET /api/users/4` → fetch David

That's **1 + N = 5 requests** to display the feed. With 100 posts, it's 101 requests!

The `/api/feed/full` endpoint solves this by joining data server-side — but now you have a very specific endpoint that can't be reused easily.

**GraphQL solution:** The schema resolver handles this automatically:
```graphql
{
  feed {
    content
    author {
      name     ← fetched in the SAME single request
    }
  }
}
```

---

### Concept 4 — Mutations vs. POST/PUT/DELETE

**REST** uses HTTP verbs:
- `POST /api/posts` → create
- `PUT /api/posts/:id/like` → update
- `DELETE /api/posts/:id` → delete

**GraphQL** uses mutations — same query language, same endpoint:
```graphql
mutation {
  createPost(authorId: "1", content: "Hello!") {
    id
    content
  }
}

mutation {
  likePost(id: "101") {
    likes
  }
}
```

Notice: the mutation also returns data! You specify exactly which fields you want back — no need for a follow-up GET request.

---

### Concept 5 — GraphiQL Playground

Open **http://localhost:3002/graphql** in your browser to explore the GraphQL schema interactively. Click "Docs" in the top right to see all available queries, mutations, and types. This is what "self-documenting API" means — no Swagger needed.

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed` | All posts (no author info) |
| GET | `/api/feed/full` | All posts joined with author |
| GET | `/api/posts/:id` | Single post |
| GET | `/api/posts/:id/comments` | Comments for a post |
| GET | `/api/users` | All users |
| GET | `/api/users/:id` | Single user |
| POST | `/api/posts` | Create post `{ authorId, content }` |
| PUT | `/api/posts/:id/like` | Increment likes |
| DELETE | `/api/posts/:id` | Delete post |

---

## 📡 GraphQL Schema

```graphql
type Query {
  feed: [Post!]!
  post(id: ID!): Post
  users: [User!]!
  user(id: ID!): User
}

type Mutation {
  createPost(authorId: ID!, content: String!): Post!
  likePost(id: ID!): Post!
  deletePost(id: ID!): String!
}

type Post {
  id, content, createdAt, likes
  author: User!
  comments: [Comment!]!
}

type User {
  id, name, avatar, bio
  posts: [Post!]!
}

type Comment {
  id, text, createdAt
  author: User!
}
```

---

## 💡 Key Takeaways for Students

1. **REST** is well-understood, HTTP-native, and great for public APIs.
2. **GraphQL** shines when multiple clients need different shapes of the same data.
3. GraphQL eliminates over-fetching and N+1 — the two biggest REST pain points.
4. Neither is universally "better" — context decides the winner.
5. Facebook invented GraphQL because they had thousands of clients all needing different slices of the same social graph. Most apps don't have that problem.
