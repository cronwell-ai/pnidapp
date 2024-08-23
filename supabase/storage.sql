-- Create buckets
INSERT INTO storage.buckets (id, name) VALUES ('files', 'files') ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name) VALUES ('thumbnails', 'thumbnails') ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars') ON CONFLICT (id) DO NOTHING;

-- Create Policies
create policy "Allow access to files whose pnid is viewable 1m0cqf_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'files'::text) AND (EXISTS ( SELECT 1
   FROM files
  WHERE ((files.fpath = objects.name) AND (files.viewable = true))))));

create policy "Give users authenticated access to folder 1m0cqf_0"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'files'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder 1m0cqf_1"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'files'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder 1m0cqf_2"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'files'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to folder 1m0cqf_3"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'files'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Authenticated users can download 16v3daf_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'thumbnails'::text) AND (auth.role() = 'authenticated'::text)));

create policy "Authenticated users to upload to 16v3daf_0"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'thumbnails'::text));


create policy "user to manage their own avatar 1oj01fe_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "user to manage their own avatar 1oj01fe_1"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "user to manage their own avatar 1oj01fe_2"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));




