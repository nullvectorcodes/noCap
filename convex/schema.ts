import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        userId: v.string(), // WorkOS User ID
        email: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        profilePictureUrl: v.optional(v.string()),
        isAdmin: v.optional(v.boolean()),
        role: v.string(), // "user" | "admin" | "moderator"
        lastLogin: v.number(),
    }).index("by_userId", ["userId"]),
    slang: defineTable({
        term: v.string(), // Lowercase term
        meaning: v.string(),
        examples: v.array(v.string()),
        origin: v.optional(v.string()),
        socialCircle: v.optional(v.string()), // e.g. Gen-Alpha
        status: v.string(), // "pending" | "approved" | "rejected"
        createdAt: v.number(),
    }),
});
