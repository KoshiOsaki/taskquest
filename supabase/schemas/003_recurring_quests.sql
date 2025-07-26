-- supabase/schemas/003_recurring_quests.sql
create table if not exists public.recurring_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  repeat_rule jsonb not null, -- e.g. {"type": "weekly", "days": [1, 3, 5]}
  term smallint,
  category public.quest_category,
  start_date date not null default now(),
  end_date date,
  created_at timestamptz default now() not null
);

comment on table public.recurring_quests is 'Templates for recurring quests.';
comment on column public.recurring_quests.repeat_rule is 'Rule for recurrence, e.g. { "type": "weekly", "days": [1, 3, 5] }.';

-- RLS: Enable Row Level Security
alter table public.recurring_quests enable row level security;

-- RLS: Users can manage their own recurring quests
create policy "Users can manage their own recurring quests"
  on public.recurring_quests for all
  using ( auth.uid() = user_id );
