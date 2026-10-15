-- Internlytic portal additions. Run in Supabase SQL Editor only after reviewing the README.
-- This creates portal-access metadata and task submissions; it does NOT delete or recreate existing interns.
create extension if not exists pgcrypto;

-- Private task file bucket. Only the server-side API using the service-role key uploads/signs files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('intern-task-submissions', 'intern-task-submissions', false, 4194304,
 array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
       'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
       'application/zip','image/png','image/jpeg','text/plain'])
on conflict (id) do update set public=false, file_size_limit=4194304;


create table if not exists public.intern_portal_access (
  id uuid primary key default gen_random_uuid(),
  role text not null default 'intern' check (role in ('ceo','intern')),
  intern_id text unique,
  email text,
  full_name text not null default 'Intern',
  track text,
  secret_pin_hash text not null,
  active boolean not null default true,
  certificate_id text,
  offer_letter_url text,
  certificate_url text,
  lor_url text,
  required_tasks integer not null default 4 check (required_tasks > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intern_portal_access_role_identity check (
    (role='ceo' and email is not null and intern_id is null) or
    (role='intern' and intern_id is not null and track is not null)
  )
);
create unique index if not exists intern_portal_access_ceo_email_idx
  on public.intern_portal_access (lower(email)) where role='ceo';

create table if not exists public.intern_task_submissions (
  id uuid primary key default gen_random_uuid(),
  intern_id text not null references public.intern_portal_access(intern_id) on delete cascade,
  task_title text not null,
  description text,
  submission_url text,
  file_path text,
  status text not null default 'Pending' check (status in ('Pending','Approved','Needs Changes')),
  review_feedback text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists intern_task_submissions_intern_idx on public.intern_task_submissions(intern_id, created_at desc);
alter table public.intern_portal_access enable row level security;
alter table public.intern_task_submissions enable row level security;
revoke all on public.intern_portal_access from anon, authenticated;
revoke all on public.intern_task_submissions from anon, authenticated;

create or replace function public.portal_login(
 p_role text, p_email text default null, p_intern_id text default null,
 p_track text default null, p_pin text default null
) returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.intern_portal_access%rowtype;
begin
 if p_role='ceo' then
  select * into a from public.intern_portal_access
   where role='ceo' and active and lower(email)=lower(coalesce(p_email,''))
   and secret_pin_hash=crypt(coalesce(p_pin,''),secret_pin_hash) limit 1;
 else
  select * into a from public.intern_portal_access
   where role='intern' and active and intern_id=trim(coalesce(p_intern_id,''))
   and lower(trim(track))=lower(trim(coalesce(p_track,'')))
   and secret_pin_hash=crypt(coalesce(p_pin,''),secret_pin_hash) limit 1;
 end if;
 if not found then return jsonb_build_object('ok',false,'message','The supplied details do not match an active portal account.'); end if;
 return jsonb_build_object('ok',true,'role',a.role,'intern_id',a.intern_id,'full_name',a.full_name,'email',a.email,'track',a.track);
end $$;

create or replace function public.portal_admin_overview(p_email text, p_pin text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.intern_portal_access%rowtype; interns jsonb; tasks jsonb;
begin
 select * into a from public.intern_portal_access where role='ceo' and active
  and lower(email)=lower(coalesce(p_email,'')) and secret_pin_hash=crypt(coalesce(p_pin,''),secret_pin_hash) limit 1;
 if not found then return jsonb_build_object('ok',false,'message','Admin authorization failed.'); end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'intern_id',p.intern_id,'full_name',p.full_name,'email',p.email,'track',p.track,
  'offer_letter_url',p.offer_letter_url,'offer_letter_status',case when nullif(p.offer_letter_url,'') is null then 'Not issued' else 'Issued' end,
  'certificate_url',p.certificate_url,'certificate_status',case when nullif(p.certificate_url,'') is null then 'Pending' else 'Issued' end,
  'certificate_id',p.certificate_id,'required_tasks',p.required_tasks
 ) order by p.full_name), '[]'::jsonb) into interns from public.intern_portal_access p where p.role='intern' and p.active;
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',t.id,'intern_id',t.intern_id,'intern_name',p.full_name,'task_title',t.task_title,
  'description',t.description,'submission_url',t.submission_url,'file_path',t.file_path,
  'status',t.status,'review_feedback',t.review_feedback,'created_at',t.created_at
 ) order by t.created_at desc), '[]'::jsonb) into tasks
 from public.intern_task_submissions t join public.intern_portal_access p on p.intern_id=t.intern_id;
 return jsonb_build_object('ok',true,'interns',interns,'tasks',tasks);
end $$;

