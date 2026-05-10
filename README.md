<div align="center">

# ClimbQuest - CPT208 Coursework

### Human-Centered Design Project for Indoor Climbing Experience

[![Demo](https://img.shields.io/badge/Open-Demo_App-2ea44f?style=for-the-badge&logo=react&logoColor=white)](https://climb-quest.vercel.app/)
[![Portfolio](https://img.shields.io/badge/Open-Portfolio_Site-0969da?style=for-the-badge&logo=html5&logoColor=white)](https://xymmm000.github.io/CPT208-coursework/portfolio/index.html)
[![Repository](https://img.shields.io/badge/View-GitHub_Repo-24292f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/XYMMM000/CPT208-coursework)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Optional-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

## Project Overview

ClimbQuest is a coursework project focused on human-centered design for indoor climbing experiences.
This repository includes:

- `demo/`: React mobile-first web app prototype (interactive product demo)
- `portfolio/`: static HTML/CSS design portfolio (research, ideation, prototype, evaluation)

## Quick Access

- [Run Demo Locally](#run-demo-app)
- [View Portfolio](#view-portfolio)
- [Environment Setup](#environment-variables-demo)
- [Project Structure](#repository-structure)

## Project Highlights

### Demo App

- Landing page and onboarding flow
- Email/password login and signup (Firebase Auth)
- Personalized climbing preferences onboarding
- Route discovery and community browsing
- DIY route creation with wall selection and editor flow
- Profile page with progress and activity summary

### Portfolio Site

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

### Clone Repository

```bash
git clone https://github.com/XYMMM000/CPT208-coursework.git
cd CPT208-coursework
```

### Run Demo App

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

### View Portfolio

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

```bash
git pull origin main
git add .
git commit -m "Describe your update"
git push origin main
```

## License

This project is for coursework and team learning purposes. Add a formal license file if you plan to open-source it publicly.

