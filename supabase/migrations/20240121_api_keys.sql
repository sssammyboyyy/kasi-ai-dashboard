-- Create API Keys table for Multi-Tenant Security

create table if not exists api_keys (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  key_hash text not null, -- Store hash, not raw key for security (optional, but good practice. For MVP maybe raw is easier?)
  name text default 'Default Key',
  status text default 'active', -- active, revoked
  last_used_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table api_keys enable row level security;

-- Policies
-- Admins can view keys for their org
create policy "Admins can view their org keys"
  on api_keys for select
  using (
    auth.uid() in (
      select id from profiles
      where org_id = api_keys.org_id
      and (role = 'owner' or role = 'admin')
    )
  );

-- Admins can create keys
create policy "Admins can create keys"
  on api_keys for insert
  with check (
    auth.uid() in (
      select id from profiles
      where org_id = api_keys.org_id
      and (role = 'owner' or role = 'admin')
    )
  );

-- Admins can delete keys
create policy "Admins can delete keys"
  on api_keys for delete
  using (
    auth.uid() in (
      select id from profiles
      where org_id = api_keys.org_id
      and (role = 'owner' or role = 'admin')
    )
  );
