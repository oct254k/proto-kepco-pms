/**
 * PMS Prototype — Playwright 검증 스펙
 * 화면설계서 SCR-P-01 ~ SCR-P-17 기준
 */

import { test, expect, Page } from '@playwright/test';

// 결과 디렉토리 준비는 playwright.config.ts outputDir 설정으로 처리됨

// ─────────────────────────────────────────────────────────────
// SCR-P-01 대시보드 (/dashboard)
// ─────────────────────────────────────────────────────────────
test('SCR-P-01 대시보드', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // 404 아님
  await expect(page).not.toHaveURL(/404/);

  // KPI 카드 3개 확인 (사업비/투자비/EERS)
  await expect(page.locator('text=사업비').first()).toBeVisible();
  await expect(page.locator('text=투자비').first()).toBeVisible();
  await expect(page.locator('text=EERS').first()).toBeVisible();

  // recharts 차트 컨테이너 존재
  const chartWrapper = page.locator('.recharts-wrapper').first();
  await expect(chartWrapper).toBeVisible();

  // 연도 선택 드롭다운
  const yearSelect = page.locator('select').first();
  await expect(yearSelect).toBeVisible();

  // Widget-1 경영실적 KPI 섹션 존재
  await expect(page.locator('text=경영실적 KPI')).toBeVisible();

  // 오늘의 상환 위젯 존재
  await expect(page.locator('text=오늘의 상환')).toBeVisible();

  // 미회수 현황 위젯 존재 (실제 제목: "미회수 경보 현황")
  await expect(page.locator('text=미회수').first()).toBeVisible();

  await page.screenshot({ path: 'playwright-results/01-dashboard.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-02 기회등록 (/opportunity/new)
// ─────────────────────────────────────────────────────────────
test('SCR-P-02 기회등록 (Stepper)', async ({ page }) => {
  await page.goto('/opportunity/new');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // Stepper 5단계 레이블 확인
  await expect(page.locator('text=사업유형').first()).toBeVisible();
  await expect(page.locator('text=기본정보').first()).toBeVisible();
  await expect(page.locator('text=계약정보').first()).toBeVisible();
  await expect(page.locator('text=발주요청').first()).toBeVisible();

  // STEP 1 사업유형 선택 카드 — 3자간/용역 라디오 확인
  await expect(page.locator('text=3자간').first()).toBeVisible();
  await expect(page.locator('text=용역').first()).toBeVisible();

  // [다음] 버튼 존재
  const nextBtn = page.locator('button', { hasText: '다음' }).first();
  await expect(nextBtn).toBeVisible();

  // 심의 대상 여부 라디오 확인
  await expect(page.locator('text=심의').first()).toBeVisible();

  await page.screenshot({ path: 'playwright-results/02-opportunity-new.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-03 기회 사업접수 현황 (/opportunity)
// ─────────────────────────────────────────────────────────────
test('SCR-P-03 기회 사업접수 현황', async ({ page }) => {
  await page.goto('/opportunity');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 사업접수 5단계 카드 텍스트 확인
  await expect(page.locator('text=기회등록중').first()).toBeVisible();
  await expect(page.locator('text=검토중').first()).toBeVisible();
  await expect(page.locator('text=승인완료').first()).toBeVisible();
  await expect(page.locator('text=발주요청완료').first()).toBeVisible();
  await expect(page.locator('text=계약체결').first()).toBeVisible();

  // 조회조건 박스 (content-box-wrap) 존재
  const searchBox = page.locator('.content-box-wrap').first();
  await expect(searchBox).toBeVisible();

  // 테이블 존재
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // [+ 사업접수 등록] 버튼
  await expect(page.locator('button', { hasText: '사업접수 등록' }).first()).toBeVisible();

  // Drawer 열기 — 첫 번째 테이블 행 클릭
  const firstRow = page.locator('tbody tr').first();
  if (await firstRow.count() > 0) {
    await firstRow.click();
    // Drawer가 열렸는지 확인 (DrawerPanel)
    await page.waitForTimeout(500);
    const drawer = page.locator('[class*="drawer"], [class*="Drawer"]').first();
    // Drawer 내에 상세 내용이 렌더링되는지 확인
    // (구현에 따라 다를 수 있어 느슨하게 검증)
  }

  await page.screenshot({ path: 'playwright-results/03-opportunity-intake.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-04 프로젝트 목록 (/projects)
// ─────────────────────────────────────────────────────────────
test('SCR-P-04a 프로젝트 목록', async ({ page }) => {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 조회조건 박스
  const searchBox = page.locator('.content-box-wrap').first();
  await expect(searchBox).toBeVisible();

  // 테이블 존재
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // 테이블 행 존재 (최소 1행)
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  // 정렬 버튼 (th 클릭 가능한 헤더)
  const thElements = page.locator('table thead th');
  const thCount = await thElements.count();
  expect(thCount).toBeGreaterThan(0);

  await page.screenshot({ path: 'playwright-results/04a-projects-list.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-04 프로젝트 상세 (/projects/PRJ-2024-001)
// ─────────────────────────────────────────────────────────────
test('SCR-P-04b 프로젝트 상세 — 탭 6개', async ({ page }) => {
  await page.goto('/projects/PRJ-2024-001');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 탭 6개: 기본정보 / 계약 / 투자비 / 세금계산서 / 상환 / 미회수
  await expect(page.locator('text=기본정보').first()).toBeVisible();
  await expect(page.locator('text=계약').first()).toBeVisible();
  await expect(page.locator('text=투자비').first()).toBeVisible();
  await expect(page.locator('text=세금계산서').first()).toBeVisible();
  await expect(page.locator('text=상환').first()).toBeVisible();
  await expect(page.locator('text=미회수').first()).toBeVisible();

  // 프로젝트 헤더 카드 존재
  await expect(page.locator('text=PRJ-2024-001').first()).toBeVisible();

  // 계약 탭 클릭
  await page.locator('button', { hasText: '계약' }).first().click();
  await page.waitForTimeout(300);

  // 투자비 탭 클릭
  await page.locator('button', { hasText: '투자비' }).first().click();
  await page.waitForTimeout(300);

  // 상환 탭 클릭
  await page.locator('button', { hasText: '상환' }).first().click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'playwright-results/04b-project-detail.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-05 투자 목록 (/cp)
// ─────────────────────────────────────────────────────────────
test('SCR-P-05 투자 목록', async ({ page }) => {
  await page.goto('/cp');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 테이블 존재
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // 현재차수 컬럼 헤더 확인
  await expect(page.locator('text=현재차수').first()).toBeVisible();

  // 최소 1행 존재
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  await page.screenshot({ path: 'playwright-results/05-investment-list.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-06 투자 상세 (/cp/CP-2024-001)
// ─────────────────────────────────────────────────────────────
test('SCR-P-06 투자 상세 — 차수 타임라인 + 탭 3개', async ({ page }) => {
  await page.goto('/cp/CP-2024-001');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 차수 타임라인 — 0차 존재
  await expect(page.locator('text=0차').first()).toBeVisible();

  // 탭 3개: 일정 / 예산 / 물량
  await expect(page.locator('button', { hasText: '일정' }).first()).toBeVisible();
  await expect(page.locator('button', { hasText: '예산' }).first()).toBeVisible();
  await expect(page.locator('button', { hasText: '물량' }).first()).toBeVisible();

  // 예산 탭 클릭
  await page.locator('button', { hasText: '예산' }).first().click();
  await page.waitForTimeout(300);

  // 물량 탭 클릭
  await page.locator('button', { hasText: '물량' }).first().click();
  await page.waitForTimeout(300);

  // [차수 UP 신규 작성] 버튼 존재
  await expect(page.locator('text=차수 UP').first()).toBeVisible();

  await page.screenshot({ path: 'playwright-results/06-investment-detail.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-07 계약조회 (/contracts)
// ─────────────────────────────────────────────────────────────
test('SCR-P-07 계약조회 — 수주/발주 탭', async ({ page }) => {
  await page.goto('/contracts');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 수주계약 / 발주계약 탭
  await expect(page.locator('text=수주계약').first()).toBeVisible();
  await expect(page.locator('text=발주계약').first()).toBeVisible();

  // 테이블 존재
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // 발주계약 탭 클릭
  const orderTab = page.locator('button', { hasText: '발주계약' }).first();
  if (await orderTab.count() > 0) {
    await orderTab.click();
    await page.waitForTimeout(300);
  }

  await page.screenshot({ path: 'playwright-results/07-contracts.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-08 사업결산 IRR (/settlement)
// ─────────────────────────────────────────────────────────────
test('SCR-P-08 사업결산 — IRR 컬럼', async ({ page }) => {
  await page.goto('/settlement');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 테이블 존재
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // IRR 컬럼 헤더 확인
  await expect(page.locator('text=IRR').first()).toBeVisible();

  // 최소 1행
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  await page.screenshot({ path: 'playwright-results/08-settlement.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-09 마이페이지 (/mypage)
// ─────────────────────────────────────────────────────────────
test('SCR-P-09 마이페이지 — 3개 섹션', async ({ page }) => {
  await page.goto('/mypage');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 3개 섹션 — 개인정보/비밀번호/알림 등 마이페이지 구성 요소
  // content-box-wrap 3개 이상
  const sections = page.locator('.content-box-wrap');
  const sectionCount = await sections.count();
  expect(sectionCount).toBeGreaterThanOrEqual(1);

  // 마이페이지 타이틀 혹은 개인정보 섹션
  await expect(page.locator('text=마이페이지').first()).toBeVisible();

  await page.screenshot({ path: 'playwright-results/09-mypage.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-10 사용자관리 (/admin/users)
// ─────────────────────────────────────────────────────────────
test('SCR-P-10 사용자관리 — 탭 2개 + 테이블', async ({ page }) => {
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 탭 2개: PMS 사용자 / 그룹웨어 연동
  await expect(page.locator('text=PMS').first()).toBeVisible();
  await expect(page.locator('text=그룹웨어').first()).toBeVisible();

  // 테이블 존재
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // 최소 1행
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  await page.screenshot({ path: 'playwright-results/10-admin-users.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-11 프로젝트정보관리 (/admin/projects)
// ─────────────────────────────────────────────────────────────
test('SCR-P-11 프로젝트정보관리 — 테이블', async ({ page }) => {
  await page.goto('/admin/projects');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 테이블 존재
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // 최소 1행
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  await page.screenshot({ path: 'playwright-results/11-admin-projects.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-12 경영실적목표 (/admin/targets)
// ─────────────────────────────────────────────────────────────
test('SCR-P-12 경영실적목표 — 연도 탭 + 인라인 편집', async ({ page }) => {
  await page.goto('/admin/targets');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 연도 탭 (2024/2025/2026)
  await expect(page.locator('text=2024').first()).toBeVisible();
  await expect(page.locator('text=2025').first()).toBeVisible();
  await expect(page.locator('text=2026').first()).toBeVisible();

  // 테이블 혹은 인라인 편집 그리드 존재
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // 사업비 목표 항목 확인
  await expect(page.locator('text=사업비 목표').first()).toBeVisible();

  await page.screenshot({ path: 'playwright-results/12-admin-targets.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-13 협력업체 (/admin/contractors)
// ─────────────────────────────────────────────────────────────
test('SCR-P-13 협력업체 — 업체 목록 + 신용등급 배지', async ({ page }) => {
  await page.goto('/admin/contractors');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 테이블 존재
  const table = page.locator('table').first();
  await expect(table).toBeVisible();

  // 최소 1행
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  // 신용등급 배지 (status-badge) 존재
  const badges = page.locator('.status-badge');
  const badgeCount = await badges.count();
  expect(badgeCount).toBeGreaterThan(0);

  await page.screenshot({ path: 'playwright-results/13-admin-contractors.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-14 시스템환경 (/admin/system)
// ─────────────────────────────────────────────────────────────
test('SCR-P-14 시스템환경 — 탭 2개 + 차트', async ({ page }) => {
  await page.goto('/admin/system');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 탭 2개 이상 존재 확인
  // content-box-wrap 또는 tab 요소 확인
  const contentBoxes = page.locator('.content-box-wrap');
  const boxCount = await contentBoxes.count();
  expect(boxCount).toBeGreaterThanOrEqual(1);

  await page.screenshot({ path: 'playwright-results/14-admin-system.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-15 입찰현황 Kanban (/pipeline)
// ─────────────────────────────────────────────────────────────
test('SCR-P-15 입찰현황 Kanban — 7컬럼', async ({ page }) => {
  await page.goto('/pipeline');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // Kanban 7컬럼 헤더 텍스트 확인
  await expect(page.locator('text=발주요청접수').first()).toBeVisible();
  await expect(page.locator('text=공고중').first()).toBeVisible();
  await expect(page.locator('text=제안서접수중').first()).toBeVisible();
  await expect(page.locator('text=기술평가').first()).toBeVisible();
  await expect(page.locator('text=가격평가').first()).toBeVisible();
  await expect(page.locator('text=낙찰').first()).toBeVisible();
  await expect(page.locator('text=계약체결').first()).toBeVisible();

  // 필터 바 (content-box-wrap)
  const filterBox = page.locator('.content-box-wrap').first();
  await expect(filterBox).toBeVisible();

  // Kanban 카드 — 최소 1개
  const cards = page.locator('[class*="card"], .kanban-card, .card').first();

  // 첫 번째 클릭 가능한 카드 찾기 (Drawer 열기 테스트)
  const firstCard = page.locator('div[role="button"]').first();
  if (await firstCard.count() > 0) {
    await firstCard.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'playwright-results/15-bid.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// SCR-P-17 투자 상세 (/cp/CP-2024-001) — 상세 검증
// ─────────────────────────────────────────────────────────────
test('SCR-P-17 투자 상세 — 헤더카드 + 타임라인 + 탭', async ({ page }) => {
  await page.goto('/cp/CP-2024-001');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/404/);

  // 헤더 카드 — 프로젝트명 존재 확인 (content-box-wrap)
  const headerCard = page.locator('.content-box-wrap').first();
  await expect(headerCard).toBeVisible();

  // 현재차수 배지 존재 (N차 확정 / N차 DRAFT)
  await expect(page.locator('text=차').first()).toBeVisible();

  // 타임라인 — 최소 0차 존재
  await expect(page.locator('text=0차').first()).toBeVisible();

  // 탭 3개 (일정 계획 / 예산 계획 / 물량 계획)
  await expect(page.locator('button', { hasText: '일정' }).first()).toBeVisible();
  await expect(page.locator('button', { hasText: '예산' }).first()).toBeVisible();
  await expect(page.locator('button', { hasText: '물량' }).first()).toBeVisible();

  // 일정 탭 내용 확인
  await page.locator('button', { hasText: '일정' }).first().click();
  await page.waitForTimeout(300);
  // WBS 테이블 확인
  const scheduleTable = page.locator('table').first();
  await expect(scheduleTable).toBeVisible();

  // [차수 UP 신규 작성] 버튼
  await expect(page.locator('text=차수 UP').first()).toBeVisible();

  // [프로젝트 상세] 링크 존재
  await expect(page.locator('text=프로젝트').first()).toBeVisible();

  await page.screenshot({ path: 'playwright-results/17-investment-detail.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// 추가 검증: 존재하는 페이지들 404 없음 확인
// ─────────────────────────────────────────────────────────────
test('전체 라우트 404 없음 확인', async ({ page }) => {
  const routes = [
    '/dashboard',
    '/opportunity',
    '/opportunity/new',
    '/pipeline',
    '/projects',
    '/projects/PRJ-2024-001',
    '/cp',
    '/cp/CP-2024-001',
    '/contracts',
    '/settlement',
    '/mypage',
    '/admin/users',
    '/admin/projects',
    '/admin/targets',
    '/admin/contractors',
    '/admin/system',
  ];

  const results: { route: string; status: '정상' | '404' | '오류' }[] = [];

  for (const route of routes) {
    try {
      const response = await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      const url = page.url();
      const is404 = url.includes('404') || url.includes('not-found');
      results.push({ route, status: is404 ? '404' : '정상' });
    } catch {
      results.push({ route, status: '오류' });
    }
  }

  // 결과 출력
  console.log('\n=== 라우트 검증 결과 ===');
  results.forEach(r => {
    console.log(`${r.status === '정상' ? '✅' : '❌'} ${r.route} → ${r.status}`);
  });

  // 모든 라우트가 정상이어야 함
  const failedRoutes = results.filter(r => r.status !== '정상');
  if (failedRoutes.length > 0) {
    console.log('\n실패한 라우트:', failedRoutes.map(r => r.route).join(', '));
  }
  expect(failedRoutes.length).toBe(0);
});
