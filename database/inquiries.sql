-- JAANA inquiry storage schema.
-- Target database: PostgreSQL, including Supabase, Neon, and Vercel Postgres.
-- Run this once in your database SQL editor before wiring the app to SQL storage.

begin;

create extension if not exists pgcrypto;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name varchar(50) not null
    check (
      char_length(trim(name)) between 1 and 50
      and name ~ '^[A-Za-z][A-Za-z .''-]*$'
    ),

  email varchar(254) not null
    check (
      char_length(trim(email)) between 3 and 254
      and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),

  phone varchar(20)
    check (
      phone is null
      or phone = ''
      or phone ~ '^\+[0-9]{7,19}$'
    ),

  organization varchar(120) not null default ''
    check (char_length(organization) <= 120),

  interest varchar(120) not null
    check (char_length(trim(interest)) between 1 and 120),

  recipient_group varchar(20) not null
    check (recipient_group in ('general', 'finance')),

  notes varchar(5000) not null default ''
    check (char_length(notes) <= 5000),

  email_status varchar(20) not null default 'pending'
    check (email_status in ('pending', 'sent', 'failed', 'skipped')),

  email_error text,

  reply_status varchar(20) not null default 'pending'
    check (reply_status in ('pending', 'replied', 'complete')),

  replied_at timestamptz,
  reply_notes text,

  source varchar(40) not null default 'website',
  user_agent text,
  ip_address inet
);

alter table public.inquiries
  add column if not exists reply_status varchar(20) not null default 'pending'
    check (reply_status in ('pending', 'replied', 'complete'));

alter table public.inquiries
  add column if not exists replied_at timestamptz;

alter table public.inquiries
  add column if not exists reply_notes text;

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

create index if not exists inquiries_recipient_group_idx
  on public.inquiries (recipient_group);

create index if not exists inquiries_interest_idx
  on public.inquiries (interest);

create index if not exists inquiries_reply_status_idx
  on public.inquiries (reply_status);

create or replace view public.inquiries_export as
select
  created_at as submitted_at,
  name,
  email,
  coalesce(phone, '') as phone,
  interest,
  recipient_group,
  organization as batch_city_organization,
  notes,
  reply_status,
  replied_at,
  reply_notes,
  email_status
from public.inquiries
order by created_at desc;

comment on table public.inquiries is
  'Inquiry form submissions from the JAANA website. Use inquiries_export for CSV/Excel exports.';

comment on view public.inquiries_export is
  'Flat export view for admin CSV/Excel downloads and manual database exports.';

-- Supabase note:
-- Keep row level security enabled and access this table only from the server with a service role key.
alter table public.inquiries enable row level security;

commit;

-- Time-frame export query example:
-- select *
-- from public.inquiries_export
-- where submitted_at >= timestamp with time zone '2026-04-01T00:00:00Z'
--   and submitted_at < timestamp with time zone '2026-05-01T00:00:00Z'
-- order by submitted_at desc;

-- Mark an inquiry as replied:
-- update public.inquiries
-- set reply_status = 'replied',
--     replied_at = now(),
--     reply_notes = 'Replied by email.'
-- where id = '00000000-0000-0000-0000-000000000000';

-- Mark an inquiry as complete:
-- update public.inquiries
-- set reply_status = 'complete'
-- where id = '00000000-0000-0000-0000-000000000000';
