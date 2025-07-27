alter table "public"."quests" drop column "order";

alter table "public"."quests" add column "quest_order" integer not null default 0;


