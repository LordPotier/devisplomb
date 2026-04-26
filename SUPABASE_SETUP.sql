-- Colle ce code dans Supabase > SQL Editor > New Query > Run

create table devis (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  numero text not null,
  client_nom text not null,
  client_adresse text,
  client_email text,
  client_tel text,
  description text,
  urgence text default 'normal',
  majoration integer default 0,
  lignes jsonb default '[]',
  intro_ia text,
  total_ht integer default 0,
  total_tva integer default 0,
  total_ttc integer default 0,
  statut text default 'brouillon',
  created_at timestamp with time zone default now()
);

-- Sécurité : chaque artisan ne voit que ses propres devis
alter table devis enable row level security;

create policy "Users see own devis" on devis
  for all using (auth.uid() = user_id);
