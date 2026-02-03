# 🚀 Quick Start Guide - noCap

## Start Development (Most Common)
```bash
bun run dev
```
→ Opens at http://localhost:3000

---

## Project Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun install` | Install/update dependencies |

---

## Key Files to Know

### Pages & Routes
- `src/app/page.tsx` - Home page (main chat interface)
- `src/app/chat/page.tsx` - Chat page
- `src/app/submit-slang/page.tsx` - Slang submission form

### API Endpoints
- `src/app/api/chat/route.ts` - LM Studio chat endpoint
- `src/app/api/analyze-image/route.ts` - OCR image analysis

### Configuration
- `src/lib/lm-studio.ts` - LM Studio integration & config
- `src/app/globals.css` - Global styles & theme
- `src/app/layout.tsx` - Root layout & metadata

### Config Files
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `.env.local` - Environment variables (create if needed)

---

## LM Studio Setup (For AI Features)

### Quick Setup
1. Download & install [LM Studio](https://lmstudio.ai/)
2. Download a model (recommended: Mistral 7B Instruct)
3. Go to "Local Server" tab
4. Click "Start Server" (port 1234)
5. Run `bun run dev` and test the chat!

### Verify Connection
The app will auto-detect your model. Check the browser console for:
```
[Request] Sending to http://127.0.0.1:1234/v1/chat/completions with model <model-name>
```

---

## Development Tips

### Hot Reload
- Changes to `.tsx`, `.ts`, `.css` files auto-reload
- API route changes may need manual refresh

### TypeScript
- The project uses TypeScript
- Build errors are ignored (see `next.config.ts`)
- Use proper types for better DX

### Styling
- Uses Tailwind CSS 4
- Global styles in `src/app/globals.css`
- Custom theme variables defined

### Debugging
- Check browser console for errors
- Check terminal for server-side errors
- Use React DevTools for component debugging

---

## Common Issues & Fixes

### Port 3000 in use
```bash
# Use a different port
bun run dev -- -p 3001
```

### LM Studio connection fails
- Ensure LM Studio is running
- Check port 1234 is not blocked
- Verify model is loaded

### Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules
bun install
```

### TypeScript errors
- Check `tsconfig.json`
- Ensure `@types/*` packages are installed
- Restart your IDE/editor

---

## Project Structure Quick Reference

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API routes
│   ├── chat/        # Chat page
│   ├── submit-slang/ # Submission page
│   ├── page.tsx     # Home page
│   ├── layout.tsx   # Root layout
│   └── globals.css  # Global styles
└── lib/             # Utility functions
    └── lm-studio.ts # LM Studio integration
```

---

## Next Steps

1. ✅ Run `bun run dev`
2. ✅ Open http://localhost:3000
3. ✅ Start LM Studio (for AI features)
4. ✅ Start coding!

**Happy hacking! 🎨**
