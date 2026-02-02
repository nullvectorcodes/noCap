# noCap Documentation

## Overview
**noCap** is an AI-powered slang decoder that translates modern slang into plain English. It uses a **Next.js** frontend and connects to a **local LLM** via LM Studio to ensure privacy and offline capability.

## Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes (Serverless functions)
- **Runtime**: Bun
- **AI Engine**: Local LLM (via LM Studio)

## Setup & Run

### 1. Start LM Studio
This application requires a local LLM running on port `1234`.
1. Open **LM Studio**.
2. Load a model (e.g., Mistral 7B).
3. Start the Local Server.

### 2. Run the Application
The project is located in the root directory.

```bash
# Go to the project root
cd /Users/mohammadsaalim/projects

# Install dependencies
bun install

# Start the dev server
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `src/app/page.tsx`: The main chat interface.
- `src/app/api/chat/route.ts`: The API route that proxies requests to LM Studio.
- `src/app/globals.css`: Global styles and theme variables.

## Troubleshooting
- **`dev` script not found**: You are likely in a subdirectory like `frontend` or `_legacy`. Run `cd ..` until you are in the root `projects` folder.
