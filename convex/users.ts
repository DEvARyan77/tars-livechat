import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const storeUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existingUser._id;
    }

    const emailExists = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (emailExists) {
      throw new Error(`User with email ${args.email} already exists.`);
    }

    const nameExists = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (nameExists) {
      throw new Error(`User with username ${args.name} already exists.`);
    }

    return await ctx.db.insert("users", args);
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query) return [];

    const users = await ctx.db.query("users").collect();

    return users.filter((u) =>
      u.name.toLowerCase().includes(args.query.toLowerCase()),
    );
  },
});

export const addRecentSearch = mutation({
  args: { searcherId: v.id("users"), searchedUserId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("recentSearches")
      .withIndex("by_searcher", (q) => q.eq("searcherId", args.searcherId))
      .filter((q) => q.eq(q.field("searchedUserId"), args.searchedUserId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { timestamp: Date.now() });
    } else {
      await ctx.db.insert("recentSearches", {
        searcherId: args.searcherId,
        searchedUserId: args.searchedUserId,
        timestamp: Date.now(),
      });
    }
  },
});

export const getRecentSearches = query({
  args: { searcherId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.searcherId) return [];

    const searches = await ctx.db
      .query("recentSearches")
      .withIndex("by_searcher", (q) =>
        q.eq("searcherId", args.searcherId as Id<"users">),
      )
      .order("desc")
      .take(10);
    const userResults = await Promise.all(
      searches.map((s) => ctx.db.get(s.searchedUserId)),
    );
    return userResults.filter((u): u is Doc<"users"> => u !== null);
  },
});

export const updatePresence = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { lastSeen: Date.now() });
  },
});

export const getOnlineStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.lastSeen) return { isOnline: false, lastSeen: null };

    const isOnline = Date.now() - user.lastSeen < 1000; 
    return { isOnline, lastSeen: user.lastSeen };
  },
});
