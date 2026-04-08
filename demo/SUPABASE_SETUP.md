## Supabase Setup

1. Copy `.env.example` to `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. In Auth settings, enable Email/Password provider.
4. Start app:
   - `npm install`
   - `npm run dev`

The app now supports:
- Login / Register
- User display name update
- User-scoped route create/list/delete
