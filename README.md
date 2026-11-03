# Kage — Where Stillness Reveals the Unseen

An interactive, cinematic 3D night walk through a Kyoto mountain temple rendered live with Three.js WebGL, depth-based parallax layers, particle fireflies, high-intensity glassmorphism, and spotlight command search.

---

## 🚀 Deploying to Vercel

This repository is pre-configured for seamless 1-click deployment on [Vercel](https://vercel.com).

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push this repository to your GitHub, GitLab, or Bitbucket account.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your repository.
4. Vercel automatically detects the project settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**. Your site will be live within seconds!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy directly from your terminal
vercel

# Deploy to production
vercel --prod
```

---

## 🛠 Project Structure

```text
├── vercel.json                 # Vercel deployment config (SPA rewrites, headers, cache rules)
├── vite.config.ts              # Vite + Tailwind v4 + React configuration
├── package.json                # Project dependencies and build scripts
├── index.html                  # HTML entry point with meta tags & SEO
├── public/                     # Static assets served at root
│   ├── audio/                  # Background soundtracks
│   ├── landing-pages/          # Interactive Three.js/WebGL scenes (kage.html)
│   └── secret-pathways-assets/ # Textures, backgrounds, and foreground layers
└── src/                        # React application source code
    ├── components/             # UI components (CommandSearchBar, MagneticKey)
    ├── effects/                # Three.js effect wrappers
    ├── shaders/                # WebGL & shader frame controllers
    ├── App.tsx                 # Main application layout and glassmorphic controls
    ├── main.tsx                # Application bootstrap
    └── index.css               # Tailwind CSS v4 entry point
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server (runs on port 3000)
npm run dev

# 3. Build for production (outputs to /dist)
npm run build

# 4. Preview production build locally
npm run preview
```

---

## ⚡ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 + Glassmorphism UI
- **3D / Graphics**: Three.js + WebGL shaders
- **Animation**: Motion (Framer Motion v12) with 120Hz spring physics
- **Icons**: Lucide React
