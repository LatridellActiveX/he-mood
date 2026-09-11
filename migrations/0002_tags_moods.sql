create table if not exists tags (
  id serial primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists tags_name_lower_idx on tags (lower(name));

create table if not exists moods (
  id serial primary key,
  tag_id integer not null references tags(id),
  day date not null,
  score integer not null check (score >= 1 and score <= 10),
  element text,
  note text not null default '',
  logged_at timestamptz not null default now()
);

create index if not exists moods_day_idx on moods (day);
create index if not exists moods_tag_day_idx on moods (tag_id, day);
