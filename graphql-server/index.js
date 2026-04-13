// ============================================================
//  GRAPHQL SERVER  –  runs on port 3002
//
//  TEACHING POINTS shown in comments throughout:
//   • Single endpoint  POST /graphql
//   • Client specifies EXACTLY which fields it wants
//   • No over-fetching / no under-fetching
//   • Nested resolvers naturally solve the N+1 pattern
//   • Self-documenting schema (introspection)
//   • Mutations replace POST/PUT/DELETE
// ============================================================

const express    = require("express");
const cors       = require("cors");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { users, posts, comments } = require("../data");

const app = express();
app.use(cors());

// ============================================================
//  SCHEMA  –  the contract between client and server.
//  Students can explore this interactively in GraphiQL.
// ============================================================
const schema = buildSchema(`
  # ── Types ───────────────────────────────────────────────────
  type User {
    id:        ID!
    name:      String!
    avatar:    String!
    bio:       String!
    posts:     [Post!]!   # nested – resolved on demand
  }

  type Post {
    id:        ID!
    content:   String!
    createdAt: String!
    likes:     Int!
    author:    User!      # resolved on demand – no N+1!
    comments:  [Comment!]!
  }

  type Comment {
    id:        ID!
    text:      String!
    createdAt: String!
    author:    User!
    post:      Post!
  }

  # ── Queries ──────────────────────────────────────────────────
  type Query {
    """Get the news feed.  You choose EXACTLY which fields come back."""
    feed:         [Post!]!

    """Get a single post by id."""
    post(id: ID!): Post

    """Get all users."""
    users:         [User!]!

    """Get a single user by id."""
    user(id: ID!): User
  }

  # ── Mutations ────────────────────────────────────────────────
  type Mutation {
    """Create a new post."""
    createPost(authorId: ID!, content: String!): Post!

    """Like a post – returns the updated post."""
    likePost(id: ID!): Post!

    """Delete a post."""
    deletePost(id: ID!): String!
  }
`);

// ============================================================
//  RESOLVERS
//  Notice: User.posts and Post.author are resolved lazily –
//  they only run when the client actually asks for those fields.
// ============================================================
const root = {
  // ── Queries ────────────────────────────────────────────────
  feed: () => posts,

  post: ({ id }) => posts.find(p => p.id === id) || null,

  users: () => users,

  user: ({ id }) => users.find(u => u.id === id) || null,

  // ── Mutations ──────────────────────────────────────────────
  createPost: ({ authorId, content }) => {
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
    return resolvePost(post);
  },

  likePost: ({ id }) => {
    const post = posts.find(p => p.id === id);
    if (!post) throw new Error("Post not found");
    post.likes += 1;
    return resolvePost(post);
  },

  deletePost: ({ id }) => {
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Post not found");
    posts.splice(index, 1);
    return `Post ${id} deleted`;
  },
};

// ── Helper: wrap a raw post object with nested resolvers ──────
// GraphQL will only CALL these functions when the client asks
// for the nested field – this is the "lazy" resolution model.
function resolvePost(post) {
  return {
    ...post,
    // author is resolved only if the query includes { author { ... } }
    author: () => users.find(u => u.id === post.authorId),
    // comments resolved only if the query includes { comments { ... } }
    comments: () =>
      comments
        .filter(c => c.postId === post.id)
        .map(c => ({
          ...c,
          author: () => users.find(u => u.id === c.authorId),
          post:   () => resolvePost(post),
        })),
  };
}

// Wrap all posts with resolvers (so feed/post queries work too)
const resolvedPosts = {
  feed:  () => posts.map(resolvePost),
  post:  ({ id }) => { const p = posts.find(x => x.id === id); return p ? resolvePost(p) : null; },
  users: () => users.map(u => ({
    ...u,
    posts: () => posts.filter(p => p.authorId === u.id).map(resolvePost),
  })),
  user:  ({ id }) => {
    const u = users.find(x => x.id === id);
    return u ? { ...u, posts: () => posts.filter(p => p.authorId === u.id).map(resolvePost) } : null;
  },
  createPost: root.createPost,
  likePost:   root.likePost,
  deletePost: root.deletePost,
};

// ── Request logger ────────────────────────────────────────────
app.use((req, _res, next) => {
  if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const { query } = JSON.parse(body);
        console.log(`[GraphQL] query → ${query.replace(/\s+/g, " ").trim().slice(0, 120)}`);
      } catch {}
    });
  }
  next();
});

// ── Mount GraphiQL playground + API ──────────────────────────
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: resolvedPosts,
    graphiql: true,   // ← interactive browser IDE at /graphql
  })
);

// ── Start ─────────────────────────────────────────────────────
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`\n🟧  GraphQL server running at http://localhost:${PORT}/graphql`);
  console.log("    Open in browser for the GraphiQL playground!");
  console.log("\n    Example query:");
  console.log(`    { feed { id content likes author { name } } }\n`);
});
