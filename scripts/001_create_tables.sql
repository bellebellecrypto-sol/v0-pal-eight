-- Create profiles table for user data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create palettes table for user-saved palettes
create table if not exists public.palettes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  colors jsonb not null,
  is_favorite boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create gradients table for user-saved gradients
create table if not exists public.gradients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  direction text,
  stops jsonb not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.palettes enable row level security;
alter table public.gradients enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Palettes policies
create policy "palettes_select_own" on public.palettes for select using (auth.uid() = user_id);
create policy "palettes_insert_own" on public.palettes for insert with check (auth.uid() = user_id);
create policy "palettes_update_own" on public.palettes for update using (auth.uid() = user_id);
create policy "palettes_delete_own" on public.palettes for delete using (auth.uid() = user_id);

-- Gradients policies
create policy "gradients_select_own" on public.gradients for select using (auth.uid() = user_id);
create policy "gradients_insert_own" on public.gradients for insert with check (auth.uid() = user_id);
create policy "gradients_update_own" on public.gradients for update using (auth.uid() = user_id);
create policy "gradients_delete_own" on public.gradients for delete using (auth.uid() = user_id);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create indexes for better performance
create index if not exists palettes_user_id_idx on public.palettes(user_id);
create index if not exists palettes_created_at_idx on public.palettes(created_at desc);
create index if not exists gradients_user_id_idx on public.gradients(user_id);
