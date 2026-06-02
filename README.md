# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Supabase

Environment variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
VITE_SUPABASE_STORAGE_BUCKET=uploads
VITE_SUPABASE_MAX_UPLOAD_MB=50
```

`VITE_SUPABASE_URL` must be the project base URL. Do not include `/rest/v1`,
`/storage/v1`, or another API path.

SQL for the public projects table:

```sql
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  project_url text,
  file_path text,
  file_name text,
  file_url text,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Public projects are readable"
on public.projects for select
using (true);

create policy "Anonymous project inserts"
on public.projects for insert
with check (true);

create policy "Anonymous project updates"
on public.projects for update
using (true)
with check (true);
```

Recommended Storage policies for the `uploads` bucket:

```sql
create policy "Public uploads are readable"
on storage.objects for select
using (bucket_id = 'uploads');

create policy "Anonymous project uploads"
on storage.objects for insert
with check (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = 'projects'
);
```

If uploads fail with `The object exceeded the maximum allowed size`, increase the
global Storage limit in Supabase Storage Settings and update the bucket limit.
For a 50 MB bucket limit:

```sql
update storage.buckets
set file_size_limit = 52428800
where id = 'uploads';
```

For larger files on the Free plan, upload the APK/ZIP as GitHub Release assets
and paste the asset URL into the project editor. Do not commit large binaries to
the app repository.

If the `projects` table already exists, add the hosted project URL column:

```sql
alter table public.projects
add column if not exists project_url text;
```
