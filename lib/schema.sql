-- Colle ce code dans Supabase > SQL Editor > New Query > Run

-- Table des utilisateurs (plombiers abonnés)
create table users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  nom text,
  siret text,
  telephone text,
  stripe_customer_id text,
  abonnement_actif boolean default false,
  created_at timestamp default now()
);

-- Table des clients
create table clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  nom text not null,
  email text,
  telephone text,
  adresse text,
  created_at timestamp default now()
);

-- Table des devis
create table devis (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  client_id uuid references clients(id),
  numero text not null,
  statut text default 'brouillon', -- brouillon, envoye, accepte, refuse
  urgence text default 'normal',
  majoration integer default 0,
  description text,
  lignes jsonb default '[]',
  montant_ht numeric default 0,
  montant_tva numeric default 0,
  montant_ttc numeric default 0,
  intro_ia text,
  signature_data text,
  signe_le timestamp,
  created_at timestamp default now()
);

-- Table des factures
create table factures (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  devis_id uuid references devis(id),
  client_id uuid references clients(id),
  numero text not null,
  statut text default 'en_attente', -- en_attente, payee, retard
  montant_ttc numeric default 0,
  echeance date,
  payee_le timestamp,
  created_at timestamp default now()
);

-- Activer Row Level Security
alter table users enable row level security;
alter table clients enable row level security;
alter table devis enable row level security;
alter table factures enable row level security;

-- Policies : chaque utilisateur ne voit que ses données
create policy "Users voient leurs données" on users for all using (auth.uid() = id);
create policy "Clients de l'utilisateur" on clients for all using (auth.uid() = user_id);
create policy "Devis de l'utilisateur" on devis for all using (auth.uid() = user_id);
create policy "Factures de l'utilisateur" on factures for all using (auth.uid() = user_id);
