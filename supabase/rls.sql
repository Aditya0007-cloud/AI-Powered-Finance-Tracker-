-- Run this in the Supabase SQL editor after applying Prisma migrations.
-- It enables Row Level Security for direct Supabase access while server actions
-- also enforce userId filters for Prisma queries.

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.insights enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

drop policy if exists "Users can read default and own categories" on public.categories;
create policy "Users can read default and own categories"
  on public.categories for select
  using (user_id is null or auth.uid() = user_id);

drop policy if exists "Users can manage own categories" on public.categories;
create policy "Users can manage own categories"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own transactions" on public.transactions;
create policy "Users can manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own budgets" on public.budgets;
create policy "Users can manage own budgets"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own insights" on public.insights;
create policy "Users can read own insights"
  on public.insights for select
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own insights" on public.insights;
create policy "Users can delete own insights"
  on public.insights for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create index if not exists transactions_user_date_type_idx
  on public.transactions (user_id, date desc, type);

create index if not exists budgets_user_month_amount_idx
  on public.budgets (user_id, month, amount);

create unique index if not exists categories_default_name_idx
  on public.categories (name)
  where user_id is null;

insert into public.categories (name, color, icon, is_default)
values
  ('Food', '#f97316', 'Utensils', true),
  ('Travel', '#0ea5e9', 'Plane', true),
  ('Shopping', '#ec4899', 'ShoppingBag', true),
  ('Entertainment', '#8b5cf6', 'Popcorn', true),
  ('Bills', '#64748b', 'Receipt', true),
  ('Health', '#10b981', 'HeartPulse', true),
  ('Education', '#f59e0b', 'GraduationCap', true),
  ('Other', '#525252', 'CircleDollarSign', true)
on conflict (name) where user_id is null do update
set color = excluded.color,
    icon = excluded.icon,
    is_default = true;
