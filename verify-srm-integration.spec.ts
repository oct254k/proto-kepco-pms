import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3001';

test('입찰현황 페이지 로딩', async ({ page }) => {
  await page.goto(`${BASE}/pipeline/`);
  await expect(page.locator('h2')).toContainText('입찰현황');
});

test('7개 Kanban 컬럼 표시 (FN-P-14 §2)', async ({ page }) => {
  await page.goto(`${BASE}/pipeline/`);
  await page.click('button:has-text("Kanban 보기")');
  const stages = ['발주요청접수','공고중','제안서접수중','기술평가','가격평가','낙찰','계약체결'];
  for (const s of stages) {
    await expect(page.locator('body')).toContainText(s);
  }
});

test('(b) SRM 입찰 탭 — srm-data.ts 공고·품목 표시', async ({ page }) => {
  await page.goto(`${BASE}/pipeline/`);
  // PL-001(광명공장 LED 조명교체, 공고중) 클릭
  await page.click('tr:has-text("광명공장 LED 조명교체")');
  await page.waitForSelector('text=(b) SRM 입찰');
  await page.click('button:has-text("(b) SRM 입찰")');
  await expect(page.locator('body')).toContainText('LED 조명교체');
  await expect(page.locator('body')).toContainText('600,000');
});

test('(b) SRM 입찰 탭 — id-map 연동 SRM 공고 ID 표시', async ({ page }) => {
  await page.goto(`${BASE}/pipeline/`);
  await page.click('tr:has-text("광명공장 LED 조명교체")');
  await page.waitForSelector('text=(b) SRM 입찰');
  await page.click('button:has-text("(b) SRM 입찰")');
  // id-map: PL-001 → BID-2026-005
  await expect(page.locator('body')).toContainText('BID-2026-005');
  await expect(page.locator('body')).toContainText('ORD-REQ-2025-001');
});

test('(c) 제안비교 — SRM_PROPOSALS 데이터 표시 (PL-004 낙찰)', async ({ page }) => {
  await page.goto(`${BASE}/pipeline/`);
  await page.click('tr:has-text("수원사업장 태양광")');
  await page.waitForSelector('text=(c) 제안비교');
  await page.click('button:has-text("(c) 제안비교")');
  await expect(page.locator('body')).toContainText('스마트이에스');
  await expect(page.locator('body')).toContainText('480,000,000');
});

test('(d) 낙찰결과 — SRM_AWARDS 데이터 표시 (PL-004)', async ({ page }) => {
  await page.goto(`${BASE}/pipeline/`);
  await page.click('tr:has-text("수원사업장 태양광")');
  await page.waitForSelector('text=(d) 낙찰결과');
  await page.click('button:has-text("(d) 낙찰결과")');
  await expect(page.locator('body')).toContainText('스마트이에스');
  await expect(page.locator('body')).toContainText('2025-05-28');
});

test('inline MOCK_SRM_DATA 번들에서 제거 확인', async ({ page }) => {
  const response = await page.goto(`${BASE}/_next/static/chunks/app/pipeline/page.js`);
  const bundle = await response!.text();
  expect(bundle).not.toContain('MOCK_SRM_DATA');
  expect(bundle).not.toContain('MOCK_PROPOSALS');
  expect(bundle).not.toContain('MOCK_AWARD');
});
