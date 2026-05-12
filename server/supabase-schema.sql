-- Supabase schema for the first migration slice: admin authentication
-- Apply this in the Supabase SQL editor before enabling USE_SUPABASE=true.

create extension if not exists "pgcrypto";

create table if not exists public.admins (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    admin_id text not null unique,
    institution_type text,
    email text not null unique,
    password text not null,
    role text not null default 'admin',
    created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Service-role access is used from the backend.
-- You can add policies later if you want browser-side access.
