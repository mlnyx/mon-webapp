'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) {
      setErr('로그인 실패: ' + error.message);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-5">
      <form onSubmit={submit} className="panel w-full max-w-sm p-7 reveal">
        <h1 className="text-xl font-bold mb-1">나의 가계부</h1>
        <p className="text-sm text-[var(--muted)] mb-6">로그인하고 들어가세요</p>

        <label className="block text-xs text-[var(--muted)] mb-1">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 rounded-lg bg-[var(--panel2)] border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent2)]"
        />

        <label className="block text-xs text-[var(--muted)] mb-1">비밀번호</label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          className="w-full mb-5 rounded-lg bg-[var(--panel2)] border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent2)]"
        />

        {err && <p className="text-sm text-[var(--warn)] mb-4">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--accent2)] text-[#0e1714] font-semibold py-2.5 text-sm disabled:opacity-50"
        >
          {loading ? '...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
