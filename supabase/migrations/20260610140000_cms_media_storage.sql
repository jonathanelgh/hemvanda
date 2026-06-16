insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read cms media"
  on storage.objects for select
  using (bucket_id = 'cms-media');

create policy "Staff upload cms media"
  on storage.objects for insert
  with check (bucket_id = 'cms-media' and is_staff_or_admin());

create policy "Staff update cms media"
  on storage.objects for update
  using (bucket_id = 'cms-media' and is_staff_or_admin())
  with check (bucket_id = 'cms-media' and is_staff_or_admin());

create policy "Staff delete cms media"
  on storage.objects for delete
  using (bucket_id = 'cms-media' and is_staff_or_admin());
