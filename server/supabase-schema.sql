-- Full Supabase schema for the Smart Attendance System
-- Apply this in the Supabase SQL editor before setting USE_SUPABASE=true.

create extension if not exists "pgcrypto";

create table if not exists public.admins (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    admin_id text not null unique,
    institution_type text,
    email text not null unique,
    password text not null,
    role text not null default 'admin'
);

create table if not exists public.students (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    register_no text not null unique,
    institution_type text not null default 'college',
    department text,
    year text,
    semester text,
    email text not null unique,
    password text not null,
    role text not null default 'student'
);

create table if not exists public.teachers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    teacher_id text not null unique,
    institution_type text not null default 'college',
    department text,
    subject text,
    subjects jsonb not null default '[]'::jsonb,
    email text not null unique,
    password text not null,
    role text not null default 'teacher'
);

create table if not exists public.courses (
    id uuid primary key default gen_random_uuid(),
    teacher_id uuid not null references public.teachers(id) on delete cascade,
    title text not null,
    code text not null unique,
    institution_type text not null default 'college',
    department text,
    year text,
    semester text,
    section text,
    enrolled_students uuid[] not null default '{}'::uuid[],
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
    id uuid primary key default gen_random_uuid(),
    course_id uuid not null references public.courses(id) on delete cascade,
    date timestamptz not null default now(),
    topic text not null,
    session_code text not null unique,
    qr_code_string text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.attendance (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.students(id) on delete cascade,
    session_id uuid not null references public.sessions(id) on delete cascade,
    check_in_time timestamptz not null default now(),
    status text not null default 'Present'
);

create table if not exists public.curriculum (
    id uuid primary key default gen_random_uuid(),
    institution_type text not null,
    class text,
    subject text,
    department text,
    year text,
    semester text,
    course_code text,
    course_name text,
    units jsonb not null default '[]'::jsonb,
    teacher_id uuid references public.teachers(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.activities (
    id uuid primary key default gen_random_uuid(),
    course_id uuid references public.courses(id) on delete cascade,
    student_id uuid references public.students(id) on delete cascade,
    title text not null,
    description text,
    type text not null default 'Assignment',
    deadline timestamptz not null,
    max_score integer not null default 100
);

create table if not exists public.submissions (
    id uuid primary key default gen_random_uuid(),
    activity_id uuid not null references public.activities(id) on delete cascade,
    student_id uuid not null references public.students(id) on delete cascade,
    file_url text,
    notes text,
    score integer,
    status text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_students_register_no on public.students(register_no);
create index if not exists idx_teachers_teacher_id on public.teachers(teacher_id);
create index if not exists idx_courses_teacher_id on public.courses(teacher_id);
create index if not exists idx_sessions_course_id on public.sessions(course_id);
create index if not exists idx_attendance_student_id on public.attendance(student_id);
create index if not exists idx_attendance_session_id on public.attendance(session_id);
create index if not exists idx_activities_course_id on public.activities(course_id);
create index if not exists idx_submissions_activity_id on public.submissions(activity_id);

alter table public.admins enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.courses enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.curriculum enable row level security;
alter table public.activities enable row level security;
alter table public.submissions enable row level security;

-- Backend uses the service role key, so RLS can stay enabled without policies here.
