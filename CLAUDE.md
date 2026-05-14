# CLAUDE.md

## Project
Zero-Day Radar — A critical CVE (security vulnerability) tracking platform where admins publish vulnerability records and visitors monitor them in real time.

## Stack
- **Frontend:** React (Vite) or plain HTML/CSS/JS
- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3) or MongoDB
- **Auth:** Session-based with express-session
- **Deployment:** Local / university server

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Test single: `npm test -- path/to/file`
- Test all: `npm test`
- Lint: `npm run lint`

## Architecture
- `src/routes/` → Express route handlers (auth, vulnerabilities, gallery, announcements)
- `src/controllers/` → Business logic, keep routes thin
- `src/middleware/` → CSRF protection, session check, IP counter, online tracker
- `src/models/` → Database access layer only — no business logic elsewhere
- `src/views/` → EJS/HTML templates or React components
- `public/uploads/` → Locally stored gallery images (never served raw without auth check)
- `admin/` → Admin panel routes, all protected by auth middleware

## Rules
- NEVER commit `.env` files, secrets, or credentials
- IMPORTANT: All admin routes must go through `isAuthenticated` middleware before any handler
- IMPORTANT: All state-changing forms must include and validate a CSRF token — no exceptions
- Slugify all vulnerability URLs: `/vulnerability/apache-log4j-rce`, never `/vulnerability/1`
- IP-based visitor counter must increment once per unique IP per day, tracked server-side
- Online user count must use server-side session tracking, not client estimates
- Gallery image uploads go to `public/uploads/` only; validate file type and size before saving
- All async route handlers must use try/catch or an error-handling wrapper
- Do not mix business logic into route files — delegate to controllers

## Workflow
- Ask clarifying questions before starting any feature that touches auth or CSRF
- Make minimal changes; do not refactor unrelated files
- After adding a route, verify it is covered by the appropriate middleware
- Create one commit per logical feature (e.g., "feat: add CSRF middleware", "feat: slugify vulnerability routes")
- When two implementation approaches exist, explain both and let me choose
- Run lint after every set of changes

## Out of Scope
- No SSR frameworks (Next.js, Nuxt) — backend is Express only
- No third-party CVE API integration unless explicitly requested
- Do not modify `public/uploads/` manually — only through the admin panel upload flow
- Do not add real-time WebSocket features unless asked; polling is acceptable for online user count