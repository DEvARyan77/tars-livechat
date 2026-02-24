import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    lastSeen: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_name", ["name"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    lastMessageId: v.optional(v.id("messages")),
    updatedAt: v.number(),
    lastSeen: v.optional(v.record(v.string(), v.number())),
    typingIndicators: v.optional(v.record(v.string(), v.number())),
  }).index("by_participants", ["participants"]),

  recentSearches: defineTable({
    searcherId: v.id("users"),
    searchedUserId: v.id("users"),
    timestamp: v.number(),
  }).index("by_searcher", ["searcherId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
    deleted: v.boolean(),
  }).index("by_conversation", ["conversationId"]),
});
