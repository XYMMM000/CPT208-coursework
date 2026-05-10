<div align="center">

# 🧗 ClimbQuest - CPT208 Coursework

### 🎯 Human-Centered Design Project for Indoor Climbing Experience

[![Demo](https://img.shields.io/badge/Open-Demo_App-2ea44f?style=for-the-badge&logo=react&logoColor=white)](https://climb-quest.vercel.app/)
[![Portfolio](https://img.shields.io/badge/Open-Portfolio_Site-0969da?style=for-the-badge&logo=html5&logoColor=white)](https://xymmm000.github.io/CPT208-coursework/portfolio/index.html)
[![Repository](https://img.shields.io/badge/View-GitHub_Repo-24292f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/XYMMM000/CPT208-coursework)

</div>

---

## 📸 Project Preview

<table>
<tr>
<td width="50%">

### 🎮 The Demo App

A mobile-first climbing product prototype with interactive flows for onboarding, discovery, creation, and community.

- ⚡ Personalized onboarding flow
- 🔐 Firebase email/password authentication
- 🧗 Route discovery and recommendation experience
- 🛠 DIY route creation with wall selection/editor
- 👥 Community interaction and feedback features

</td>
<td width="50%">

### 📚 The Portfolio

A complete HCI coursework website documenting the full design process from motivation to evaluation.

- 🔎 User research and needs analysis
- 🎨 Ideation, structure, and interaction design
- 🧩 Prototype presentation and iteration records
- ✅ Evaluation, reflection, and references
- 👨‍👩‍👧‍👦 Team contributions and responsibilities

</td>
</tr>
</table>

---

## 🛠 Tech Stack

### 💻 Frontend Demo

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=react-router&logoColor=white&style=flat)](https://reactrouter.com/)
[![CSS3](https://img.shields.io/badge/CSS3-Mobile--First-1572B6?logo=css3&logoColor=white&style=flat)](https://developer.mozilla.org/docs/Web/CSS)

### 🗄 Backend & Data Services

[![Firebase Auth](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black&style=flat)](https://firebase.google.com/)
[![Firestore](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black&style=flat)](https://firebase.google.com/docs/firestore)
[![Supabase](https://img.shields.io/badge/Supabase-Optional-3ECF8E?logo=supabase&logoColor=white&style=flat)](https://supabase.com/)

### 🌐 Documentation Site

[![HTML5](https://img.shields.io/badge/HTML5-Static_Pages-E34F26?logo=html5&logoColor=white&style=flat)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Custom_Styles-1572B6?logo=css3&logoColor=white&style=flat)](https://developer.mozilla.org/docs/Web/CSS)

---

## 🚀 Quick Start

### 📥 Clone Repository

```bash
git clone https://github.com/XYMMM000/CPT208-coursework.git
cd CPT208-coursework
```

### ▶️ Run Demo App

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

### 👀 View Portfolio

Open `portfolio/index.html` directly in your browser, or use Live Server in VS Code.

## 🔐 Environment Variables (Demo)

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

## 🗂 Repository Structure

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

## 🤝 Team Collaboration

```bash
git pull origin main
git add .
git commit -m "Describe your update"
git push origin main
```

## 📄 License

This project is for coursework and team learning purposes. Add a formal license file if you plan to open-source it publicly.
