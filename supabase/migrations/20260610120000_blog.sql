create type blog_post_status as enum ('draft', 'published');

create table blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  category_id uuid references blog_categories(id) on delete set null,
  status blog_post_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_status_published_at_idx on blog_posts (status, published_at desc nulls last);
create index blog_posts_category_id_idx on blog_posts (category_id);

create or replace function set_blog_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blog_categories_updated_at
  before update on blog_categories
  for each row execute function set_blog_updated_at();

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function set_blog_updated_at();

alter table blog_categories enable row level security;
alter table blog_posts enable row level security;

create policy "Public can read blog categories"
  on blog_categories for select
  using (true);

create policy "Public can read published blog posts"
  on blog_posts for select
  using (status = 'published');

create policy "Staff can manage blog categories"
  on blog_categories for all
  using (is_staff_or_admin())
  with check (is_staff_or_admin());

create policy "Staff can manage blog posts"
  on blog_posts for all
  using (is_staff_or_admin())
  with check (is_staff_or_admin());
