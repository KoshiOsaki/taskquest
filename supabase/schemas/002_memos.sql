-- supabase/schemas/002_memos.sql
create table if not exists public.memos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null,
  content     text,
  created_at  timestamptz default now() not null
);

comment on table public.memos is 'User memos.';

-- RLS: Enable Row Level Security
alter table public.memos enable row level security;

-- RLS: Users can manage their own memos
create policy "Users can manage their own memos"
  on public.memos for all
  using ( auth.uid() = user_id );
