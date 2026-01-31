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