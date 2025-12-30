# 🎨 Gunpla Collection Tracker

A private, personal Gundam Plastic Model (Gunpla) collection tracker built with **Next.js 15+**, **Supabase**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features

- 🔐 **Secure Authentication** - Email/password signup and signin
- 📝 **Manage Your Collection** - Add, edit, and delete Gunpla kits
- 🏷️ **Smart Organization** - Filter by owned/wishlist and search by name/series
- 📊 **Collection Stats** - View total kits owned, wishlist count, and spending
- 🔒 **Privacy First** - All data is private to you (Row Level Security enabled)
- 📱 **Responsive Design** - Mobile-friendly UI with dark mode support
- ⚡ **Modern Stack** - Server Components, Server Actions, type-safe database queries

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works fine)

### 1. Setup Supabase Database

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to **SQL Editor** and run these queries:

#### Create ENUM type:

```sql
CREATE TYPE public.gunpla_grade AS ENUM (
  'HG', 'HGUC', 'RG', 'MG', 'PG', 'EG', 'SD', 'BB', 'RE/100', 'FM', 'NG'
);
```

#### Create table:

```sql
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

CREATE INDEX idx_gunpla_kits_user_id ON public.gunpla_kits(user_id);
CREATE INDEX idx_gunpla_kits_grade ON public.gunpla_kits(grade);
CREATE INDEX idx_gunpla_kits_owned ON public.gunpla_kits(owned);
```

#### Enable RLS and create policies:

```sql
ALTER TABLE public.gunpla_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_kits" ON public.gunpla_kits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_kits" ON public.gunpla_kits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_kits" ON public.gunpla_kits
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_kits" ON public.gunpla_kits
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. Your `.env.local` file already has these (check if they're correct)

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 - you'll be redirected to `/login`

### 4. Create Account and Start Adding Kits!

Sign up with an email and password, then add your first Gunpla kit.

---

## 📁 Project Structure

```
my-gunpla-app/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Dashboard (home)
│   ├── login/               # Authentication pages
│   ├── add/                 # Add new kit page
│   └── edit/[id]/          # Edit kit page
├── src/
│   ├── components/          # React components
│   │   ├── header.tsx      # Navigation header
│   │   ├── gunpla-form.tsx # Add/Edit form
│   │   ├── gunpla-card.tsx # Kit display card
│   │   └── dashboard-content.tsx # Dashboard logic
│   ├── lib/                 # Utilities & actions
│   │   ├── auth-client.ts  # Browser Supabase client
│   │   ├── auth-server.ts  # Server Supabase client
│   │   ├── auth-actions.ts # Auth server actions
│   │   ├── gunpla-actions.ts # CRUD server actions
│   │   ├── gunpla-utils.ts  # Display formatting
│   │   └── schemas.ts       # Zod validation schemas
│   └── types/
│       └── database.types.ts # Generated Supabase types
├── middleware.ts            # Authentication middleware
├── .env.local              # Supabase credentials
└── DEVELOPMENT_PLAN.md     # Full setup guide
```

---

## 🎮 How to Use

### Adding a Kit

1. Click **"+ Add Kit"** in the header
2. Fill in the form:
   - **Grade** _(required)_ - Select from HG, HGUC, RG, MG, PG, EG, SD, BB, RE/100, FM, NG
   - **Model Number** _(required)_ - e.g. "001", "191"
   - **Model Name** _(required)_ - e.g. "RX-78-2 Gundam"
   - **Series** (optional) - e.g. "Universal Century", "Iron-Blooded Orphans"
   - **Release Year** (optional)
   - **Purchase Price** (optional)
   - **Purchase Date** (optional)
   - **Owned?** - Check if you own it, uncheck for wishlist
   - **Notes** (optional)
3. Click **"Add Kit"**

### Display Format

The app displays kits as: **[GRADE] [MODEL_NUMBER] [MODEL_NAME]**

Examples:

- HG 001 RX-78-2 Gundam
- HGUC 191 RX-78-2 Gundam Revive
- MG 001 Strike Gundam

---

## 🔒 Security

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ All queries automatically filtered by `auth.uid() = user_id`
- ✅ Authentication required for all pages except `/login`
- ✅ Session tokens stored securely in HTTP-only cookies

---

## 🛠️ Technology Stack

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| **Next.js 15**      | React framework with App Router |
| **TypeScript**      | Type-safe development           |
| **Supabase**        | PostgreSQL database + Auth      |
| **Tailwind CSS**    | Styling                         |
| **react-hook-form** | Form management                 |
| **Zod**             | Schema validation               |
| **@supabase/ssr**   | Secure auth token handling      |

---

## 📝 Key Files to Know

### Server Actions (Backend)

- `src/lib/auth-actions.ts` - Sign up, sign in, sign out
- `src/lib/gunpla-actions.ts` - CRUD operations for kits

### Components (Frontend)

- `src/components/gunpla-form.tsx` - Add/edit form with validation
- `src/components/gunpla-card.tsx` - Kit display card
- `src/components/dashboard-content.tsx` - Dashboard with filters

### Utilities

- `src/lib/gunpla-utils.ts` - Format display names, currencies
- `src/lib/schemas.ts` - Zod validation schemas
- `src/types/database.types.ts` - Database type definitions

---

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Import Project"** and select your GitHub repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **"Deploy"**

Your app will be live in ~2 minutes!

---

## 🐛 Troubleshooting

### "Can't find module" errors

- Ensure all files are in correct directories
- Check that `@/` imports point to `src/`

### Auth not persisting

- Check browser cookies are enabled
- Verify `.env.local` has correct Supabase keys

### RLS errors (403 Forbidden)

- Ensure you're logged in
- Check that RLS policies are created correctly
- Verify the `user_id` column matches your auth user ID

### Build errors

- Run `npm run build` to check for type errors
- Fix TypeScript errors before deploying

---

## 📚 Further Development

### Planned Features

- [ ] Image upload to Supabase Storage
- [ ] CSV export of collection
- [ ] Dark mode toggle
- [ ] Collection statistics dashboard
- [ ] Series-based filtering
- [ ] Wishlist to collection transfer

### To Add Image Upload

1. Create a Supabase Storage bucket named `kit-photos`
2. Add file input to the form
3. Upload to storage before saving kit
4. Store the public URL in `image_url` column

---

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Report issues or ask questions in your project repo

---

## 📄 License

This project is open source and available under the MIT License.

---

**Happy collecting! 🤖✨**
