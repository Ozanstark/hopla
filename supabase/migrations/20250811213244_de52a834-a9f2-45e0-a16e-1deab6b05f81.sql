-- Create a global game scores table
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  score integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.game_scores enable row level security;

-- Basic validations via constraints (static, not time-based)
alter table public.game_scores
  add constraint game_scores_player_name_length check (
    char_length(player_name) > 0 and char_length(player_name) <= 32
  ),
  add constraint game_scores_score_range check (
    score >= 0 and score <= 1000000
  );

-- Public read access
create policy "Public can read scores"
  on public.game_scores
  for select
  using (true);

-- Allow anonymous inserts (no auth yet)
create policy "Anyone can insert scores"
  on public.game_scores
  for insert
  with check (true);

-- Keep timestamps updated
create trigger update_game_scores_updated_at
  before update on public.game_scores
  for each row
  execute function public.update_updated_at_column();

-- Helpful indexes
create index if not exists idx_game_scores_score_desc on public.game_scores (score desc);
create index if not exists idx_game_scores_created_at on public.game_scores (created_at desc);