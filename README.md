# Muezzin — Prayer Times

A Progressive Web App (PWA) for Islamic prayer times and adhan player, built with Vue 3, Vite, and Tailwind CSS.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

## Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd muezzin-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## Tech Stack

- **Vue 3** — UI framework
- **Vite** — Build tool and dev server
- **Tailwind CSS v4** — Utility-first styling
- **vite-plugin-pwa** — PWA support with service worker
- **lucide-vue-next** — Icon library

## Deployment

The project is configured for [Vercel](https://vercel.com). Push to your connected branch and Vercel will automatically build and deploy using:

- Build command: `npm run build`
- Output directory: `dist`

## Features

- Prayer times based on device location
- Adhan player
- Hijri calendar view
- Push notifications for prayer times
- Multilingual support (i18n)
- Installable as a PWA on mobile and desktop
