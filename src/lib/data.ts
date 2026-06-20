// 데이터 접근 레이어. 페이지는 이 함수들만 쓴다.
import { createClient } from '@/lib/supabase/server';
import type { Stats, PlannerState } from '@/lib/types';

// 리포트용 stats (파이프라인이 시드한 blob). 없으면 null.
export async function getStats(): Promise<Stats | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('app_data')
    .select('value')
    .eq('key', 'stats')
    .maybeSingle();
  return (data?.value as Stats) ?? null;
}

// 플래너 상태. 없으면 stats.plan 기본값으로 초기화한 값 반환.
export async function getPlanner(): Promise<PlannerState | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('app_data')
    .select('value')
    .eq('key', 'planner')
    .maybeSingle();
  return (data?.value as PlannerState) ?? null;
}

// stats.plan → PlannerState 기본값
export function plannerDefault(stats: Stats): PlannerState {
  const p = stats.plan;
  return {
    incomes: p.incomes,
    monthly_budget: p.monthly_budget,
    fixed_cost: p.fixed_cost,
    current_emergency: p.current_emergency,
    current_invest: p.current_invest,
    goal_emergency: p.goals.emergency,
    goal_invest: p.goals.invest,
    target_month: p.goals.target_month,
  };
}
