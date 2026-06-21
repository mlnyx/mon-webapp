// 브라우저에서 Supabase로 직접 데이터 조회 (정적 배포용)
import { createClient } from '@/lib/supabase/client';
import type { Stats, PlannerState } from '@/lib/types';

export async function fetchStats(): Promise<Stats | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('app_data')
    .select('value')
    .eq('key', 'stats')
    .maybeSingle();
  return (data?.value as Stats) ?? null;
}

export async function fetchPlanner(): Promise<PlannerState | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('app_data')
    .select('value')
    .eq('key', 'planner')
    .maybeSingle();
  return (data?.value as PlannerState) ?? null;
}

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
