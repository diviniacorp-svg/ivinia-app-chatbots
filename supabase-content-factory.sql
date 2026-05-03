-- DIVINIA — Content Factory: tabla social_posts
-- Correr en Supabase SQL Editor

create table if not exists public.social_posts (
  id              uuid default gen_random_uuid() primary key,
  client_id       text not null,
  titulo          text,
  caption         text,
  hashtags        text,
  tipo            text check (tipo in ('post', 'reel', 'carrusel', 'story')),
  pilar           text,
  objetivo        text,
  hook            text,
  visual_prompt   text,
  herramienta     text default 'canva',
  notas_cliente   text,
  mes             text,
  media_url       text,
  ig_media_id     text,
  approval_status text default 'pending' check (approval_status in ('pending', 'approved', 'needs_revision', 'published')),
  approval_comment text,
  approval_at     timestamptz,
  scheduled_at    timestamptz,
  published_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Índices útiles
create index if not exists social_posts_client_id_idx on public.social_posts (client_id);
create index if not exists social_posts_approval_idx  on public.social_posts (client_id, approval_status);
create index if not exists social_posts_mes_idx       on public.social_posts (client_id, mes);

-- RLS: solo el service_role puede leer/escribir (el cliente aprueba via API pública)
alter table public.social_posts enable row level security;

create policy "service_role_all" on public.social_posts
  for all using (auth.role() = 'service_role');

-- Trigger: actualiza updated_at automáticamente
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists social_posts_updated_at on public.social_posts;
create trigger social_posts_updated_at
  before update on public.social_posts
  for each row execute function update_updated_at();
