'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  TrendingDown,
  Wallet,
  CreditCard,
  Home,
  ShoppingBag,
  Truck,
  PiggyBank,
  Moon,
  AlertTriangle,
  Target,
  Activity,
  ChevronRight,
} from 'lucide-react';
import type { Stats, HierSub } from '@/lib/types';
import { won, comma, typeLabel } from '@/lib/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type ReportSection = 'summary' | 'spend' | 'asset' | 'habit';

// 부호 포함 금액(+/−). won()은 음수에만 '-'를 붙이므로 양수 '+' 표기용.
const signWon = (n: number) =>
  (n >= 0 ? '+' : '−') + Math.abs(Math.round(n)).toLocaleString('ko-KR') + '원';
const eok = (n: number) => `${comma(Math.round(n / 10000))}만`;

// 카드 공통 스타일
const CARD = 'rounded-2xl border border-border/60 bg-card shadow-sm';

// 가로 막대 한 줄(분류 라벨 메인 + 금액)
function Bar({
  label,
  sub,
  width,
  amount,
  color = 'bg-primary',
}: {
  label: string;
  sub?: string;
  width: number;
  amount: string;
  color?: string;
}) {
  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="truncate font-medium text-foreground">
          {label}
          {sub ? (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">{sub}</span>
          ) : null}
        </span>
        <span className="shrink-0 tabular-nums text-muted-foreground">{amount}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${Math.max(2, Math.min(100, width))}%` }}
        />
      </div>
    </div>
  );
}

// 한 줄 코멘트(아이콘 + 텍스트)
function Note({
  icon,
  tone = 'rose',
  children,
}: {
  icon: LucideIcon;
  tone?: 'rose' | 'emerald' | 'primary';
  children: React.ReactNode;
}) {
  const map = {
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    primary: 'bg-primary/10 text-primary',
  } as const;
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl p-3 text-sm', map[tone])}>
      <Icon icon={icon} size={16} className="mt-0.5 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

// 큰 숫자 통계 셀
function Stat({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone?: 'rose' | 'emerald' | 'primary';
  big?: boolean;
}) {
  const color =
    tone === 'rose'
      ? 'text-rose-600 dark:text-rose-400'
      : tone === 'emerald'
        ? 'text-emerald-600 dark:text-emerald-400'
        : tone === 'primary'
          ? 'text-primary'
          : 'text-foreground';
  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn('mt-1 font-bold tabular-nums', big ? 'text-2xl' : 'text-lg', color)}>
        {value}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// section = 'summary' — 핵심만, 큰 카드 위주
function Summary({ stats }: { stats: Stats }) {
  const t = stats.typical;
  const ia = stats.cashflow.invest_account;
  const hh = stats.housing;
  const debt = stats.debts[0];
  const plan = stats.plan;

  const emgPct = Math.min(100, (plan.current_emergency / plan.goals.emergency) * 100);
  const invPct = Math.min(100, (plan.current_invest / plan.goals.invest) * 100);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {/* 한 달 수지 히어로 — 전체폭 */}
      <Card className={cn(CARD, 'sm:col-span-2 xl:col-span-3')}>
        <CardHeader>
          <CardDescription>한 달 평균 (월급 기준)</CardDescription>
          <CardTitle className="text-base">이번 달 수지</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="수입" value={won(t.income)} />
            <Stat label="지출" value={won(t.spend)} />
          </div>
          <div className="rounded-xl bg-rose-500/10 p-4">
            <div className="text-xs text-rose-600/80 dark:text-rose-400/80">월 수지</div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {signWon(t.net)}
            </div>
            <div className="mt-1 text-sm text-rose-600/90 dark:text-rose-400/90">
              월급만으로는 매달 약 56만원이 부족해요.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 자산 카드 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon icon={Wallet} size={20} className="text-primary" />내 자산
          </CardTitle>
          <CardAction>
            <span className="text-xl font-bold tabular-nums">{eok(ia.total_account)}</span>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="text-sm text-muted-foreground">
            미국주식 {eok(ia.current_stock_value)} + 현금 {eok(ia.current_cash)}
          </div>
          <Note icon={TrendingDown} tone="rose">
            적자를 주식 팔아 메우는 중 — 3개월 순인출 <b>{eok(Math.abs(ia.net))}</b>.
          </Note>
        </CardContent>
      </Card>

      {/* 빚 카드 */}
      {debt ? (
        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon icon={CreditCard} size={20} className="text-rose-600 dark:text-rose-400" />
              갚을 빚
            </CardTitle>
            <CardAction>
              <span className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {won(stats.debt_total)}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {debt.to} — {debt.reason}. 유일한 빚이에요.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* 7월 이사 카드 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon icon={Home} size={20} className="text-emerald-600 dark:text-emerald-400" />7월 이사
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Note icon={Home} tone="emerald">
            회사 월세지원을 받으면 적자가 <b>{signWon(hh.deficit_if_subsidized)}</b>까지
            개선돼요.
          </Note>
        </CardContent>
      </Card>

      {/* 10월 목표 미니바 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon icon={Target} size={20} className="text-primary" />
            {plan.goals.target_month.slice(5)}월 목표
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-muted-foreground">비상금</span>
              <span className="tabular-nums">
                {eok(plan.current_emergency)} → {eok(plan.goals.emergency)}
              </span>
            </div>
            <Progress value={emgPct} />
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-muted-foreground">투자</span>
              <span className="tabular-nums">
                {eok(plan.current_invest)} → {eok(plan.goals.invest)}
              </span>
            </div>
            <Progress value={invPct} />
          </div>
        </CardContent>
      </Card>

      {/* 핵심 코멘트 3개 — 전체폭, 내부도 그리드 */}
      <Card className={cn(CARD, 'sm:col-span-2 xl:col-span-3')}>
        <CardHeader>
          <CardTitle className="text-base">이 셋이면 적자 0</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
          <Note icon={ShoppingBag} tone="primary">
            <b>쇼핑은 월 30만원 한도</b>로. 한도를 정하면 충동 결제가 눈에 보여요.
          </Note>
          <Note icon={Truck} tone="primary">
            <b>배달을 절반으로.</b> 외식·배달·카페가 한 달 약 73만원이에요.
          </Note>
          <Note icon={PiggyBank} tone="primary">
            <b>주식 인출 끊기.</b> 부족하면 주식 판다는 습관부터 멈춰요.
          </Note>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 소비 드릴다운: 카테고리 ▸ 세부 ▸ 개별
function DrillCat({
  cat,
  amount,
  width,
  pct,
  sub,
}: {
  cat: string;
  amount: number;
  width: number;
  pct: string;
  sub: Record<string, HierSub>;
}) {
  const [open, setOpen] = useState(false);
  const subEntries = Object.entries(sub).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <Icon
          icon={ChevronRight}
          size={16}
          className={cn('text-muted-foreground transition-transform', open && 'rotate-90')}
        />
        <span className="flex-1 text-sm font-medium">{cat}</span>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {won(amount)} · {pct}%
        </span>
      </button>
      {open ? (
        <div className="px-3 pb-3">
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(2, width)}%` }}
            />
          </div>
          {subEntries.map(([sname, sdata]) => {
            const maxItem = Math.max(...sdata.items.map((i) => i.amount), 1);
            return (
              <div key={sname} className="border-t border-border/40 pt-2 first:border-t-0 first:pt-0">
                {sname !== '전체' ? (
                  <div className="mb-1 mt-1 text-xs font-semibold text-muted-foreground">
                    {typeLabel(cat, sname)}
                  </div>
                ) : null}
                {sdata.items.map((it) => (
                  <Bar
                    key={it.name}
                    label={typeLabel(cat, sname)}
                    sub={`${it.name}${it.count > 1 ? ` ×${it.count}` : ''}`}
                    width={(it.amount / maxItem) * 100}
                    amount={won(it.amount)}
                    color="bg-primary/70"
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Spend({ stats }: { stats: Stats }) {
  const maxCat = Math.max(...stats.categories.map((c) => c.amount), 1);
  const grand = stats.categories.reduce((a, c) => a + c.amount, 0);
  const transport = Object.entries(stats.transport_sub).sort((a, b) => b[1] - a[1]);
  const maxT = Math.max(...transport.map(([, v]) => v), 1);

  return (
    <div className="flex flex-col gap-4">
      {/* 카테고리 막대 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="text-base">무엇에 썼나</CardTitle>
          <CardDescription>{stats.months.length}개월 총액 기준</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.categories.map((c) => (
            <Bar
              key={c.name}
              label={c.name}
              width={(c.amount / maxCat) * 100}
              amount={`${won(c.amount)} · ${((c.amount / grand) * 100).toFixed(1)}%`}
            />
          ))}
        </CardContent>
      </Card>

      {/* 드릴다운 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="text-base">자세히 보기</CardTitle>
          <CardDescription>카테고리를 눌러 분류·가맹점까지 펼쳐요</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {stats.categories.map((c) => (
            <DrillCat
              key={c.name}
              cat={c.name}
              amount={c.amount}
              width={(c.amount / maxCat) * 100}
              pct={((c.amount / grand) * 100).toFixed(1)}
              sub={stats.hierarchy[c.name] ?? {}}
            />
          ))}
        </CardContent>
      </Card>

      {/* 교통 세부 */}
      {transport.length ? (
        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="text-base">교통 세부</CardTitle>
          </CardHeader>
          <CardContent>
            {transport.map(([n, v]) => (
              <Bar
                key={n}
                label={n}
                width={(v / maxT) * 100}
                amount={won(v)}
                color="bg-secondary"
              />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════
// section = 'asset' — 포트폴리오 + 적자 메운 방식 + 빚
function Asset({ stats }: { stats: Stats }) {
  const ia = stats.cashflow.invest_account;
  const hold = ia.holdings;
  const max = Math.max(...hold.map((h) => h.value), 1);
  const sell = new Set(ia.selling_for_deposit);
  const debt = stats.debts[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 포트폴리오 — 길어서 전체폭 */}
      <Card className={cn(CARD, 'lg:col-span-2')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon icon={Wallet} size={20} className="text-primary" />내 미국주식
          </CardTitle>
          <CardAction>
            <span className="text-lg font-bold tabular-nums">{eok(ia.total_account)}</span>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            {hold.map((h) => (
              <Bar
                key={h.name}
                label={h.name}
                sub={sell.has(h.name) ? '매도중' : undefined}
                width={(h.value / max) * 100}
                amount={`${won(h.value)} · ${h.pct}%`}
                color={h.pct >= 30 ? 'bg-rose-400' : 'bg-secondary'}
              />
            ))}
          </div>
          <Note icon={AlertTriangle} tone="rose">
            팔란티어 + QQQ가 <b>74%</b>로 두 종목에 쏠려 있어 변동성이 커요.
          </Note>
          {ia.selling_for_deposit.length ? (
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <span>보증금용 매도중:</span>
              {ia.selling_for_deposit.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 적자 메운 방식 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="text-base">적자를 어떻게 메웠나</CardTitle>
          <CardDescription>주식계좌에서 돈을 빼 생활비로 썼어요</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="입금" value={signWon(ia.deposits)} tone="emerald" />
            <Stat label="출금" value={signWon(-ia.withdrawals)} tone="rose" />
            <Stat label="순인출" value={signWon(ia.net)} tone="rose" />
          </div>
          <Note icon={TrendingDown} tone="rose">
            누적 적자와 주식계좌 순인출 <b>{eok(Math.abs(ia.net))}</b>이 거의 일치 — 쿠션을
            매달 헐고 있는 구조예요.
          </Note>
        </CardContent>
      </Card>

      {/* 빚 + 보증금 노트 */}
      {debt ? (
        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon icon={CreditCard} size={20} className="text-rose-600 dark:text-rose-400" />
              갚을 빚
            </CardTitle>
            <CardAction>
              <span className="text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {won(stats.debt_total)}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="text-sm text-muted-foreground">
              {debt.to} — {debt.reason}
            </div>
            <Note icon={Home} tone="primary">
              새집 보증금은 6/30 예정 — QQQ·SPY를 팔아 충당 중. <b>자산 이동</b>이라 생활비
              적자와는 별개예요.
            </Note>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════
// section = 'habit' — 경제 습관 + 이사 시나리오 + 단건 Top10
function Habit({ stats }: { stats: Stats }) {
  const h = stats.habits;
  const hh = stats.housing;
  const freq: [string, number][] = [
    ['배달', h.delivery],
    ['킥보드', h.kickboard],
    ['편의점', h.convenience],
    ['카페', h.cafe],
  ];
  const maxF = Math.max(...freq.map((f) => f[1]), 1);

  const scen = [
    { v: hh.deficit_now, cap: '현재', tone: 'rose' as const },
    { v: hh.deficit_after_move, cap: '이사 후', tone: 'rose' as const },
    { v: hh.deficit_if_subsidized, cap: '회사 지원시', tone: 'emerald' as const },
  ];
  const maxS = Math.max(...scen.map((s) => Math.abs(s.v)), 1);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 습관 지표 — 전체폭 */}
      <Card className={cn(CARD, 'lg:col-span-2')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon icon={Activity} size={20} className="text-primary" />
            경제 습관
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label={`하루 결제 (총 ${comma(h.tx_count)}건)`} value={`${h.daily_tx}건`} />
            <Stat label="결제 중앙값" value={`${comma(h.median)}원`} />
            <Stat label="1만원 미만 비중" value={`${h.under_10k_pct}%`} />
            <Stat label="주식계좌 인출" value={`${h.stock_withdrawals}회`} tone="rose" />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-muted-foreground">
              잦은 소비 빈도 (건수)
            </div>
            {freq.map(([n, v]) => (
              <Bar key={n} label={n} width={(v / maxF) * 100} amount={`${v}건`} />
            ))}
          </div>
          <Note icon={Moon} tone="rose">
            심야(0~5시) 소비 <b>{h.late_count}건 · {won(h.late_amount)}</b>. 늦은 시간 충동
            결제가 적지 않아요.
          </Note>
        </CardContent>
      </Card>

      {/* 이사 시나리오 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon icon={Home} size={20} className="text-primary" />
            7월 이사 시나리오
          </CardTitle>
          <CardDescription>월세·지원에 따른 적자 변화</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {scen.map((s) => (
            <div key={s.cap} className="py-1">
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{s.cap}</span>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    s.tone === 'rose'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400',
                  )}
                >
                  {signWon(s.v)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full',
                    s.tone === 'rose' ? 'bg-rose-400' : 'bg-emerald-400',
                  )}
                  style={{ width: `${(Math.abs(s.v) / maxS) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 단건 Top10 — 분류가 메인 */}
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="text-base">단건 Top 10</CardTitle>
          <CardDescription>가장 큰 한 번의 결제</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-9">분류</TableHead>
                <TableHead className="h-9">메모</TableHead>
                <TableHead className="h-9 text-right">금액</TableHead>
                <TableHead className="h-9 text-right">날짜</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.top_single.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="p-2 font-semibold">{typeLabel(t.cat, t.sub)}</TableCell>
                  <TableCell className="max-w-[160px] truncate p-2 text-xs text-muted-foreground">
                    {t.name} · {t.memo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-2 text-right tabular-nums">
                    {won(t.amount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-2 text-right text-xs tabular-nums text-muted-foreground">
                    {t.date.slice(5)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════
export default function Report({
  stats,
  section,
}: {
  stats: Stats;
  section: ReportSection;
}) {
  return (
    <div className="reveal">
      {section === 'summary' && <Summary stats={stats} />}
      {section === 'spend' && <Spend stats={stats} />}
      {section === 'asset' && <Asset stats={stats} />}
      {section === 'habit' && <Habit stats={stats} />}
    </div>
  );
}
