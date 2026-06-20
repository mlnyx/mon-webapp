// 가계부 데이터(stats.json)를 Supabase에 업로드. 로컬에서만 실행(서비스 키 필요).
// 실행: pnpm seed   (== node --env-file=.env.local scripts/seed.mjs)
//
// 매달 파이프라인(mon) 돌린 뒤 이 스크립트로 새 stats.json을 올리면 웹앱이 갱신됨.
// 거래내역 raw가 아니라 집계된 stats.json만 올라가고, DB는 RLS로 본인만 접근.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = process.env.SEED_USER_EMAIL;
const STATS_PATH =
  process.env.STATS_PATH || '../mon/output/stats.json';

if (!URL || !SERVICE || !EMAIL) {
  console.error(
    '❌ .env.local 에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_USER_EMAIL 필요',
  );
  process.exit(1);
}

const stats = JSON.parse(readFileSync(STATS_PATH, 'utf-8'));
const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1) 이메일로 사용자 찾기
const { data: list, error: listErr } = await admin.auth.admin.listUsers();
if (listErr) {
  console.error('❌ 사용자 목록 오류:', listErr.message);
  process.exit(1);
}
const user = list.users.find((u) => u.email === EMAIL);
if (!user) {
  console.error(
    `❌ ${EMAIL} 사용자가 없어요. Supabase 대시보드 → Authentication → Add user 로 먼저 만들어주세요.`,
  );
  process.exit(1);
}

// 2) stats upsert (planner는 건드리지 않음 — 사용자 입력 보존)
const { error } = await admin
  .from('app_data')
  .upsert({ user_id: user.id, key: 'stats', value: stats });

if (error) {
  console.error('❌ 업로드 실패:', error.message);
  process.exit(1);
}

console.log(
  `✅ 가계부 데이터 업로드 완료 → ${EMAIL}\n   기간 ${stats.window?.[0]}~${stats.window?.[1]}, 거래 ${stats.n_spend_tx}건`,
);
