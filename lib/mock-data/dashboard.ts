import { DashboardKpi } from '@/types';

export const mockDashboardKpi: DashboardKpi = {
  year: 2026,
  projectCost: { target: 8500000000, actual: 7200000000 },
  investmentCost: { target: 6200000000, actual: 5800000000 },
  eersSaving: { target: 120, actual: 98 },
  irr: { planned: 8.5, actual: 7.9 },
  fundRecovery: {
    rate: 88.4,
    billed: 1250000000,
    recovered: 1105000000,
    uncollected: 145000000,
  },
  uncollectedAlerts: { red: 3, orange: 2, yellow: 5 },
  monthlyTrend: [
    { month: '1월', billed: 85000000, recovered: 78000000 },
    { month: '2월', billed: 92000000, recovered: 88000000 },
    { month: '3월', billed: 110000000, recovered: 95000000 },
    { month: '4월', billed: 105000000, recovered: 102000000 },
    { month: '5월', billed: 118000000, recovered: 108000000 },
    { month: '6월', billed: 125000000, recovered: 115000000 },
    { month: '7월', billed: 130000000, recovered: 120000000 },
    { month: '8월', billed: 122000000, recovered: 118000000 },
    { month: '9월', billed: 115000000, recovered: 110000000 },
    { month: '10월', billed: 108000000, recovered: 98000000 },
    { month: '11월', billed: 95000000, recovered: 87000000 },
    { month: '12월', billed: 45000000, recovered: 42000000 },
  ],
};

export const mockTodayRepayments = [
  { projectId: 'PRJ-2024-001', projectName: '광명전기 LED 교체', round: 8, amount: 5200000, energyUser: '(주)광명전기' },
  { projectId: 'PRJ-2024-005', projectName: '롯데마트 냉난방', round: 12, amount: 8500000, energyUser: '롯데쇼핑(주)' },
];

export const mockUncollected = [
  { projectId: 'PRJ-2024-001', projectName: '광명전기 LED 교체', round: 6, amount: 5200000, elapsedDays: 85, alertLevel: 'RED' as const },
  { projectId: 'PRJ-2024-003', projectName: '인천항 냉동창고 절감', round: 3, amount: 22000000, elapsedDays: 65, alertLevel: 'RED' as const },
  { projectId: 'PRJ-2023-002', projectName: 'KT 데이터센터 절감', round: 2, amount: 38000000, elapsedDays: 45, alertLevel: 'ORANGE' as const },
  { projectId: 'PRJ-2024-005', projectName: '롯데마트 냉난방', round: 5, amount: 8500000, elapsedDays: 32, alertLevel: 'YELLOW' as const },
];

export const mockNotices = [
  { id: 1, title: '2026년 1분기 경영실적 보고서 제출 안내', date: '2026-04-01', isNew: true },
  { id: 2, title: 'EERS 제도 변경 사항 공유 (산업부 고시)', date: '2026-03-25', isNew: false },
  { id: 3, title: '협력업체 신용평가 갱신 요청 (3월 만료 업체)', date: '2026-03-15', isNew: false },
  { id: 4, title: 'SRM 연동 점검 완료 보고', date: '2026-03-10', isNew: false },
];
