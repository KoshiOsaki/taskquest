create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  recurring_quest_id uuid references public.recurring_quests on delete set null,
  title text not null,
  due_date date not null,
  term smallint, -- 0: 6-9, 1: 9-12, 2: 12-15, 3: 15-18, 4: 18-21, 5: 21-24, 6: 0-3, 7: 3-6
  category public.quest_category,
  is_done boolean default false not null,
  "order" integer default 0 not null,
  created_at timestamptz default now() not null
);

comment on table public.quests is 'Individual quest instances, either one-off or generated from a recurring quest.';
comment on column public.quests.recurring_quest_id is 'The recurring quest this instance was generated from. Can be null for one-off quests.';
comment on column public.quests.due_date is 'The specific date this quest is due.';
comment on column public.quests.term is 'The term of the day the quest belongs to. 0: 6-9, 1: 9-12, ..., 6: 0-3, 7: 3-6';
comment on column public.quests.order is 'Custom sort order for quests, used for manual reordering.';

-- RLS: Enable Row Level Security
alter table public.quests enable row level security;

-- RLS: Users can manage their own quests
create policy "Users can manage their own quests"
  on public.quests for all
  using ( auth.uid() = user_id );
