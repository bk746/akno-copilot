-- Code d'accès Copilot (hash serveur uniquement, RLS sans policy client)

create table public.user_security (
  user_id uuid primary key references auth.users (id) on delete cascade,
  passcode_hash text,
  failed_attempts int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_security enable row level security;

-- Aucune policy : accès réservé au service_role côté API Next.js.

create or replace function public.touch_user_security_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_security_updated_at
  before update on public.user_security
  for each row
  execute function public.touch_user_security_updated_at();
