# 📖 Gunpla Tracker - Quick Reference Guide

## 🚀 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm npm lint

# Install dependencies
npm install
```

---

## 🔑 Environment Variables

Your `.env.local` file should contain:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important:** `NEXT_PUBLIC_` prefix means these are public (safe to expose on client). Never put secret keys here.

---

## 📊 Database Schema Quick Reference

### Table: `gunpla_kits`

| Column           | Type        | Notes                                            |
| ---------------- | ----------- | ------------------------------------------------ |
| `id`             | UUID        | Primary key, auto-generated                      |
| `created_at`     | TIMESTAMPTZ | Auto timestamp                                   |
| `user_id`        | UUID        | Links to auth user (RLS enforced)                |
| `grade`          | ENUM        | HG, HGUC, RG, MG, PG, EG, SD, BB, RE/100, FM, NG |
| `model_number`   | TEXT        | e.g. "001", "191"                                |
| `model_name`     | TEXT        | e.g. "RX-78-2 Gundam"                            |
| `series`         | TEXT        | e.g. "Universal Century" (optional)              |
| `release_year`   | INT4        | Year released (optional)                         |
| `owned`          | BOOLEAN     | true = owned, false = wishlist                   |
| `purchase_price` | NUMERIC     | Price paid (optional, currency agnostic)         |
| `purchase_date`  | DATE        | When purchased (optional)                        |
| `notes`          | TEXT        | User notes (optional)                            |
| `image_url`      | TEXT        | Supabase Storage URL (optional)                  |

---

## 🔐 RLS Policies

All 4 policies are in place:

- ✅ **SELECT**: Users see only their own kits
- ✅ **INSERT**: Users can only add kits for themselves
- ✅ **UPDATE**: Users can only update their own kits
- ✅ **DELETE**: Users can only delete their own kits

All checks are: `auth.uid() = user_id`

---

## 🗂️ File Organization

### Pages (Routes)

```
/           → Dashboard (list all kits)
/login      → Sign in / Sign up
/add        → Create new kit
/edit/[id]  → Edit existing kit
```

### Server Actions (Backend Logic)

- **Authentication**: `src/lib/auth-actions.ts`

  - `signUp(email, password)`
  - `signIn(email, password)`
  - `signOut()`

- **CRUD Operations**: `src/lib/gunpla-actions.ts`
  - `createGunplaKit(data)`
  - `getGunplaKits(filter?)`
  - `getGunplaKitById(id)`
  - `updateGunplaKit(id, data)`
  - `deleteGunplaKit(id)`

### Components

- `Header` - Navigation + Sign out
- `DashboardContent` - Main dashboard with filters
- `GunplaForm` - Add/Edit form
- `GunplaCard` - Kit display card

### Utilities

```typescript
// src/lib/gunpla-utils.ts
formatGunplaDisplay(kit); // "HG 001 RX-78-2 Gundam"
getSeriesAbbreviation(series); // "Universal Century" → "UC"
formatCurrency(price); // 5000 → "¥5,000"
```

---

## 🎨 Display Conventions

### Proper Display Format

✅ **CORRECT**:

```
HG 001 RX-78-2 Gundam
HGUC 191 RX-78-2 Gundam Revive
MG 001 Strike Gundam
```

❌ **WRONG** (don't do this):

```
HGIBO 001 Gundam Barbatos   // "IBO" should be in series field, not grade
HGUC-191 RX-78-2            // Don't add hyphens
Grade: HG                   // Don't break into parts
```

### Grade vs Series

| Field    | Value           | Example                                 |
| -------- | --------------- | --------------------------------------- |
| `grade`  | Simple code     | HG, HGUC, RG, MG                        |
| `series` | Gundam universe | Universal Century, Iron-Blooded Orphans |

This separation ensures clean data and proper display.

---

## 🔄 Common Workflows

### Adding a New Kit

1. User clicks **"+ Add Kit"**
2. Form loads with `GunplaForm` component
3. User fills fields (validates with Zod)
4. Click "Add Kit"
5. `createGunplaKit(data)` server action runs
6. Database insert happens (RLS checks user_id)
7. Redirect to `/` (dashboard refreshes)

### Editing a Kit

1. User clicks "Edit" on a card
2. Navigate to `/edit/[id]`
3. `getGunplaKitById(id)` fetches the kit
4. Form pre-populates with current data
5. User modifies fields
6. Click "Update Kit"
7. `updateGunplaKit(id, data)` runs
8. Redirect to `/`

### Deleting a Kit

1. User clicks "Delete" on a card
2. Confirmation prompt appears
3. Click "Confirm"
4. `deleteGunplaKit(id)` runs
5. Kit removed from database
6. Page refreshes automatically

---

## 🔍 Important Code Patterns

### Server Action (Safe for Mutations)

```typescript
"use server";

