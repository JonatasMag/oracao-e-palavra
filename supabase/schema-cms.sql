-- =====================================================================
-- ORAÇÃO E PALAVRA — PAINEL DE PUBLICAÇÃO (CMS)
-- Cole TUDO no Supabase → SQL Editor → Run. Pode rodar mais de uma vez.
-- Não altera nem apaga nada de pedidos_oracao / equipe_oracao.
-- =====================================================================

-- ---------- Funções de apoio ----------
create or replace function public.op_is_equipe() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.equipe_oracao where user_id = auth.uid() and ativo)
$$;

create or replace function public.op_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.equipe_oracao
                 where user_id = auth.uid() and ativo and funcao = 'administrador')
$$;
grant execute on function public.op_is_equipe(), public.op_is_admin() to anon, authenticated;

-- ---------- Tabelas ----------
create table if not exists public.materiais (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text not null default 'estudo',          -- estudo | folheto | doutrina | devocional
  categoria_nome text,
  descricao text,
  capa_url text,
  pdf_url text,
  publicado boolean not null default true,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.igrejas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text, cidade text, estado text, cep text, telefone text,
  latitude double precision, longitude double precision,
  publicado boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.pregacoes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'PREGAÇÃO',
  titulo text not null,
  descricao text,
  url text,
  publicado boolean not null default true,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.configuracoes (
  chave text primary key,
  valor text,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.equipe_convites (
  email text primary key,
  nome text not null,
  funcao text not null default 'intercessor' check (funcao in ('administrador','lider','intercessor')),
  criado_em timestamptz not null default now()
);

-- ---------- Segurança (RLS) ----------
alter table public.materiais       enable row level security;
alter table public.igrejas         enable row level security;
alter table public.pregacoes       enable row level security;
alter table public.configuracoes   enable row level security;
alter table public.equipe_convites enable row level security;

do $$
declare t text;
begin
  foreach t in array array['materiais','igrejas','pregacoes'] loop
    execute format('drop policy if exists op_publico_le on public.%I', t);
    execute format('create policy op_publico_le on public.%I for select to anon, authenticated using (publicado or public.op_is_admin())', t);
    execute format('drop policy if exists op_admin_escreve on public.%I', t);
    execute format('create policy op_admin_escreve on public.%I for all to authenticated using (public.op_is_admin()) with check (public.op_is_admin())', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

drop policy if exists op_publico_le on public.configuracoes;
create policy op_publico_le on public.configuracoes for select to anon, authenticated using (true);
drop policy if exists op_admin_escreve on public.configuracoes;
create policy op_admin_escreve on public.configuracoes for all to authenticated
  using (public.op_is_admin()) with check (public.op_is_admin());
grant select on public.configuracoes to anon;
grant select, insert, update, delete on public.configuracoes to authenticated;

drop policy if exists op_admin_convites on public.equipe_convites;
create policy op_admin_convites on public.equipe_convites for all to authenticated
  using (public.op_is_admin()) with check (public.op_is_admin());
grant select, insert, update, delete on public.equipe_convites to authenticated;

-- Administrador enxerga e gerencia toda a equipe (políticas novas, somam às existentes)
drop policy if exists op_admin_ve_equipe on public.equipe_oracao;
create policy op_admin_ve_equipe on public.equipe_oracao for select to authenticated using (public.op_is_admin());
drop policy if exists op_admin_edita_equipe on public.equipe_oracao;
create policy op_admin_edita_equipe on public.equipe_oracao for update to authenticated
  using (public.op_is_admin()) with check (public.op_is_admin());
grant select, update on public.equipe_oracao to authenticated;

-- Proteção: só administrador muda função/ativo (ninguém se promove sozinho)
create or replace function public.op_protege_equipe() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.op_is_admin()
     and (new.funcao is distinct from old.funcao or new.ativo is distinct from old.ativo) then
    raise exception 'Somente administrador altera função ou acesso';
  end if;
  return new;
end $$;
drop trigger if exists op_protege_equipe on public.equipe_oracao;
create trigger op_protege_equipe before update on public.equipe_oracao
  for each row execute function public.op_protege_equipe();

-- Primeiro login: transforma o convite em acesso à equipe
create or replace function public.op_reivindicar_convite() returns boolean
language plpgsql security definer set search_path = public as $$
declare c public.equipe_convites%rowtype;
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.equipe_oracao where user_id = auth.uid()) then return true; end if;
  select * into c from public.equipe_convites where lower(email) = lower(auth.jwt()->>'email');
  if not found then return false; end if;
  insert into public.equipe_oracao (user_id, nome, funcao, ativo)
  values (auth.uid(), c.nome, c.funcao, true);
  delete from public.equipe_convites where email = c.email;
  return true;
end $$;
revoke all on function public.op_reivindicar_convite() from public, anon;
grant execute on function public.op_reivindicar_convite() to authenticated;

-- ---------- Arquivos (PDF e capas) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('biblioteca','biblioteca', true, 26214400,
        array['application/pdf','image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 26214400,
  allowed_mime_types = array['application/pdf','image/png','image/jpeg','image/webp'];

drop policy if exists op_arquivos_inserir on storage.objects;
create policy op_arquivos_inserir on storage.objects for insert to authenticated
  with check (bucket_id = 'biblioteca' and public.op_is_admin());
drop policy if exists op_arquivos_atualizar on storage.objects;
create policy op_arquivos_atualizar on storage.objects for update to authenticated
  using (bucket_id = 'biblioteca' and public.op_is_admin());
drop policy if exists op_arquivos_apagar on storage.objects;
create policy op_arquivos_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'biblioteca' and public.op_is_admin());

-- ---------- Textos do site (valores iniciais, só se ainda não existem) ----------
insert into public.configuracoes (chave, valor) values
 ('versiculo_topo','“Mas nós perseveraremos na oração e no ministério da palavra.” — Atos 6:4'),
 ('whatsapp_comunidade','https://whatsapp.com/channel/0029VbDAvROKbYMThxZzgJ0v'),
 ('youtube_canal','https://www.youtube.com/@ProjetoOra%C3%A7%C3%A3oePalavra')
on conflict (chave) do nothing;
