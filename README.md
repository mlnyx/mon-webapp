# 나의 가계부 (웹앱)

폰·PC 어디서든 로그인해서 보는 개인 가계부. **리포트**(소비 통계·습관·자산) + **플래너**(수입/예산/목표 시뮬).

- 프론트+백엔드: **Next.js** (Vercel 무료 배포)
- DB + 로그인: **Supabase 무료**
- UI: Tailwind + Catalyst

> 🔒 **재무 데이터는 GitHub에 안 올라갑니다.** 거래내역·금액은 전부 Supabase(비공개 DB)에만 있고, 로그인한 본인만 봅니다. 이 저장소엔 화면 코드만 있습니다.

---

## 처음 한 번만 — 당신이 할 일 (약 10분)

### 1. Supabase 무료 프로젝트 만들기
1. https://supabase.com → **Start your project** → GitHub로 로그인
2. **New project** 생성 (이름 아무거나, DB 비번 적어두기, 지역 Seoul)
3. 왼쪽 **SQL Editor** → `supabase/schema.sql` 내용 붙여넣고 **Run** (테이블 생성)
4. **Authentication → Users → Add user** → 본인 이메일 + 비번으로 계정 1개 생성
5. **Project Settings → API** 에서 3개 복사:
   - `Project URL`
   - `anon public` 키
   - `service_role` 키 (비밀!)

### 2. 로컬에 키 넣고 데이터 올리기
```bash
cp .env.example .env.local      # 그리고 위 3개 값 채우기 + SEED_USER_EMAIL=본인이메일
pnpm install
pnpm seed                       # mon/output/stats.json 을 Supabase에 업로드
pnpm dev                        # http://localhost:3000 에서 확인
```

### 3. 배포 (Vercel 무료)
1. 이 폴더를 GitHub에 push
2. https://vercel.com → GitHub로 로그인 → **Add New → Project** → 이 저장소 선택
3. **Environment Variables** 에 키 입력
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   ※ service_role 키는 Vercel에 **안 넣어도 됨**(시드는 로컬에서만)
4. **Deploy** → 나오는 주소(`https://xxx.vercel.app`)를 폰 홈화면에 추가

---

## 매달 갱신 (1분)
새 거래내역으로 파이프라인(`mon`) 돌린 뒤:
```bash
pnpm seed     # 새 stats.json 업로드 → 웹앱 새로고침하면 최신
```
플래너 입력은 그대로 유지됩니다(stats만 갱신).

---

## 개발
```bash
pnpm dev      # 로컬 개발
pnpm build    # 프로덕션 빌드 확인
```
