// 가계부 데이터 타입. stats는 파이프라인(mon)의 output/stats.json 구조 그대로.

export interface CatAmount {
  name: string;
  amount: number;
}

export interface Merchant {
  name: string;
  amount: number;
  count: number;
  cat?: string;
}

export interface HierItem {
  name: string;
  amount: number;
  count: number;
}

export interface HierSub {
  total: number;
  items: HierItem[];
}

export interface InvestAccount {
  deposits: number;
  withdrawals: number;
  net: number;
  current_cash: number;
  current_stock_value: number;
  total_account: number;
  holdings: { name: string; value: number; pct: number }[];
  selling_for_deposit: string[];
}

export interface Cashflow {
  income: number;
  spend: number;
  cash_in: number;
  cash_out: number;
  borrow_net: number;
  deficit: number;
  invest_account: InvestAccount;
  invest_net_monthly: number;
  net: number;
}

export interface Habits {
  tx_count: number;
  days: number;
  daily_tx: number;
  median: number;
  under_10k: number;
  under_10k_pct: number;
  delivery: number;
  kickboard: number;
  convenience: number;
  cafe: number;
  beauty: number;
  late_count: number;
  late_amount: number;
  stock_withdrawals: number;
}

export interface Housing {
  current_rent: number;
  new_rent: number;
  current_deposit: number;
  new_deposit: number;
  move_in: string;
  rent_diff: number;
  deposit_diff: number;
  deficit_now: number;
  deficit_after_move: number;
  deficit_if_subsidized: number;
  note: string;
}

export interface Debt {
  to: string;
  amount: number;
  reason: string;
  repaid: number;
}

export interface Typical {
  income: number;
  spend: number;
  net: number;
  income_by_type: Record<string, number>;
  spend_by_cat: Record<string, number>;
}

export interface PlanIncome {
  name: string;
  amount: number;
  day: number;
  to: string; // 비상금 | 투자 | 생활비 | 생활비+투자
}

export interface Plan {
  monthly_budget: number;
  weekly_budget: number;
  fixed_cost: number;
  rule: string;
  incomes: PlanIncome[];
  current_emergency: number;
  current_invest: number;
  goals: { emergency: number; invest: number; target_month: string };
}

export interface Stats {
  window: [string, string];
  total_spend: number;
  refund: number;
  net_spend: number;
  n_spend_tx: number;
  categories: CatAmount[];
  monthly: Record<string, number>;
  daily: Record<string, number>;
  weekday: number[];
  weekday_cnt: number[];
  weekday_labels: string[];
  heat: number[][];
  top_merchants: Merchant[];
  transport_sub: Record<string, number>;
  subcats: Record<string, Record<string, number>>;
  hierarchy: Record<string, Record<string, HierSub>>;
  top_single: { date: string; name: string; amount: number; cat: string; memo: string }[];
  cashflow: Cashflow;
  months: string[];
  income_types: string[];
  income_monthly: Record<string, Record<string, number>>;
  spend_monthly: Record<string, Record<string, number>>;
  typical: Typical;
  habits: Habits;
  housing: Housing;
  debts: Debt[];
  debt_total: number;
  plan: Plan;
}

// 플래너 사용자 입력(수정 시 DB 저장). 기본값은 stats.plan에서 시드.
export interface PlannerState {
  incomes: PlanIncome[];
  monthly_budget: number;
  fixed_cost: number;
  current_emergency: number;
  current_invest: number;
  goal_emergency: number;
  goal_invest: number;
  target_month: string;
}

// 천단위 콤마
export const won = (n: number) =>
  (n < 0 ? '-' : '') + Math.abs(Math.round(n)).toLocaleString('ko-KR') + '원';
export const comma = (n: number) => Math.round(n).toLocaleString('ko-KR');
