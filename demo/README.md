# ClimbQuest

A mobile-first climbing app prototype built with React and Vite.

## Features

- Landing and onboarding flow
- Firebase email/password authentication
- Discover recommendations and community feed
- DIY route creation with wall hold selection
- Route detail interactions (like/save/complete)
- Profile and progress dashboard

## Environment Setup

Create a `.env` file in the `demo` folder and add:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

If you still use Supabase in other modules, keep these as well:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Firebase Console Setup

1. Open Firebase Console and create/select your project.
2. Enable `Authentication` -> `Sign-in method` -> `Email/Password`.
3. Add a Web App in Project Settings.
4. Copy the config values into `.env`.

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```
