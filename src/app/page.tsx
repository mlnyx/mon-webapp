import { getStats, getPlanner, plannerDefault } from '@/lib/data';
import Shell from '@/components/Shell';

const envReady =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function Home() {
  if (!envReady)
    return <Setup msg="Supabase 키가 설정되지 않았어요. .env.local 을 채워주세요." />;

  const stats = await getStats();
  if (!stats)
    return (
      <Setup msg="아직 데이터가 없어요. 시드 스크립트(pnpm seed)로 가계부 데이터를 올려주세요." />
    );

  const saved = await getPlanner();
  const planner = saved ?? plannerDefault(stats);

  return <Shell stats={stats} planner={planner} />;
}

function Setup({ msg }: { msg: string }) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6 text-center">
      <div className="panel max-w-md p-8 reveal">
        <h1 className="text-lg font-bold mb-2">나의 가계부</h1>
        <p className="text-sm text-[var(--muted)]">{msg}</p>
      </div>
    </div>
  );
}
