# 🎯 Gunpla Collection Tracker - Complete Development Plan

## Overview

Build a private, personal Gunpla (Gundam Plastic Model) collection tracker using Next.js 15+, Supabase, and TypeScript.

---

## ⚠️ IMPORTANT: Display Conventions

These rules must be followed everywhere in the UI:

1. **Grade Storage**: Store as simple values: `HG`, `HGUC`, `RG`, `MG`, `PG`, `EG`, `SD`, `BB`, `RE/100`, `FM`, `NG`
2. **Series Field**: Timeline/world info goes here (e.g., "Iron-Blooded Orphans", "Universal Century")
3. **Display Format**: `[GRADE] [MODEL_NUMBER] [MODEL_NAME]`
   - Examples:
     - HG 001 RX-78-2 Gundam
     - HGUC 191 RX-78-2 Gundam Revive
     - MG 001 Strike Gundam
4. **List View**: Grade badge → Series (small) → Model Number → Name

---

## PHASE 1: Project Setup ✅ (DONE)

### What's been completed:

- ✅ Next.js 15.1.1 with TypeScript, Tailwind CSS
- ✅ src/ directory structure
- ✅ Supabase client (`lib/supabase.ts`)
- ✅ Environment variables (.env.local)
- ✅ Installed: react-hook-form, zod, clsx, date-fns
- ✅ Installed: @supabase/ssr package

### Verify setup:

```bash
npm run dev
```

Visit http://localhost:3000 - should see your Next.js app

---

## PHASE 2: Supabase Database Setup

### CRITICAL: Run these SQL queries in Supabase Dashboard

Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query

#### Query 1: Create ENUM type

```sql
-- Create ENUM type for Gunpla grades
CREATE TYPE public.gunpla_grade AS ENUM (
  'HG',
  'HGUC',
  'RG',
  'MG',
  'PG',
  'EG',
  'SD',
  'BB',
  'RE/100',
  'FM',
  'NG'
);
```

#### Query 2: Create table with RLS

```sql
-- Create gunpla_kits table with all columns
CREATE TABLE public.gunpla_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  grade public.gunpla_grade NOT NULL,
  model_number TEXT NOT NULL,
  model_name TEXT NOT NULL,
  release_year INT4,
  series TEXT,
  owned BOOLEAN NOT NULL DEFAULT FALSE,
  purchase_price NUMERIC,
  purchase_date DATE,
  notes TEXT,
  image_url TEXT,

  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_gunpla_kits_user_id ON public.gunpla_kits(user_id);
CREATE INDEX idx_gunpla_kits_grade ON public.gunpla_kits(grade);
CREATE INDEX idx_gunpla_kits_owned ON public.gunpla_kits(owned);
```

#### Query 3: Enable RLS and create policies

```sql
-- Enable Row Level Security
ALTER TABLE public.gunpla_kits ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only see their own kits
CREATE POLICY "select_own_kits" ON public.gunpla_kits
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own kits
CREATE POLICY "insert_own_kits" ON public.gunpla_kits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own kits
CREATE POLICY "update_own_kits" ON public.gunpla_kits
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own kits
CREATE POLICY "delete_own_kits" ON public.gunpla_kits
  FOR DELETE USING (auth.uid() = user_id);
```

✅ Verify: In Supabase Dashboard → Tables → gunpla_kits, you should see all columns and "RLS enabled" badge

---

## PHASE 3: Generate Supabase Types

In terminal:

```bash
cd D:\Semester\ 4\Personal\my-gunpla-app
npx supabase gen types typescript --project-id cwtenbzbndmdmwffvgnm --schema public > src/types/database.types.ts
```

This generates TypeScript types for your database schema at `src/types/database.types.ts`

---

## PHASE 4: Authentication Setup

### Enable Email Auth in Supabase:

1. Go to: Dashboard → Authentication → Providers
2. Ensure **Email** is enabled (default)
3. Optional: Enable **GitHub** for OAuth

### Create Login Page

Create `app/(auth)/login/page.tsx`:

- Sign up form (email + password)
- Sign in form (email + password)
- Handle redirects

### Create Protected Middleware

Create `middleware.ts` at root:

- Redirect unauthenticated users to `/login`
- Maintain auth session across navigation

---

## PHASE 5: Main Pages

### Dashboard (/)

- List all kits (owned/wishlist/all)
- Display format: `[GRADE] [MODEL_NUMBER] [MODEL_NAME]`
- Search by name/number
- Stats: total owned, wishlist count, total spent
- Buttons: Add, Edit, Delete

### Add Kit (/add)

- Form with all fields
- react-hook-form + zod validation
- Grade dropdown from enum
- Submit creates new kit

### Edit Kit (/edit/[id])

- Pre-fill current data
- Update only own data (RLS protects)

---

## PHASE 6-7: UI Components & Extras

### Components to create:

- `KitCard` - Display single kit with display conventions
- `KitForm` - Reusable form (add/edit)
- `KitList` - List view with filters
- `SearchBar` - Search by model_name/number
- `StatsWidget` - Show counts and totals

### Bonus Features:

- Image upload to Supabase Storage
- CSV export
- Delete confirmation dialogs
- Loading skeletons
- Dark mode support

---

## Key Warnings ⚠️

1. **RLS is mandatory** - Without it, users can access each other's data
2. **Use auth.uid()** - Always filter by user_id in queries
3. **env variables** - Use NEXT*PUBLIC* only for public keys
4. **Server Actions** - Use for mutations (INSERT/UPDATE/DELETE)
5. **Cookies** - Auth token stored in cookies automatically via @supabase/ssr
6. **Grade enum** - Never store "HGIBO" or "HGUC" as grade, use "HG" + series field

---

## Next Steps

1. ✅ Phase 1: Setup done
2. ⏭️ Phase 2: Run SQL queries in Supabase Dashboard
3. ⏭️ Phase 3: Generate types with supabase CLI
4. ⏭️ Phase 4: Create login page and middleware
5. ⏭️ Phase 5: Build dashboard and forms
6. ⏭️ Phase 6-7: Add bonus features and deploy to Vercel
