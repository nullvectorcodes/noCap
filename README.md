# 🚀 noCap - Slang Decoder

> **Decode the streets, one phrase at a time.** — A premium AI-powered slang analyzer built with Next.js, Tailwind CSS, and local LLMs.

---

## ✨ Features

- **Modern Architecture**: Built with [Next.js](https://nextjs.org/) (App Router) & [Bun](https://bun.sh/).
- **Premium UI**: Dark mode, glassmorphism, and smooth animations using [Framer Motion](https://www.framer.com/motion/).
- **Privacy-First AI**: Runs offline using [LM Studio](https://lmstudio.ai/) (local LLMs).
- **Fast**: Optimized for performance with Bun and TurboPack.

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Bun**: [Install Bun](https://bun.sh/docs/installation)
- **LM Studio**: [Install LM Studio](https://lmstudio.ai/)
  - **Load a Model**: (e.g., Mistral 7B Instruct)
  - **Start Server**: Ensure the local inference server is running at `http://localhost:1234`.

### 2. Installation
```bash
# Clone the repository (if not already done)
git clone <repo-url>
cd projects

# Install dependencies (if needed)
bun install
```

### 3. Run the App
```bash
# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
projects/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts  # Backend API for LM Studio
│   │   ├── page.tsx           # Main Chat Interface
│   │   ├── layout.tsx         # App Layout (Fonts, Metadata)
│   │   └── globals.css        # Global Styles & Theme
│
├── _legacy/                   # Archived frontend/backend code
├── public/                    # Static Assets
├── bun.lock                   # Lockfile
└── package.json               # Dependencies
```

---

## 📞 Troubleshooting

**"Failed to connect to the server"**
> Ensure LM Studio is open and the local server is **Start**ed on port `1234`.

**"Script not found 'dev'"**
> Ensure you are in the root directory (`/projects`), **NOT** in `frontend` or `_legacy`.
