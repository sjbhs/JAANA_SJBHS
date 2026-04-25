# Database Setup

Use `inquiries.sql` to create the permanent inquiry table in a PostgreSQL database such as Supabase, Neon, or Vercel Postgres.

Run it in the database SQL editor:

```sql
-- paste database/inquiries.sql here and run it once
```

The table is `public.inquiries`.

The export view is `public.inquiries_export`. Use it for CSV/Excel downloads because the columns are already flattened and ordered for admin review. It includes `reply_status`, which starts as `pending` and can be updated to `replied` or `complete`.

Example time-frame export:

```sql
select *
from public.inquiries_export
where submitted_at >= timestamp with time zone '2026-04-01T00:00:00Z'
  and submitted_at < timestamp with time zone '2026-05-01T00:00:00Z'
order by submitted_at desc;
```

Mark an inquiry as replied:

```sql
update public.inquiries
set reply_status = 'replied',
    replied_at = now(),
    reply_notes = 'Replied by email.'
where id = '00000000-0000-0000-0000-000000000000';
```

Mark an inquiry as complete:

```sql
update public.inquiries
set reply_status = 'complete'
where id = '00000000-0000-0000-0000-000000000000';
```

Keep row level security enabled. The website should write/read this table only from server-side API routes using a private database connection or service role key.
