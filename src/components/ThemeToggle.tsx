'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

// 다크/라이트 토글. 선택은 localStorage('theme')에 저장.
export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.style.colorScheme = next ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // localStorage 불가 시 무시
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? '라이트 모드로' : '다크 모드로'}
      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon icon={dark ? Sun : Moon} size={20} />
    </button>
  );
}
