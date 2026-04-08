# ClimbQuest Demo

## Project Overview
ClimbQuest is a mobile-first web app prototype for climbing route discovery, route creation, and community interaction.  
This repository contains the React demo used for coursework exploration in human-centered and playful product design.

The app focuses on helping climbers:
- discover suitable routes
- create and share their own routes
- engage with a social climbing community

## Core Features
- Landing page with onboarding flow
- Firebase email/password authentication
- Personalized recommendation page
- DIY route creation page with climbing-wall hold selection
- Community feed with search and filters
- Route detail page with interactions:
  - rate
  - comment
  - like
  - save
  - mark as completed
- Profile dashboard with progress and activity summary
- Firestore-backed community data + AI starter route suggestions

## Tech Stack
- React 18
- Vite
- React Router (v6)
- Firebase Authentication
- Firebase Firestore
- CSS (mobile-first custom styling)

## Setup Instructions
### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Create a `.env` file in the `demo` folder:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Optional (if Supabase modules are used in your branch):
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 3) Firebase Console setup
1. Create or select a Firebase project.
2. Enable `Authentication -> Sign-in method -> Email/Password`.
3. Create a `Firestore Database`.
4. Add a Web App and copy config values into `.env`.
5. Ensure Firestore rules allow your intended read/write pattern.

## How To Run Locally
```bash
npm run dev
```

Then open the local URL shown in the terminal (usually `http://localhost:5173`).

Useful scripts:
```bash
npm run build
npm run preview
```

## Folder Structure Overview
```text
demo/
  src/
    components/
      auth/            # Auth guard components
      layout/          # Shared app layout
      navigation/      # Bottom tab navigation
      ui/              # Reusable UI components
    context/
      AuthContext.jsx  # Global auth state and actions
    lib/
      firebase.js      # Firebase app/auth/firestore setup
    pages/
      LandingPage.jsx
      OnboardingPage.jsx
      HomePage.jsx
      DiscoverPage.jsx
      CreatePage.jsx
      CommunityPage.jsx
      RouteDetailPage.jsx
      ProfilePage.jsx
      LoginPage.jsx
      SignupPage.jsx
    styles/
      climbquest.css   # App styles (mobile-first)
    App.jsx            # Router setup
    main.jsx           # App entry point
```

## Deployment Notes
- Recommended platform: Vercel
- Do not upload `.env` to GitHub
- Add the same `VITE_FIREBASE_*` values in Vercel:
  - `Project -> Settings -> Environment Variables`
- Redeploy after changing environment variables
- Verify Firebase Authentication and Firestore rules for production safety

## AI Usage Note
This demo includes AI-assisted elements:
- AI-generated starter routes in the community feed for inspiration
- AI assistance used during ideation and implementation support

AI outputs should be reviewed and validated before production use.

## Credits
- Project concept and product direction: ClimbQuest coursework team
- Frontend implementation: React + Firebase demo build
- Tools and libraries: React, Vite, Firebase, React Router
