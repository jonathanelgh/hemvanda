create type showcase_status as enum ('draft', 'published');

create table showcases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  content text not null default '',
  service_slug text not null,
  image_urls text[] not null default '{}',
  cover_image_url text,
  status showcase_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index showcases_status_published_at_idx on showcases (status, published_at desc nulls last);
create index showcases_service_slug_idx on showcases (service_slug);

create trigger showcases_updated_at
  before update on showcases
  for each row execute function set_blog_updated_at();

alter table showcases enable row level security;

create policy "Public can read published showcases"
  on showcases for select
  using (status = 'published');

create policy "Staff can manage showcases"
  on showcases for all
  using (is_staff_or_admin())
  with check (is_staff_or_admin());
