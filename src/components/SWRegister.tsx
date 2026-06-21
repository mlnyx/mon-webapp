'use client';

import { useEffect } from 'react';

// 서비스워커 등록 (PWA 오프라인 셸 + 설치)
export default function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/mon-webapp/sw.js', { scope: '/mon-webapp/' })
        .catch(() => {
          // 등록 실패는 무시(앱은 그대로 동작)
        });
    }
  }, []);
  return null;
}