export async function createGunplaKit(data: GunplaKitInsert) {
  const supabase = await createServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Insert with user_id (RLS enforces security)
  const { data: kit, error } = await supabase
    .from("gunpla_kits")
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/"); // Refresh cache
  return kit;
}
```

### Client Component (Frontend)

```typescript
'use client'

import { useState } from 'react'
import { createGunplaKit } from '@/lib/gunpla-actions'

export default function AddForm() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data) => {
    try {
      setLoading(true)
      await createGunplaKit(data) // Calls server action
      router.push('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    // Form JSX
  )
}
```

### Form Validation with Zod

```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  model_name: z.string().min(1, 'Required'),
  grade: z.enum(['HG', 'HGUC', 'RG', 'MG', ...]),
})

export default function Form() {
  const { register, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  return (
    <input {...register('model_name')} />
    {errors.model_name && <span>{errors.model_name.message}</span>}
  )
}
```

---

## 🛡️ Authentication Flow

### Sign Up

```
1. User enters email + password
2. signUp() sends to Supabase Auth
3. User receives confirmation email (if enabled)
4. Session created + cookie set
5. Redirects to dashboard
```

### Sign In

```
1. User enters email + password
2. signIn() sends to Supabase Auth
3. Supabase returns session + JWT
4. @supabase/ssr stores JWT in cookie
5. Middleware verifies token on every request
6. Redirects to dashboard if verified
```

### Middleware Check

```
Every request → Check auth.uid()
├─ Has session? → Continue
└─ No session? → Redirect to /login
```

---

## 📈 Statistics Calculation

The dashboard shows:

```typescript
// Total kits
kits.length;

// Owned kits
kits.filter((k) => k.owned).length;

// Total spent
kits
  .filter((k) => k.purchase_price)
  .reduce((sum, k) => sum + (k.purchase_price || 0), 0);
```

---

## 🎯 Next Steps

### To Add Image Upload

1. Create bucket in Supabase Storage: `kit-photos`
2. Add file input to GunplaForm
3. Upload file before saving
4. Store public URL in `image_url`
5. Display image on KitCard

### To Add CSV Export

```typescript
// src/lib/csv-export.ts
export function generateCSV(kits: GunplaKit[]) {
  const headers = ["Grade", "Model #", "Name", "Series", "Owned", "Price"];
  const rows = kits.map((k) => [
    k.grade,
    k.model_number,
    k.model_name,
    k.series,
    k.owned ? "Yes" : "No",
    k.purchase_price || "",
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  downloadAsFile(csv, "gunpla-collection.csv");
}
```

### To Add Dark Mode

```bash
npm install next-themes
```

Then wrap app with `<ThemeProvider>` and use `useTheme()` hook.

---

## ⚙️ Environment Setup Checklist

- [ ] Supabase project created
- [ ] Database tables created with SQL
- [ ] RLS policies enabled
- [ ] Auth enabled (Email provider)
- [ ] `.env.local` file has correct keys
- [ ] `npm install` completed
- [ ] `npm run build` passes without errors
- [ ] `npm run dev` runs successfully
- [ ] Can access http://localhost:3000/login
- [ ] Can sign up and create account
- [ ] Can add/edit/delete kits

---

## 📞 Debugging Tips

### Check Authentication

```typescript
// In browser console
const { data } = await supabase.auth.getUser();
console.log(data.user); // Should show your user ID
```

### Check RLS Policies

Go to Supabase Dashboard → Tables → gunpla_kits → Security policies

All 4 policies should show `auth.uid() = user_id` in the definition.

### Check TypeScript Errors

```bash
npm run build   # Will show all TS errors
```

### Check Network Requests

Open DevTools → Network tab, try to perform an action and look for failed requests.

---

**Happy Gundam collecting! 🤖✨**
