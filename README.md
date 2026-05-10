# ClimbQuest - CPT208 Coursework

ClimbQuest is a coursework project focused on human-centered design for indoor climbing experiences.
This repository includes:

- `demo/`: React mobile-first web app prototype (interactive product demo)
- `portfolio/`: static HTML/CSS design portfolio (research, ideation, prototype, evaluation)

## Project Highlights

### Demo App (`demo/`)

- Landing page and onboarding flow
- Email/password login and signup (Firebase Auth)
- Personalized climbing preferences onboarding
- Route discovery and community browsing
- DIY route creation with wall selection and editor flow
- Profile page with progress and activity summary

### Portfolio Site (`portfolio/`)

- Human-centered computing process documentation
- Motivation, research, personas, ideation, prototype, evaluation, references, and team pages
- Static multi-page site for coursework submission and presentation

## Tech Stack

### Demo App

- React 18
- Vite 5
- React Router 6
- Firebase Authentication + Firestore
- Supabase (optional modules / schema support)
- CSS (mobile-first custom styles)

### Portfolio

- HTML5
- CSS3

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/XYMMM000/CPT208-coursework.git
cd CPT208-coursework
```

### 2. Run Demo App

```bash
cd demo
npm install
npm run dev
```

Default local URL: `http://localhost:5173`

Optional scripts:

```bash
npm run build
npm run preview
```

### 3. View Portfolio

Open `portfolio/index.html` directly in your browser, or use Live Server in VS Code.

## Environment Variables (Demo)

Create `demo/.env` based on `demo/.env.example`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Optional
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

If you use Supabase features, see `demo/SUPABASE_SETUP.md` and execute `demo/supabase/schema.sql` in Supabase SQL Editor.

## Repository Structure

```text
CPT208-coursework/
  demo/                  # React + Vite product prototype
    src/
      components/        # Layout, auth guard, navigation, reusable UI
      context/           # Auth and experience mode context
      lib/               # Firebase config and helpers
      pages/             # Landing, onboarding, home, discover, create, community, profile
      styles/            # Main app styles
    supabase/            # Supabase schema and setup support
  portfolio/             # Static coursework portfolio website
    pages/               # Motivation, research, users, ideation, prototype, evaluation, etc.
    assets/              # Images, QR, prototype and team materials
```

## Team Collaboration

Typical workflow:

```bash
git pull origin main
git add .
git commit -m "Describe your update"
git push origin main
```

## License

This project is for coursework and team learning purposes. Add a formal license file if you plan to open-source it publicly.
