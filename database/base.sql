drop schema if exists streaming;

create schema streaming;

create table streaming.account (
  account_id uuid primary key,
  name text not null,
  email text not null,
  password text not null,
  stream_key text not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table streaming.stream (
  stream_id uuid primary key,
  account_id uuid not null,
  title text not null,
  stream_key text not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table streaming.view (
  view_id uuid primary key,
  stream_id uuid not null references streaming.stream(stream_id),
  account_id uuid references streaming.account(account_id), -- nulo para convidados
  ip_address text,
  user_agent text,
  started_at timestamp not null default now(),
  last_ping_at timestamp not null default now(),
  finished_at timestamp,
  created_at timestamp not null default now()
);


