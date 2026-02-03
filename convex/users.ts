import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        profilePictureUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            // Update basic info but keep isAdmin and role as is
            await ctx.db.patch(existing._id, {
                email: args.email,
                firstName: args.firstName,
                lastName: args.lastName,
                profilePictureUrl: args.profilePictureUrl,
                lastLogin: Date.now(),
            });
            return { ...existing, lastLogin: Date.now() };
        } else {
            const id = await ctx.db.insert("users", {
                userId: args.userId,
                email: args.email,
                firstName: args.firstName,
                lastName: args.lastName,
                profilePictureUrl: args.profilePictureUrl,
                isAdmin: false,
                role: "user", // Default role
                lastLogin: Date.now(),
            });
            const newUser = await ctx.db.get(id);
            return newUser;
        }
    },
});

export const get = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();
    },
});
