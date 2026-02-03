import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitSlang = mutation({
    args: {
        term: v.string(),
        meaning: v.string(),
        examples: v.array(v.string()),
        origin: v.optional(v.string()),
        socialCircle: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("slang", {
            term: args.term.toLowerCase(),
            meaning: args.meaning,
            examples: args.examples,
            origin: args.origin,
            socialCircle: args.socialCircle,
            createdAt: Date.now(),
            status: "pending",
        });
    },
});
