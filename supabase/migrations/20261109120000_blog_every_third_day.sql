alter table public.blog_automation_settings
  add column if not exists interval_days integer not null default 3
  check (interval_days >= 1 and interval_days <= 30);

update public.blog_automation_settings
set
  posts_per_day = 1,
  interval_days = 3,
  publish_times = array['09:00']::text[]
where id = 1;
