-- Migration: Intelligence Engine Tables

-- 1. Create table for raw signals (The Ears)
create table if not exists user_signals (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid references leads(id) on delete cascade not null, -- Links to the "leads" table (contacts)
  source text not null, -- e.g., 'whatsapp', 'campaign', 'survey', 'app'
  type text not null, -- e.g., 'click', 'reply', 'form_submit', 'page_view'
  data jsonb default '{}'::jsonb, -- dynamic payload
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create table for the Intelligence Profile (The Brain)
create table if not exists user_intelligence_profile (
  contact_id uuid references leads(id) on delete cascade primary key,
  lead_score integer default 0,
  sentiment text default 'neutral', -- 'warm', 'hot', 'cold', 'neutral'
  tags text[] default array[]::text[], -- Interest tags e.g. ['interested-in-pricing', 'high-budget']
  last_signal_at timestamp with time zone,
  summary text, -- AI generated summary of the user
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create a Trigger Function to auto-update the profile (The Processor)
create or replace function public.process_signal()
returns trigger as $$
begin
  -- upsert user_intelligence_profile
  insert into public.user_intelligence_profile (contact_id, last_signal_at)
  values (new.contact_id, new.created_at)
  on conflict (contact_id) do update
  set 
    last_signal_at = new.created_at,
    updated_at = now();
    
  -- Basic Heuristic Scoring (We can expand this later or use AI Edge Functions)
  if new.type = 'reply' then
    update public.user_intelligence_profile
    set lead_score = lead_score + 10, sentiment = 'warm'
    where contact_id = new.contact_id;
  elsif new.type = 'click' then
    update public.user_intelligence_profile
    set lead_score = lead_score + 5
    where contact_id = new.contact_id;
  elsif new.type = 'survey_high_budget' then
     update public.user_intelligence_profile
    set lead_score = lead_score + 50, sentiment = 'hot'
    where contact_id = new.contact_id;
  end if;

  -- SYNC to main leads table for fast dashboard access
  update public.leads
  set score = (select lead_score from public.user_intelligence_profile where contact_id = new.contact_id)
  where id = new.contact_id;

  return new;
end;
$$ language plpgsql security definer;

-- 4. Attach Trigger
drop trigger if exists on_signal_received on user_signals;
create trigger on_signal_received
after insert on user_signals
for each row execute procedure public.process_signal();
