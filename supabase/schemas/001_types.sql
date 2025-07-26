-- supabase/schemas/001_types.sql

-- Create a custom type for quest categories
do $$
begin
    if not exists (select 1 from pg_type where typname = 'quest_category') then
        create type public.quest_category as enum (
          'looks',
          'communication',
          'intelligence',
          'fitness',
          'self_management',
          'special_skills'
        );
    end if;
end$$;
