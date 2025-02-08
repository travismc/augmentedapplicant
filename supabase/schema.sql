-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- Set up storage for resumes
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false);
create policy "Resumes are private" on storage.objects for select using (bucket_id = 'resumes' and auth.uid() = owner);

-- Create custom types
create type credit_transaction_type as enum (
  'welcome_bonus',
  'purchase',
  'refund',
  'admin_adjustment',
  'referral_bonus'
);

-- Create tables
create table public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null unique references auth.users(id) on delete cascade,
  email citext not null unique,
  full_name text,
  credits_balance integer not null default 0 check (credits_balance >= 0),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null unique references auth.users(id) on delete cascade,
  job_titles text[] not null default '{}',
  industries text[] not null default '{}',
  locations text[] not null default '{}',
  resume_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references auth.users(id) on delete cascade,
  amount integer not null,
  transaction_type credit_transaction_type not null,
  description text,
  reference_id uuid, -- For linking to other entities (e.g., purchases)
  created_at timestamptz not null default now()
);

create table public.resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references auth.users(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size integer not null,
  content_type text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resume_versions (
  id uuid primary key default uuid_generate_v4(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  version_number integer not null,
  file_path text not null,
  changes_summary text,
  created_at timestamptz not null default now()
);

create table public.job_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null references auth.users(id) on delete cascade,
  company_name text not null,
  job_title text not null,
  job_description text,
  resume_version_id uuid references public.resume_versions(id),
  status text not null default 'draft',
  credits_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes
create index idx_user_profiles_user_id on public.user_profiles(user_id);
create index idx_user_preferences_user_id on public.user_preferences(user_id);
create index idx_credit_transactions_user_id on public.credit_transactions(user_id);
create index idx_credit_transactions_type on public.credit_transactions(transaction_type);
create index idx_resumes_user_id on public.resumes(user_id);
create index idx_job_applications_user_id on public.job_applications(user_id);
create index idx_job_applications_status on public.job_applications(status);

-- Set up Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.job_applications enable row level security;

-- RLS Policies

-- User Profiles
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User Preferences
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Credit Transactions
create policy "Users can view their own transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Resumes
create policy "Users can view their own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can update their own resumes"
  on public.resumes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- Resume Versions
create policy "Users can view their own resume versions"
  on public.resume_versions for select
  using (exists (
    select 1 from public.resumes
    where id = resume_versions.resume_id
    and user_id = auth.uid()
  ));

-- Job Applications
create policy "Users can view their own applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

create policy "Users can update their own applications"
  on public.job_applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);

-- Functions and Triggers

-- Update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create updated_at triggers for relevant tables
create trigger handle_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.user_preferences
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.resumes
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.job_applications
  for each row
  execute function public.handle_updated_at();

-- Function to update user credits
create or replace function public.update_user_credits()
returns trigger as $$
begin
  update public.user_profiles
  set credits_balance = credits_balance + new.amount
  where user_id = new.user_id;
  return new;
end;
$$ language plpgsql;

-- Trigger to update user credits on transaction
create trigger update_user_credits_after_transaction
  after insert on public.credit_transactions
  for each row
  execute function public.update_user_credits();
