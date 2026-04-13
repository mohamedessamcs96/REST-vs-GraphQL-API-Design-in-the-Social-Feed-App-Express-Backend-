// ============================================================
//  SHARED MOCK DATABASE
//  Both the REST and GraphQL servers use this same data.
// ============================================================

const users = [
  { id: "1", name: "Alice Johnson",   avatar: "AJ", bio: "Software engineer & coffee addict ☕" },
  { id: "2", name: "Bob Smith",       avatar: "BS", bio: "Designer who codes. Coder who designs." },
  { id: "3", name: "Clara Diaz",      avatar: "CD", bio: "Full-stack dev | Open source enthusiast 🌍" },
  { id: "4", name: "David Park",      avatar: "DP", bio: "Backend wizard 🧙‍♂️ | Node.js lover" },
];

const posts = [
  {
    id: "101",
    authorId: "1",
    content: "Just deployed my first GraphQL API! The flexibility compared to REST is mind-blowing. No more over-fetching! 🚀",
    imageUrl: null,
    createdAt: "2024-06-01T10:00:00Z",
    likes: 42,
    commentIds: ["c1", "c2"],
  },
  {
    id: "102",
    authorId: "2",
    content: "Hot take: REST APIs are still perfectly fine for most use cases. Don't over-engineer your stack. 🔥",
    imageUrl: null,
    createdAt: "2024-06-01T11:30:00Z",
    likes: 87,
    commentIds: ["c3"],
  },
  {
    id: "103",
    authorId: "3",
    content: "Building a news feed today to teach my students the difference between REST and GraphQL. The key insight: with REST you get fixed data shapes, with GraphQL YOU decide the shape. 📚",
    imageUrl: null,
    createdAt: "2024-06-01T12:45:00Z",
    likes: 134,
    commentIds: ["c4", "c5"],
  },
  {
    id: "104",
    authorId: "4",
    content: "Node.js tip of the day: use `Promise.all()` when fetching multiple resources in parallel. Don't await them one by one! ⚡",
    imageUrl: null,
    createdAt: "2024-06-01T14:00:00Z",
    likes: 61,
    commentIds: [],
  },
  {
    id: "105",
    authorId: "1",
    content: "The N+1 problem in REST: to show 10 posts with author info you make 1 (posts) + 10 (users) = 11 requests. GraphQL solves this with a single query. This is why it was invented at Facebook! 🤯",
    imageUrl: null,
    createdAt: "2024-06-01T15:30:00Z",
    likes: 200,
    commentIds: ["c6"],
  },
];

const comments = [
  { id: "c1", postId: "101", authorId: "2", text: "Totally agree! The introspection system alone is worth it.", createdAt: "2024-06-01T10:15:00Z" },
  { id: "c2", postId: "101", authorId: "3", text: "Wait until you try subscriptions for real-time updates 👀", createdAt: "2024-06-01T10:20:00Z" },
  { id: "c3", postId: "102", authorId: "4", text: "Both have their place. Context is everything.", createdAt: "2024-06-01T11:45:00Z" },
  { id: "c4", postId: "103", authorId: "1", text: "Your students are lucky!", createdAt: "2024-06-01T12:50:00Z" },
  { id: "c5", postId: "103", authorId: "4", text: "Demo projects are the best way to learn.", createdAt: "2024-06-01T13:00:00Z" },
  { id: "c6", postId: "105", authorId: "2", text: "This is exactly how Facebook justified GraphQL internally.", createdAt: "2024-06-01T15:35:00Z" },
];

module.exports = { users, posts, comments };
