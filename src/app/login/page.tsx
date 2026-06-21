'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const INPUT =
  'w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary';

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
    <div className="flex min-h-dvh items-center justify-center bg-background px-5">
      <Card className="reveal w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">나의 가계부</CardTitle>
          <CardDescription>로그인하고 들어가세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={INPUT}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">비밀번호</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
                className={INPUT}
              />
            </div>

            {err && <p className="text-sm text-rose-400">{err}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
