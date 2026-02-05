drop schema if exists streaming;

create schema streaming;

create table streaming.accounts (
  account_id uuid primary key,
  name text not null,
  email text not null,
  password text not null,
  stream_key text not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table streaming.streams (
  stream_id uuid primary key,
  account_id uuid not null,
  title text not null,
  stream_key text not null,
  is_online boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table streaming.views (
  view_id uuid primary key,
  stream_id uuid not null references streaming.streams(stream_id),
  account_id uuid references streaming.accounts(account_id), -- nulo para convidados
  ip_address text,
  user_agent text,
  started_at timestamp not null default now(),
  last_ping_at timestamp not null default now(),
  finished_at timestamp,
  created_at timestamp not null default now()
);

insert into streaming.accounts (account_id, name, email, password, stream_key) values
('099cd4fb-6db4-415a-8ad0-955460b1d690', 'Lucas Wesley', 'lucas@egmail.com', '$2b$10$oZArpE9TewzDjqbdHnEBU.vDnaSQ.P/4ZZ3y9skIrq2vlY/obWMXK', '7b6e3ece-ff0c-4fd1-907f-eeea2bb09ccc');