create or replace function public.portal_intern_dashboard(p_intern_id text, p_track text, p_pin text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.intern_portal_access%rowtype; taskdata jsonb;
begin
 select * into a from public.intern_portal_access where role='intern' and active
  and intern_id=trim(coalesce(p_intern_id,'')) and lower(track)=lower(trim(coalesce(p_track,'')))
  and secret_pin_hash=crypt(coalesce(p_pin,''),secret_pin_hash) limit 1;
 if not found then return jsonb_build_object('ok',false,'message','Session could not be verified. Please log in again.'); end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'task_title',t.task_title,'description',t.description,
  'submission_url',t.submission_url,'file_path',t.file_path,'status',t.status,'review_feedback',t.review_feedback,'created_at',t.created_at)
  order by t.created_at desc),'[]'::jsonb) into taskdata from public.intern_task_submissions t where t.intern_id=a.intern_id;
 return jsonb_build_object('ok',true,'profile',jsonb_build_object(
  'full_name',a.full_name,'email',a.email,'track',a.track,'intern_id',a.intern_id,
  'required_tasks',a.required_tasks,'offer_letter_url',a.offer_letter_url,'certificate_url',a.certificate_url,
  'lor_url',a.lor_url,'documents',jsonb_strip_nulls(jsonb_build_array(
   case when nullif(a.offer_letter_url,'') is not null then jsonb_build_object('id','offer','title','Offer Letter','type','Offer Letter','url',a.offer_letter_url,'status','Available') end,
   case when nullif(a.certificate_url,'') is not null then jsonb_build_object('id','certificate','title','Certificate','type','Certificate','url',a.certificate_url,'status','Available') end,
   case when nullif(a.lor_url,'') is not null then jsonb_build_object('id','lor','title','Letter of Recommendation','type','LoR','url',a.lor_url,'status','Available') end
  )),
  'progress_percent',least(100,round((select count(*) from public.intern_task_submissions t where t.intern_id=a.intern_id and t.status='Approved')::numeric * 100 / greatest(a.required_tasks,1)))
 ),'tasks',taskdata);
end $$;

create or replace function public.portal_submit_task(
 p_intern_id text, p_track text, p_pin text, p_title text, p_description text default '',
 p_submission_url text default null, p_file_path text default null
) returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.intern_portal_access%rowtype; new_id uuid;
begin
 select * into a from public.intern_portal_access where role='intern' and active
  and intern_id=trim(coalesce(p_intern_id,'')) and lower(track)=lower(trim(coalesce(p_track,'')))
  and secret_pin_hash=crypt(coalesce(p_pin,''),secret_pin_hash) limit 1;
 if not found then return jsonb_build_object('ok',false,'message','Your login session could not be verified. Please log in again.'); end if;
 if length(trim(coalesce(p_title,'')))=0 then return jsonb_build_object('ok',false,'message','Task title is required.'); end if;
 if nullif(trim(coalesce(p_submission_url,'')),'') is null and nullif(trim(coalesce(p_file_path,'')),'') is null and nullif(trim(coalesce(p_description,'')),'') is null then
  return jsonb_build_object('ok',false,'message','Add task details, a link, or a file before submitting.');
 end if;
 insert into public.intern_task_submissions(intern_id,task_title,description,submission_url,file_path)
 values(a.intern_id,trim(p_title),nullif(trim(coalesce(p_description,'')),''),nullif(trim(coalesce(p_submission_url,'')),''),nullif(trim(coalesce(p_file_path,'')),''))
 returning id into new_id;
 return jsonb_build_object('ok',true,'id',new_id,'status','Pending');
end $$;

create or replace function public.portal_review_task(p_email text,p_pin text,p_task_id uuid,p_decision text,p_feedback text default '')
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.intern_portal_access%rowtype;
begin
 select * into a from public.intern_portal_access where role='ceo' and active
  and lower(email)=lower(coalesce(p_email,'')) and secret_pin_hash=crypt(coalesce(p_pin,''),secret_pin_hash) limit 1;
 if not found then return jsonb_build_object('ok',false,'message','Admin authorization failed.'); end if;
 if p_decision not in ('Approved','Needs Changes') then return jsonb_build_object('ok',false,'message','Invalid review status.'); end if;
 update public.intern_task_submissions set status=p_decision,review_feedback=nullif(trim(coalesce(p_feedback,'')),''),reviewed_at=now() where id=p_task_id;
 if not found then return jsonb_build_object('ok',false,'message','Task submission not found.'); end if;
 return jsonb_build_object('ok',true,'status',p_decision);
end $$;

revoke all on function public.portal_login(text,text,text,text,text) from public;
revoke all on function public.portal_admin_overview(text,text) from public;
revoke all on function public.portal_intern_dashboard(text,text,text) from public;
revoke all on function public.portal_submit_task(text,text,text,text,text,text,text) from public;
revoke all on function public.portal_review_task(text,text,uuid,text,text) from public;
grant execute on function public.portal_login(text,text,text,text,text) to anon, authenticated;
grant execute on function public.portal_admin_overview(text,text) to anon, authenticated;
grant execute on function public.portal_intern_dashboard(text,text,text) to anon, authenticated;
grant execute on function public.portal_submit_task(text,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.portal_review_task(text,text,uuid,text,text) to anon, authenticated;

-- Add CEO + existing intern credential rows using the secure insertion instructions in README.
-- PINs are stored as bcrypt hashes, never as plain text.
