create type "public"."quest_category" as enum ('looks', 'communication', 'intelligence', 'fitness', 'self_management', 'special_skills');

create table "public"."memos" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "content" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."memos" enable row level security;

create table "public"."quests" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "recurring_quest_id" uuid,
    "title" text not null,
    "due_date" date not null,
    "term" smallint,
    "category" quest_category,
    "is_done" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."quests" enable row level security;

create table "public"."recurring_quests" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "repeat_rule" jsonb not null,
    "term" smallint,
    "category" quest_category,
    "start_date" date not null default now(),
    "end_date" date,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."recurring_quests" enable row level security;

CREATE UNIQUE INDEX memos_pkey ON public.memos USING btree (id);

CREATE UNIQUE INDEX quests_pkey ON public.quests USING btree (id);

CREATE UNIQUE INDEX recurring_quests_pkey ON public.recurring_quests USING btree (id);

alter table "public"."memos" add constraint "memos_pkey" PRIMARY KEY using index "memos_pkey";

alter table "public"."quests" add constraint "quests_pkey" PRIMARY KEY using index "quests_pkey";

alter table "public"."recurring_quests" add constraint "recurring_quests_pkey" PRIMARY KEY using index "recurring_quests_pkey";

alter table "public"."memos" add constraint "memos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."memos" validate constraint "memos_user_id_fkey";

alter table "public"."quests" add constraint "quests_recurring_quest_id_fkey" FOREIGN KEY (recurring_quest_id) REFERENCES recurring_quests(id) ON DELETE SET NULL not valid;

alter table "public"."quests" validate constraint "quests_recurring_quest_id_fkey";

alter table "public"."quests" add constraint "quests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."quests" validate constraint "quests_user_id_fkey";

alter table "public"."recurring_quests" add constraint "recurring_quests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."recurring_quests" validate constraint "recurring_quests_user_id_fkey";

grant delete on table "public"."memos" to "anon";

grant insert on table "public"."memos" to "anon";

grant references on table "public"."memos" to "anon";

grant select on table "public"."memos" to "anon";

grant trigger on table "public"."memos" to "anon";

grant truncate on table "public"."memos" to "anon";

grant update on table "public"."memos" to "anon";

grant delete on table "public"."memos" to "authenticated";

grant insert on table "public"."memos" to "authenticated";

grant references on table "public"."memos" to "authenticated";

grant select on table "public"."memos" to "authenticated";

grant trigger on table "public"."memos" to "authenticated";

grant truncate on table "public"."memos" to "authenticated";

grant update on table "public"."memos" to "authenticated";

grant delete on table "public"."memos" to "service_role";

grant insert on table "public"."memos" to "service_role";

grant references on table "public"."memos" to "service_role";

grant select on table "public"."memos" to "service_role";

grant trigger on table "public"."memos" to "service_role";

grant truncate on table "public"."memos" to "service_role";

grant update on table "public"."memos" to "service_role";

grant delete on table "public"."quests" to "anon";

grant insert on table "public"."quests" to "anon";

grant references on table "public"."quests" to "anon";

grant select on table "public"."quests" to "anon";

grant trigger on table "public"."quests" to "anon";

grant truncate on table "public"."quests" to "anon";

grant update on table "public"."quests" to "anon";

grant delete on table "public"."quests" to "authenticated";

grant insert on table "public"."quests" to "authenticated";

grant references on table "public"."quests" to "authenticated";

grant select on table "public"."quests" to "authenticated";

grant trigger on table "public"."quests" to "authenticated";

grant truncate on table "public"."quests" to "authenticated";

grant update on table "public"."quests" to "authenticated";

grant delete on table "public"."quests" to "service_role";

grant insert on table "public"."quests" to "service_role";

grant references on table "public"."quests" to "service_role";

grant select on table "public"."quests" to "service_role";

grant trigger on table "public"."quests" to "service_role";

grant truncate on table "public"."quests" to "service_role";

grant update on table "public"."quests" to "service_role";

grant delete on table "public"."recurring_quests" to "anon";

grant insert on table "public"."recurring_quests" to "anon";

grant references on table "public"."recurring_quests" to "anon";

grant select on table "public"."recurring_quests" to "anon";

grant trigger on table "public"."recurring_quests" to "anon";

grant truncate on table "public"."recurring_quests" to "anon";

grant update on table "public"."recurring_quests" to "anon";

grant delete on table "public"."recurring_quests" to "authenticated";

grant insert on table "public"."recurring_quests" to "authenticated";

grant references on table "public"."recurring_quests" to "authenticated";

grant select on table "public"."recurring_quests" to "authenticated";

grant trigger on table "public"."recurring_quests" to "authenticated";

grant truncate on table "public"."recurring_quests" to "authenticated";

grant update on table "public"."recurring_quests" to "authenticated";

grant delete on table "public"."recurring_quests" to "service_role";

grant insert on table "public"."recurring_quests" to "service_role";

grant references on table "public"."recurring_quests" to "service_role";

grant select on table "public"."recurring_quests" to "service_role";

grant trigger on table "public"."recurring_quests" to "service_role";

grant truncate on table "public"."recurring_quests" to "service_role";

grant update on table "public"."recurring_quests" to "service_role";

create policy "Users can manage their own memos"
on "public"."memos"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage their own quests"
on "public"."quests"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage their own recurring quests"
on "public"."recurring_quests"
as permissive
for all
to public
using ((auth.uid() = user_id));



