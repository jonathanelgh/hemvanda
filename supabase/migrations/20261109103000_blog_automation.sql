create table if not exists public.blog_automation_settings (
  id integer primary key default 1 check (id = 1),
  enabled boolean not null default false,
  posts_per_day integer not null default 2 check (posts_per_day >= 1 and posts_per_day <= 4),
  publish_times text[] not null default array['08:30', '17:30']::text[],
  timezone text not null default 'Europe/Stockholm',
  author text not null default 'HemVända',
  topic_batch_size integer not null default 12 check (topic_batch_size >= 4 and topic_batch_size <= 40),
  last_run_at timestamptz,
  last_error text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

insert into public.blog_automation_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.blog_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  angle text not null default '',
  category_id uuid references public.blog_categories (id) on delete set null,
  service_slug text,
  target_keyword text not null default '',
  keywords text[] not null default '{}'::text[],
  similarity_key text not null,
  status text not null default 'queued'
    check (status = any (array['queued', 'writing', 'published', 'skipped', 'failed'])),
  priority integer not null default 0,
  source text not null default 'ai' check (source = any (array['ai', 'manual'])),
  blog_post_id uuid references public.blog_posts (id) on delete set null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_topics_similarity_key_unique unique (similarity_key)
);

create index if not exists blog_topics_status_priority_idx
  on public.blog_topics (status, priority desc, created_at asc);

create table if not exists public.blog_automation_runs (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  slot_time text not null,
  topic_id uuid references public.blog_topics (id) on delete set null,
  blog_post_id uuid references public.blog_posts (id) on delete set null,
  status text not null default 'started'
    check (status = any (array['started', 'published', 'failed', 'skipped'])),
  error text,
  created_at timestamptz not null default now(),
  constraint blog_automation_runs_slot_unique unique (slot_date, slot_time)
);

create index if not exists blog_automation_runs_slot_date_idx
  on public.blog_automation_runs (slot_date desc);

create or replace function public.set_blog_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_topics_updated_at on public.blog_topics;
create trigger blog_topics_updated_at
  before update on public.blog_topics
  for each row execute function set_blog_updated_at();

alter table public.blog_automation_settings enable row level security;
alter table public.blog_topics enable row level security;
alter table public.blog_automation_runs enable row level security;

drop policy if exists blog_automation_settings_staff on public.blog_automation_settings;
create policy blog_automation_settings_staff
  on public.blog_automation_settings
  for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists blog_topics_staff on public.blog_topics;
create policy blog_topics_staff
  on public.blog_topics
  for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists blog_automation_runs_staff on public.blog_automation_runs;
create policy blog_automation_runs_staff
  on public.blog_automation_runs
  for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());
