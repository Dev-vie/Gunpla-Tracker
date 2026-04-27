-- Gunpla Tracker database bootstrap for new Supabase project
-- Run this in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

-- Enums
create type public.gunpla_grade as enum (
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

create type public.gunpla_subline as enum (
  'HGUC',
  'HGIBO',
  'HGCE',
  'HG00',
  'HGAC',
  'HGAGE',
  'HGBF',
  'HGGTO',
  'HGBC'
);

create type public.kit_brand as enum (
  'Bandai',
  'SNAA',
  'Motor Nuclear',
  'In Era+',
  'Hemoxian',
  'CangDao',
  'AniMester',
  'Other'
);

create type public.kit_product_line as enum (
  'Gunpla',
  'Kamen Rider',
  'Other Tokusatsu'
);

-- Profiles table
create table public.profiles (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null primary key references auth.users(id) on delete cascade,
  display_name text,
  username text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (id)
);

-- Gunpla kits table
create table public.gunpla_kits (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  brand public.kit_brand not null default 'Bandai',
  product_line public.kit_product_line,
  grade public.gunpla_grade not null default 'HG',
  subline public.gunpla_subline,
  model_number text not null,
  model_name text not null,
  series text,
  release_year integer,
  owned boolean not null default false,
  exclusive boolean default false,
  purchase_price numeric,
  purchase_date date,
  image_url text,
  created_at timestamptz not null default now()
);

create index idx_gunpla_kits_user_id on public.gunpla_kits(user_id);
create index idx_gunpla_kits_grade on public.gunpla_kits(grade);
create index idx_gunpla_kits_owned on public.gunpla_kits(owned);

-- Row level security
alter table public.profiles enable row level security;
alter table public.gunpla_kits enable row level security;

create policy "select_own_profile" on public.profiles
for select using (auth.uid() = user_id);

create policy "insert_own_profile" on public.profiles
for insert with check (auth.uid() = user_id);

create policy "update_own_profile" on public.profiles
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_profile" on public.profiles
for delete using (auth.uid() = user_id);

create policy "select_own_kits" on public.gunpla_kits
for select using (auth.uid() = user_id);

create policy "insert_own_kits" on public.gunpla_kits
for insert with check (auth.uid() = user_id);

create policy "update_own_kits" on public.gunpla_kits
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_kits" on public.gunpla_kits
for delete using (auth.uid() = user_id);
