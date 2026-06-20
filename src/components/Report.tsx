'use client';

import { useState } from 'react';
import type { Stats, HierSub } from '@/lib/types';
import { won, comma } from '@/lib/types';

// 부호 포함 금액 (+/− 표기). won()은 음수에 '-'만 붙이므로 양수 '+' 표기용으로 별도.
const signWon = (n: number) =>
  (n >= 0 ? '+' : '−') + Math.abs(Math.round(n)).toLocaleString('ko-KR') + '원';
// 표 셀용: 부호만 붙이고 '원'은 뺀 콤마 표기
const signComma = (n: number) =>
  (n >= 0 ? '+' : '−') + Math.abs(Math.round(n)).toLocaleString('ko-KR');

const monthLabel = (m: string) => `${m.slice(5)}월`;

// 섹션 래퍼: reveal 등장 + 단계 지연
function Section({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <section className="reveal mt-[26px]" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </section>
  );
}

// 공통 가로막대 한 줄
function BarRow({
  name,
  width,
  amountLabel,
  count,
  color = 'var(--accent)',
}: {
  name: string;
  width: number;
  amountLabel: string;
  count?: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-[10px] my-[7px] text-[13px]">
      <span
        className="w-[96px] sm:w-32 flex-none whitespace-nowrap overflow-hidden text-ellipsis text-[var(--text)]"
        title={name}
      >
        {name}
        {count ? <span className="text-[var(--muted)]"> ×{count}</span> : null}
      </span>
      <div className="flex-1 h-[18px] bg-[var(--panel2)] rounded-[5px] overflow-hidden">
        <div
          className="h-full rounded-[5px] transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
      <span className="w-[96px] sm:w-[120px] flex-none text-right text-[var(--muted)] tabular-nums">
        {amountLabel}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// 1. 히어로
function Hero({ stats }: { stats: Stats }) {
  const t = stats.typical;
  return (
    <div className="panel p-5">
      <h1 className="text-[22px] font-bold mb-1">📊 가계부 리포트</h1>
      <p className="text-[var(--muted)] text-sm">
        분석 기간 {stats.window[0]} ~ {stats.window[1]} · {stats.months.length}개월{' '}
        {comma(stats.habits.tx_count)}건 거래 기준 · 한 달 평균값
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px] mt-[18px]">
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[12px] p-[18px]">
          <div className="text-[13px] text-[var(--muted)] mb-[6px]">한 달 수입</div>
          <div className="text-[26px] font-bold tabular-nums">{won(t.income)}</div>
        </div>
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[12px] p-[18px]">
          <div className="text-[13px] text-[var(--muted)] mb-[6px]">한 달 지출</div>
          <div className="text-[26px] font-bold tabular-nums">{won(t.spend)}</div>
        </div>
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[12px] p-[18px]">
          <div className="text-[13px] text-[var(--muted)] mb-[6px]">월 수지 (적자)</div>
          <div className="text-[26px] font-bold tabular-nums text-[var(--warn)]">
            {signWon(t.net)}
          </div>
        </div>
      </div>
      <div className="mt-[14px] px-4 py-[14px] rounded-[11px] text-sm bg-[rgba(229,84,75,0.10)] border border-[rgba(229,84,75,0.35)] text-[#f1a59f]">
        ⚠️ <b>월급만으로 매달 약 56만원이 부족</b>합니다. 수입보다 지출이 구조적으로 커서,
        가만히 있으면 매달 적자가 쌓이는 상태입니다.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. 적자를 어떻게 메웠나 + 4. 갚을 빚
function Cover({ stats }: { stats: Stats }) {
  const ia = stats.cashflow.invest_account;
  const debt = stats.debts[0];
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px]">💸 적자를 어떻게 메웠나</h2>
      <p className="text-[var(--muted)] text-sm mb-[14px]">
        부족분은 <b>한국투자 미국주식 계좌에서 돈을 빼서</b> 메웠습니다. 저축을 헐어
        생활비로 쓴 셈입니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-[14px]">
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[12px] p-[18px]">
          <div className="text-[13px] text-[var(--muted)] mb-[6px]">주식계좌 입금</div>
          <div className="text-[20px] font-bold tabular-nums">{signWon(ia.deposits)}</div>
        </div>
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[12px] p-[18px]">
          <div className="text-[13px] text-[var(--muted)] mb-[6px]">주식계좌 출금</div>
          <div className="text-[20px] font-bold tabular-nums">{signWon(-ia.withdrawals)}</div>
        </div>
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[12px] p-[18px]">
          <div className="text-[13px] text-[var(--muted)] mb-[6px]">순인출</div>
          <div className="text-[20px] font-bold tabular-nums text-[var(--warn)]">
            {signWon(ia.net)}
          </div>
        </div>
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[12px] p-[18px]">
          <div className="text-[13px] text-[var(--muted)] mb-[6px]">한투 총자산</div>
          <div className="text-[20px] font-bold tabular-nums">{won(ia.total_account)}</div>
        </div>
      </div>
      <div className="mt-4 px-4 py-[14px] rounded-[11px] text-sm bg-[rgba(229,84,75,0.10)] border border-[rgba(229,84,75,0.35)] text-[#f1a59f]">
        4개월 누적 적자 <b className="tabular-nums">약 167만원</b>과 주식계좌 순인출{' '}
        <b className="tabular-nums">약 165만원</b>이 거의 정확히 일치합니다 — 즉{' '}
        <b>모자란 생활비를 매달 저축계좌에서 빼서 메우는 구조</b>입니다. 다만{' '}
        <b>바닥난 건 아니고</b>, 미국주식 평가액{' '}
        <b className="tabular-nums">{comma(Math.round(ia.current_stock_value / 10000))}만</b> + 현금{' '}
        <b className="tabular-nums">{comma(Math.round(ia.current_cash / 10000))}만</b> ={' '}
        <b className="tabular-nums">약 {comma(Math.round(ia.total_account / 10000))}만</b> 보유 중(약 7개월치 쿠션). 그 쿠션을 매달 헐고 있다는 게 핵심입니다.
      </div>
      <div className="mt-[14px] px-4 py-[14px] rounded-[11px] text-sm bg-[rgba(229,84,75,0.10)] border border-[rgba(229,84,75,0.35)] text-[var(--text)]">
        🏠 <b>새집 보증금 300만은 6/30 예정</b> — 지금 QQQ·SPY를 팔아 충당 중. 이건{' '}
        <b>자산 이동(나중에 돌려받음)</b>이라 위 생활비 적자와는 별개입니다.
      </div>
      {debt ? (
        <div className="mt-[14px] px-4 py-[14px] rounded-[11px] text-sm bg-[rgba(229,84,75,0.10)] border border-[rgba(229,84,75,0.35)] text-[#f1a59f]">
          💳 <b>갚을 빚 <span className="tabular-nums">{won(stats.debt_total)}</span></b> ·{' '}
          {debt.to} — {debt.reason}
          <div className="text-[13px] text-[var(--muted)] mt-[6px]">
            박찬 228만·영훈 10만은 정리 완료. 7월 회사 월세지원 받으면 상환 가능.
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. 포트폴리오
function Portfolio({ stats }: { stats: Stats }) {
  const ia = stats.cashflow.invest_account;
  const hold = ia.holdings;
  const max = Math.max(...hold.map((h) => h.value), 1);
  const sell = new Set(ia.selling_for_deposit);
  const eok = comma(Math.round(ia.total_account / 10000));
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px] flex items-center gap-2">
        📈 내 미국주식
        <span className="text-xs font-semibold text-[var(--muted)] bg-[var(--panel2)] px-[9px] py-[2px] rounded-[20px]">
          약 {eok}만
        </span>
      </h2>
      <p className="text-[var(--muted)] text-sm mb-[14px]">
        한국투자증권 보유 종목(평가액 기준).{' '}
        <b className="tabular-nums text-[var(--warn)]">팔란티어 41.7% + QQQ 32.1% = 74%</b>가 두
        종목에 쏠려 있어 변동성이 큽니다.
      </p>
      <div>
        {hold.map((h) => {
          const top = h.pct >= 30;
          const col = top ? 'var(--warn)' : 'var(--accent2)';
          return (
            <div key={h.name} className="my-2">
              <div className="flex justify-between text-[13px] mb-[3px]">
                <span>
                  {h.name}
                  {sell.has(h.name) ? (
                    <span className="text-xs text-[var(--accent)]"> · 보증금용 매도중</span>
                  ) : null}
                </span>
                <span className="tabular-nums">
                  {won(h.value)} · {h.pct}%
                </span>
              </div>
              <div className="bg-[var(--panel2)] rounded-[5px] h-[9px] overflow-hidden">
                <div
                  className="h-full rounded-[5px]"
                  style={{ width: `${Math.round((h.value / max) * 100)}%`, background: col }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-[14px] px-4 py-[14px] rounded-[11px] text-sm bg-[rgba(229,84,75,0.10)] border border-[rgba(229,84,75,0.35)] text-[var(--text)]">
        🏷️ <b>QQQ·SPY는 보증금용으로 매도 중</b> — 매도하면 분산 ETF가 빠지고
        개별주(팔란티어·테슬라 등) 비중이 더 커집니다. 보증금 300만 6/30 예정이며,
        자산이동이라 생활비와 별개입니다.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. 월별 가계부 표
function MonthlyTable({ stats }: { stats: Stats }) {
  const months = stats.months;
  const cats = stats.categories.map((c) => c.name);

  // 수입: 타입별 행 + 합계
  const incTot: Record<string, number> = {};
  months.forEach((m) => (incTot[m] = 0));
  const incRows = stats.income_types
    .map((it) => {
      let rowSum = 0;
      const cells = months.map((m) => {
        const v = stats.income_monthly[m]?.[it] ?? 0;
        incTot[m] += v;
        rowSum += v;
        return v;
      });
      return { name: it, cells, rowSum };
    })
    .filter((r) => r.rowSum > 0);
  const incGrand = months.reduce((a, m) => a + incTot[m], 0);

  // 지출: 카테고리별 행 + 합계
  const spTot: Record<string, number> = {};
  months.forEach((m) => (spTot[m] = 0));
  const spRows = cats
    .map((cat) => {
      let rowSum = 0;
      const cells = months.map((m) => {
        const v = stats.spend_monthly[m]?.[cat] ?? 0;
        spTot[m] += v;
        rowSum += v;
        return v;
      });
      return { name: cat, cells, rowSum };
    })
    .filter((r) => r.rowSum > 0);
  const spGrand = months.reduce((a, m) => a + spTot[m], 0);

  const balGrand = incGrand - spGrand;
  const colSpan = months.length + 2;

  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px] flex items-center gap-2">
        📅 월별 가계부
        <span className="text-xs font-semibold text-[var(--muted)] bg-[var(--panel2)] px-[9px] py-[2px] rounded-[20px]">
          {monthLabel(months[0])} ~ {monthLabel(months[months.length - 1])}
        </span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="text-left text-[var(--muted)] font-semibold text-xs px-[10px] py-2 border-b border-[var(--line)]">
                항목
              </th>
              {months.map((m) => (
                <th
                  key={m}
                  className="text-right text-[var(--muted)] font-semibold text-xs px-[10px] py-2 border-b border-[var(--line)] whitespace-nowrap"
                >
                  {monthLabel(m)}
                </th>
              ))}
              <th className="text-right text-[var(--muted)] font-semibold text-xs px-[10px] py-2 border-b border-[var(--line)]">
                합계
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={colSpan}
                className="text-left px-[10px] py-2 text-[var(--accent2)] font-semibold border-b border-[var(--line)]"
              >
                수입
              </td>
            </tr>
            {incRows.map((r) => (
              <tr key={r.name} className="hover:bg-[var(--panel2)]">
                <td className="text-left px-[10px] py-2 border-b border-[var(--line)] whitespace-nowrap">
                  {r.name}
                </td>
                {r.cells.map((v, i) => (
                  <td
                    key={i}
                    className="text-right px-[10px] py-2 border-b border-[var(--line)] tabular-nums whitespace-nowrap"
                  >
                    {v ? comma(v) : '·'}
                  </td>
                ))}
                <td className="text-right px-[10px] py-2 border-b border-[var(--line)] tabular-nums whitespace-nowrap">
                  {comma(r.rowSum)}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="text-left px-[10px] py-2 border-t-2 border-[var(--line)]">수입 합계</td>
              {months.map((m) => (
                <td key={m} className="text-right px-[10px] py-2 border-t-2 border-[var(--line)] tabular-nums">
                  {comma(incTot[m])}
                </td>
              ))}
              <td className="text-right px-[10px] py-2 border-t-2 border-[var(--line)] tabular-nums">
                {comma(incGrand)}
              </td>
            </tr>

            <tr>
              <td
                colSpan={colSpan}
                className="text-left px-[10px] py-2 text-[var(--accent)] font-semibold border-b border-[var(--line)]"
              >
                지출
              </td>
            </tr>
            {spRows.map((r) => (
              <tr key={r.name} className="hover:bg-[var(--panel2)]">
                <td className="text-left px-[10px] py-2 border-b border-[var(--line)] whitespace-nowrap">
                  {r.name}
                </td>
                {r.cells.map((v, i) => (
                  <td
                    key={i}
                    className="text-right px-[10px] py-2 border-b border-[var(--line)] tabular-nums whitespace-nowrap"
                  >
                    {v ? comma(v) : '·'}
                  </td>
                ))}
                <td className="text-right px-[10px] py-2 border-b border-[var(--line)] tabular-nums whitespace-nowrap">
                  {comma(r.rowSum)}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="text-left px-[10px] py-2 border-t-2 border-[var(--line)]">지출 합계</td>
              {months.map((m) => (
                <td key={m} className="text-right px-[10px] py-2 border-t-2 border-[var(--line)] tabular-nums">
                  {comma(spTot[m])}
                </td>
              ))}
              <td className="text-right px-[10px] py-2 border-t-2 border-[var(--line)] tabular-nums">
                {comma(spGrand)}
              </td>
            </tr>

            <tr className="font-bold">
              <td className="text-left px-[10px] py-2 border-t-2 border-[var(--line)]">수지</td>
              {months.map((m) => {
                const b = incTot[m] - spTot[m];
                return (
                  <td
                    key={m}
                    className={`text-right px-[10px] py-2 border-t-2 border-[var(--line)] tabular-nums ${
                      b < 0 ? 'text-[var(--warn)] font-semibold' : ''
                    }`}
                  >
                    {signComma(b)}
                  </td>
                );
              })}
              <td
                className={`text-right px-[10px] py-2 border-t-2 border-[var(--line)] tabular-nums ${
                  balGrand < 0 ? 'text-[var(--warn)] font-semibold' : ''
                }`}
              >
                {signComma(balGrand)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-[var(--muted)] mt-[10px]">
        ※ 5월에 월급(약 670만)이 몰려 들어와 평소 월급(약 223만)과 다릅니다. 수지가 음수인
        달은 빨강으로 표시됩니다.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// 6. 카테고리 3단계 드릴다운
function DrillSub({
  name,
  data,
  maxSub,
  single,
}: {
  name: string;
  data: HierSub;
  maxSub: number;
  single: boolean;
}) {
  const [open, setOpen] = useState(false);
  const maxItem = Math.max(...data.items.map((i) => i.amount), 1);
  return (
    <div className="border-t border-[var(--line)] py-2">
      <div
        className="flex items-center gap-[10px] px-1 py-[5px] cursor-pointer text-[13px] hover:text-[var(--accent2)]"
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className="text-[var(--muted)] text-[11px] w-3 transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
        >
          ▶
        </span>
        <span className="flex-1 font-medium">{single ? '가맹점별' : name}</span>
        <div className="w-[120px] h-2 bg-[var(--panel)] rounded-[4px] overflow-hidden">
          <div
            className="h-full bg-[var(--accent2)] rounded-[4px]"
            style={{ width: `${(data.total / maxSub) * 100}%` }}
          />
        </div>
        <span className="w-[110px] text-right text-[var(--muted)] text-xs tabular-nums">
          {won(data.total)}
        </span>
      </div>
      {open ? (
        <div className="pl-5 pt-1 pb-2">
          {data.items.map((it) => (
            <BarRow
              key={it.name}
              name={it.name}
              count={it.count}
              width={(it.amount / maxItem) * 100}
              amountLabel={won(it.amount)}
              color="var(--accent2)"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
  const maxSub = Math.max(...subEntries.map((s) => s[1].total), 1);
  return (
    <div className="border border-[var(--line)] rounded-[11px] mb-[9px] overflow-hidden bg-[var(--panel2)]">
      <div
        className="flex items-center gap-[10px] px-[14px] py-3 cursor-pointer select-none hover:bg-[var(--panel)]"
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className="text-[var(--muted)] text-xs transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
        >
          ▶
        </span>
        <span className="font-semibold flex-1">{cat}</span>
        <div className="w-[160px] h-[10px] bg-[var(--panel)] rounded-[4px] overflow-hidden hidden sm:block">
          <div
            className="h-full bg-[var(--accent)] rounded-[4px]"
            style={{ width: `${width}%` }}
          />
        </div>
        <span className="w-[130px] text-right text-[var(--muted)] text-[13px] tabular-nums">
          {won(amount)} · {pct}%
        </span>
      </div>
      {open ? (
        <div className="px-[14px] pb-3 pt-1">
          {subEntries.map(([sname, sdata]) => (
            <DrillSub
              key={sname}
              name={sname}
              data={sdata}
              maxSub={maxSub}
              single={subEntries.length === 1 && sname === '전체'}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Drilldown({ stats }: { stats: Stats }) {
  const maxCat = Math.max(...stats.categories.map((c) => c.amount), 1);
  const grand = stats.categories.reduce((a, c) => a + c.amount, 0);
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px] flex items-center gap-2">
        🔍 카테고리 드릴다운
        <span className="text-xs font-semibold text-[var(--muted)] bg-[var(--panel2)] px-[9px] py-[2px] rounded-[20px]">
          클릭해서 펼치기
        </span>
      </h2>
      <p className="text-[var(--muted)] text-sm mb-[14px]">
        카테고리 ▸ 세부 ▸ 개별 가맹점 3단계로 펼쳐집니다. ({stats.months.length}개월 총액 기준)
      </p>
      <div>
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
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 7. 월별 지출 추이
function MonthlyTrend({ stats }: { stats: Stats }) {
  const entries = Object.entries(stats.monthly).sort((a, b) => a[0].localeCompare(b[0]));
  const max = Math.max(...entries.map(([, v]) => v), 1);
  // 부분월(시작/종료가 월 경계에 안 맞는 달) 표시
  const firstM = stats.window[0].slice(0, 7);
  const lastM = stats.window[1].slice(0, 7);
  const partial = new Set<string>();
  if (!stats.window[0].endsWith('-01')) partial.add(firstM);
  partial.add(lastM); // 종료일은 보통 월 중간(데이터 컷오프)
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px]">📊 월별 지출 추이</h2>
      <div className="flex items-end gap-[22px] h-[200px] px-[6px] pt-[10px]">
        {entries.map(([m, v]) => (
          <div key={m} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="text-[13px] font-bold mb-[7px] tabular-nums">{won(v)}</div>
            <div
              className="w-[64%] rounded-t-[7px] bg-[var(--accent)] min-h-1 transition-[height] duration-700 ease-out"
              style={{ height: `${(v / max) * 140}px` }}
            />
            <div className="text-xs text-[var(--muted)] mt-[9px] text-center">
              {monthLabel(m)}
              {partial.has(m) ? ' *' : ''}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-[var(--muted)] mt-[10px]">
        ※ 3·6월은 부분월(데이터가 월 전체를 덮지 않음)이라 * 표시 — 실제 한 달치보다 적게 보일 수
        있습니다.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// 8. 요일 패턴 + 히트맵
function WeekdayHeat({ stats }: { stats: Stats }) {
  const maxWd = Math.max(...stats.weekday, 1);
  const satIdx = stats.weekday_labels.indexOf('토');
  // 히트맵 농도 최대값
  let maxHeat = 0;
  stats.heat.forEach((row) => row.forEach((v) => (maxHeat = Math.max(maxHeat, v))));
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px]">📆 요일 패턴 + 시간 히트맵</h2>
      <h3 className="text-[15px] font-semibold text-[var(--muted)] mb-[10px]">요일별 지출</h3>
      <div>
        {stats.weekday.map((v, i) => {
          const isSat = i === satIdx;
          return (
            <BarRow
              key={i}
              name={`${stats.weekday_labels[i]}요일`}
              width={(v / maxWd) * 100}
              amountLabel={won(v)}
              color={isSat ? 'var(--warn)' : 'var(--accent)'}
            />
          );
        })}
      </div>
      <p className="text-[13px] text-[var(--muted)] mt-2">
        토요일 지출이 가장 큽니다(주말 외식·쇼핑).
      </p>

      <h3 className="text-[15px] font-semibold text-[var(--muted)] mb-[10px] mt-5">
        시간대 × 요일 히트맵 (0~23시)
      </h3>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-[2px] mb-[2px] pl-7">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="w-[14px] text-center text-[9px] text-[var(--muted)] tabular-nums"
              >
                {h % 3 === 0 ? h : ''}
              </div>
            ))}
          </div>
          {stats.heat.map((row, di) => (
            <div key={di} className="flex gap-[2px] mb-[2px] items-center">
              <div className="w-7 text-[11px] text-[var(--muted)] pr-1 text-right">
                {stats.weekday_labels[di]}
              </div>
              {row.map((v, hi) => {
                const a = maxHeat > 0 ? v / maxHeat : 0;
                return (
                  <div
                    key={hi}
                    title={`${stats.weekday_labels[di]} ${hi}시 · ${won(v)}`}
                    className="w-[14px] h-[14px] rounded-[3px]"
                    style={{
                      background:
                        v > 0
                          ? `rgba(233,128,110,${0.12 + a * 0.88})`
                          : 'var(--panel2)',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="text-[13px] text-[var(--muted)] mt-[10px]">
        진할수록 그 시간대 지출이 큽니다. 늦은 밤·저녁 시간대에 결제가 몰립니다.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// 9. Top 가맹점 + 교통 세부
function TopMerchants({ stats }: { stats: Stats }) {
  const maxM = Math.max(...stats.top_merchants.map((m) => m.amount), 1);
  const transport = Object.entries(stats.transport_sub).sort((a, b) => b[1] - a[1]);
  const maxT = Math.max(...transport.map(([, v]) => v), 1);
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px]">🏪 Top 가맹점</h2>
      <div>
        {stats.top_merchants.map((m) => (
          <BarRow
            key={m.name}
            name={m.name}
            count={m.count}
            width={(m.amount / maxM) * 100}
            amountLabel={won(m.amount)}
          />
        ))}
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--muted)] mb-[10px] mt-5">교통 세부</h3>
      <div>
        {transport.map(([n, v]) => (
          <BarRow
            key={n}
            name={n}
            width={(v / maxT) * 100}
            amountLabel={won(v)}
            color="var(--accent2)"
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 10. 단건 Top10
function TopSingle({ stats }: { stats: Stats }) {
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px]">💳 단건 Top 10</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="text-left text-[var(--muted)] font-semibold text-xs px-[10px] py-2 border-b border-[var(--line)] whitespace-nowrap">
                날짜
              </th>
              <th className="text-left text-[var(--muted)] font-semibold text-xs px-[10px] py-2 border-b border-[var(--line)]">
                가맹점
              </th>
              <th className="text-right text-[var(--muted)] font-semibold text-xs px-[10px] py-2 border-b border-[var(--line)]">
                금액
              </th>
              <th className="text-left text-[var(--muted)] font-semibold text-xs px-[10px] py-2 border-b border-[var(--line)]">
                분류
              </th>
              <th className="text-left text-[var(--muted)] font-semibold text-xs px-[10px] py-2 border-b border-[var(--line)]">
                메모
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.top_single.map((s, i) => (
              <tr key={i} className="hover:bg-[var(--panel2)]">
                <td className="text-left px-[10px] py-2 border-b border-[var(--line)] whitespace-nowrap tabular-nums">
                  {s.date}
                </td>
                <td
                  className="text-left px-[10px] py-2 border-b border-[var(--line)] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap"
                  title={s.name}
                >
                  {s.name}
                </td>
                <td className="text-right px-[10px] py-2 border-b border-[var(--line)] tabular-nums whitespace-nowrap">
                  {won(s.amount)}
                </td>
                <td className="text-left px-[10px] py-2 border-b border-[var(--line)] whitespace-nowrap text-[var(--muted)]">
                  {s.cat}
                </td>
                <td
                  className="text-left px-[10px] py-2 border-b border-[var(--line)] max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]"
                  title={s.memo}
                >
                  {s.memo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 11. 경제 습관
function HabitsSection({ stats }: { stats: Stats }) {
  const h = stats.habits;
  const freq: [string, number][] = [
    ['킥보드', h.kickboard],
    ['편의점', h.convenience],
    ['카페', h.cafe],
    ['배달', h.delivery],
  ];
  const maxF = Math.max(...freq.map((f) => f[1]), 1);
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px]">🧠 경제 습관 분석</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px] mb-4">
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[11px] p-[14px]">
          <div className="text-[22px] font-bold tabular-nums">{h.daily_tx}건</div>
          <div className="text-[13px] text-[var(--muted)] mt-[2px]">
            하루 평균 결제 건수 (총 {comma(h.tx_count)}건 / {h.days}일)
          </div>
        </div>
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[11px] p-[14px]">
          <div className="text-[22px] font-bold tabular-nums">{comma(h.median)}원</div>
          <div className="text-[13px] text-[var(--muted)] mt-[2px]">
            결제 금액 중앙값 — 소액 잦은 결제 패턴
          </div>
        </div>
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[11px] p-[14px]">
          <div className="text-[22px] font-bold tabular-nums">{h.under_10k_pct}%</div>
          <div className="text-[13px] text-[var(--muted)] mt-[2px]">
            1만원 미만 결제 비중 ({comma(h.under_10k)}건) — &lsquo;티끌 지출&rsquo;
          </div>
        </div>
        <div className="bg-[var(--panel2)] border border-[var(--line)] rounded-[11px] p-[14px]">
          <div className="text-[22px] font-bold tabular-nums text-[var(--warn)]">
            {h.stock_withdrawals}회
          </div>
          <div className="text-[13px] text-[var(--muted)] mt-[2px]">
            주식계좌 인출 — 돈 필요할 때마다 반응적으로
          </div>
        </div>
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--muted)] mb-[10px]">잦은 소비 빈도 (건수)</h3>
      <div>
        {freq.map(([n, v]) => (
          <BarRow key={n} name={n} width={(v / maxF) * 100} amountLabel={`${v}건`} />
        ))}
      </div>
      <div className="mt-4 px-4 py-[14px] rounded-[11px] text-sm bg-[rgba(229,84,75,0.10)] border border-[rgba(229,84,75,0.35)] text-[#f1a59f]">
        🌙 <b>심야(0~5시) 소비 {h.late_count}건 · 총 {won(h.late_amount)}.</b> 늦은 시간 충동
        결제·배달이 적지 않습니다.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 12. 7월 이사 시나리오
function HousingScenario({ stats }: { stats: Stats }) {
  const hh = stats.housing;
  const vals = [
    { v: hh.deficit_now, cap: `월세 ${Math.round(hh.current_rent / 10000)}만`, color: 'var(--warn)' },
    { v: hh.deficit_after_move, cap: `월세 ${Math.round(hh.new_rent / 10000)}만`, color: 'var(--warn)' },
    { v: hh.deficit_if_subsidized, cap: '회사 지원시', color: 'var(--accent2)' },
  ];
  const max = Math.max(...vals.map((d) => Math.abs(d.v)), 1);
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px]">🏠 7월 이사 시나리오</h2>
      <p className="text-[var(--muted)] text-sm mb-[6px]">
        새 집(오라빌) 입주 예정 {hh.move_in.slice(5).replace('-', '/')}. 보증금{' '}
        {Math.round(hh.current_deposit / 10000)}만 → {Math.round(hh.new_deposit / 10000)}만, 월세{' '}
        {Math.round(hh.current_rent / 10000)}만 → {Math.round(hh.new_rent / 10000)}만.
      </p>
      <div className="flex items-end gap-[22px] h-[200px] px-[6px] pt-[10px] mb-2">
        {vals.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="text-[14px] font-bold mb-[7px] tabular-nums" style={{ color: d.color }}>
              {signWon(d.v)}
            </div>
            <div
              className="w-[64%] rounded-t-[7px] min-h-1 transition-[height] duration-700 ease-out"
              style={{ height: `${(Math.abs(d.v) / max) * 150}px`, background: d.color }}
            />
            <div className="text-xs text-[var(--muted)] mt-[9px] text-center">{d.cap}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-around text-xs text-[var(--muted)] mb-[10px]">
        <span>현재</span>
        <span>이사 후 (지원 없음)</span>
        <span>이사 후 (회사 지원)</span>
      </div>
      <div className="px-4 py-[14px] rounded-[11px] text-sm bg-[rgba(229,84,75,0.10)] border border-[rgba(229,84,75,0.35)] text-[var(--text)]">
        📌 <b>참고:</b> {hh.note} 회사 지원이 확정되면 적자가{' '}
        <span className="text-[var(--accent2)] font-semibold tabular-nums">
          {signWon(hh.deficit_if_subsidized)}
        </span>
        까지 줄어듭니다.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 13. 컨설팅
function Consulting() {
  const tips = [
    {
      ic: '①',
      body: (
        <>
          <b>식비 + 카페를 주 15만원 봉투(현금/별도 체크카드)로 운영.</b> 외식·배달·카페가 한 달 약
          73만원입니다. 주간 한도를 정해 쓰면 충동 결제가 눈에 보이게 줄어듭니다.
        </>
      ),
    },
    {
      ic: '②',
      body: (
        <>
          <b>심야 결제 앱 차단.</b> 0~5시 결제가 39건·약 80만원. 자정 이후 배달·쇼핑 앱을 잠그면
          충동 소비가 크게 줄어듭니다.
        </>
      ),
    },
    {
      ic: '③',
      body: (
        <>
          <b>주식 인출 끊고 &lsquo;월 예산제&rsquo;로 전환.</b> 19회나 주식계좌에서 반응적으로 빼
          썼습니다. 월초에 예산을 정하고 그 안에서만 쓰세요.
        </>
      ),
    },
  ];
  return (
    <div className="panel p-5">
      <h2 className="text-[18px] font-bold mb-[14px]">🎯 컨설팅 — 습관 교정 3가지</h2>
      <ul className="list-none">
        {tips.map((t, i) => (
          <li
            key={i}
            className="relative pl-[30px] py-[11px] border-b border-[var(--line)] last:border-b-0 text-sm"
          >
            <span className="absolute left-0 top-[11px]">{t.ic}</span>
            {t.body}
          </li>
        ))}
      </ul>
      <div className="mt-4 px-4 py-[14px] rounded-[11px] text-sm bg-[rgba(229,84,75,0.10)] border border-[rgba(229,84,75,0.35)] text-[#f1a59f]">
        🚫 <b>주식을 생활비 ATM처럼 쓰지 마세요.</b> 팔 때마다 양도소득세(22%)·매도 타이밍
        손실·복리 손실이 누적됩니다. &lsquo;부족하면 주식 판다&rsquo;가 습관이 되면 자산이 늘 수
        없습니다. 먼저 <b>수지를 0 이상</b>으로 만드는 게 우선입니다.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 14. 각주
function Footnotes({ stats }: { stats: Stats }) {
  return (
    <div className="panel p-5">
      <h3 className="text-[15px] font-semibold text-[var(--muted)] mb-[10px]">데이터 주석</h3>
      <ul className="list-disc pl-5 text-[13px] text-[var(--muted)] space-y-2">
        <li>
          한국투자증권 입·출금은 은행 export에 받는사람이 &lsquo;노승민&rsquo;으로만 찍혀, 어느 게
          투자/인출인지 <b>수동 확인된 건만</b> 반영했습니다.
        </li>
        <li>
          자기 계좌 간 <b>내부 이체</b>(농협→카카오페이 충전, 카카오뱅크→네이버페이 등)와{' '}
          <b>네이버페이 포인트</b>(비현금)는 소비 통계에서 제외했습니다.
        </li>
        <li>
          분석 기간은 {stats.window[0]} ~ {stats.window[1]}이며, 시작·종료가 월 경계에 안 맞는
          부분월(3·6월)은 추이 그래프에서 *로 표시했습니다.
        </li>
        <li>모든 금액은 원 단위, 원본 거래내역은 로컬에서만 처리됩니다.</li>
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────
export default function Report({ stats }: { stats: Stats }) {
  return (
    <div className="max-w-[980px] mx-auto px-[18px] pb-20">
      <Section delay={0}>
        <Hero stats={stats} />
      </Section>
      <Section delay={90}>
        <Cover stats={stats} />
      </Section>
      <Section delay={180}>
        <Portfolio stats={stats} />
      </Section>
      <Section delay={270}>
        <MonthlyTable stats={stats} />
      </Section>
      <Section delay={360}>
        <Drilldown stats={stats} />
      </Section>
      <Section delay={450}>
        <MonthlyTrend stats={stats} />
      </Section>
      <Section delay={540}>
        <WeekdayHeat stats={stats} />
      </Section>
      <Section delay={630}>
        <TopMerchants stats={stats} />
      </Section>
      <Section delay={720}>
        <TopSingle stats={stats} />
      </Section>
      <Section delay={810}>
        <HabitsSection stats={stats} />
      </Section>
      <Section delay={900}>
        <HousingScenario stats={stats} />
      </Section>
      <Section delay={990}>
        <Consulting />
      </Section>
      <Section delay={1080}>
        <Footnotes stats={stats} />
      </Section>
    </div>
  );
}
