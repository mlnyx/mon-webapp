-- 가계부 웹앱 DB 스키마. Supabase SQL Editor에 붙여넣고 실행.
-- 단일 사용자용: 로그인한 본인만 자기 데이터 읽기/쓰기(RLS).

-- 1) 앱 데이터 테이블 (key-value JSONB)
--    key='stats'   → 파이프라인 산출물(stats.json) 통째로 (리포트 표시용, 시드 스크립트가 업로드)
--    key='planner' → 사용자 플래너 입력 (앱에서 읽기/쓰기)
create table if not exists public.app_data (
  user_id   uuid not null references auth.users(id) on delete cascade,
  key       text not null,
  value     jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- 2) RLS: 본인 데이터만
alter table public.app_data enable row level security;

drop policy if exists "own_select" on public.app_data;
create policy "own_select" on public.app_data
  for select using (auth.uid() = user_id);

drop policy if exists "own_insert" on public.app_data;
create policy "own_insert" on public.app_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "own_update" on public.app_data;
create policy "own_update" on public.app_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_delete" on public.app_data;
create policy "own_delete" on public.app_data
  for delete using (auth.uid() = user_id);

-- 3) updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_touch on public.app_data;
create trigger trg_touch before update on public.app_data
  for each row execute function public.touch_updated_at();
