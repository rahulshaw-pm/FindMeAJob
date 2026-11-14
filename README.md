# FindMeAJob

A job-search tracker that helps you manage applications across **Saved → Applied → Interview → Offer** stages, with pay ranges, resume versions, interview round notes, and instant local persistence — no backend or database required.

## Features

- **Pipeline Board** — Kanban-style view to drag applications through each hiring stage, compare compensation bands, and log feedback after every interview round.
- **Applications Ledger** — A sortable, filterable table of every application with bulk stage updates, follow-up dates, and CSV export.
- **Resume Variants** — Track tailored resume versions, the target role for each, and which version converts to interviews.
- **Search Insights** — Conversion rates from application to offer, pay spread across opportunities, and a full round-by-round interview log.
- **Attention Strip** — Surfaces applications that are due today, overdue, or going idle, plus upcoming interviews.
- **Mobile/Desktop screen modes** — Responsive layout toggle with the preference remembered between sessions.
- **Local auth** — Simple email/password sign-in and account creation, plus a one-click demo account, all stored in the browser (no server-side auth).
- **Local persistence** — Applications, resumes, accounts, and filter state are saved via `localStorage`/`sessionStorage`, so your data survives reloads.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for dev server and bundling
- [Tailwind CSS](https://tailwindcss.com/) (`@tailwindcss/vite`)
- [lucide-react](https://lucide.dev/) for icons
- [motion](https://motion.dev/) for animations
- [@google/genai](https://www.npmjs.com/package/@google/genai) — Gemini API integration
- Express + dotenv (server-side scaffolding)

## Project Structure

```
src/
├── App.tsx                 # Screen routing, top-level state wiring
├── components/              # UI: pipeline board, applications table, resumes,
│                             #     insights, login, drawers/modals, nav bars
├── hooks/
│   ├── useAuth.ts           # Local email/password auth + demo sign-in
│   └── useJobTracker.ts     # Applications/resumes state, filters, CSV export
├── data/seedData.ts          # Demo seed data
├── types/job.ts              # Core domain types (Stage, JobApplication, filters, etc.)
└── utils/dateStatus.ts       # Due/overdue/idle date helpers
```

## Getting Started

### Prerequisites
- Node.js (18+) and npm

### Install & Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` by default.

### Other scripts

| Command           | Description                         |
|--------------------|--------------------------------------|
| `npm run dev`      | Start the Vite dev server            |
| `npm run build`    | Production build                     |
| `npm run preview`  | Preview the production build         |
| `npm run lint`     | Type-check with `tsc --noEmit`       |
| `npm run clean`    | Remove `dist/` and `server.js`       |

### Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable          | Description                                                  |
|--------------------|----------------------------------------------------------------|
| `GEMINI_API_KEY`  | Required for Gemini AI API calls.                              |
| `APP_URL`         | URL where the app is hosted (used for self-referential links). |

## Demo Account

The app ships with a one-click demo sign-in (no setup required) so you can explore the pipeline, resumes, and insights screens immediately with sample data.

## License

Not yet specified.
