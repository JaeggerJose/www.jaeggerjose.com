-- supabase/migrations/20260521120000_garden.sql

create table garden_channels (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  summary     text,
  visibility  text not null default 'public'
                check (visibility in ('public','private')),
  position    int not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index garden_channels_visibility_position
  on garden_channels (visibility, position);

create table garden_blocks (
  id           uuid primary key default gen_random_uuid(),
  channel_id   uuid not null
                references garden_channels(id) on delete cascade,
  type         text not null
                check (type in ('link','image','note')),
  title        text,
  body         text,
  url          text,
  image_path   text,
  og_image     text,
  tags         text[] not null default '{}',
  position     int not null default 0,
  created_at   timestamptz default now()
);

create index garden_blocks_channel_position
  on garden_blocks (channel_id, position desc, created_at desc);

alter table garden_channels enable row level security;
alter table garden_blocks   enable row level security;

create policy garden_channels_anon_read
  on garden_channels for select to anon
  using (visibility = 'public');

create policy garden_blocks_anon_read
  on garden_blocks for select to anon
  using (
    exists (
      select 1 from garden_channels c
      where c.id = garden_blocks.channel_id
        and c.visibility = 'public'
    )
  );

create policy garden_channels_auth_all
  on garden_channels for all to authenticated
  using (true) with check (true);

create policy garden_blocks_auth_all
  on garden_blocks for all to authenticated
  using (true) with check (true);
