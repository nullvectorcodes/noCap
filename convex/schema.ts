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
});
