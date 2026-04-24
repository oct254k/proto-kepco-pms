// 투자(구 CP, Construction Plan) 목록.
// ID 접두어 `CP-YYYY-NNN`은 레거시 호환을 위해 유지한다.
import { CpInvestment, CpInvestmentRevision } from '@/types';

export const mockCpInvestments: CpInvestment[] = [
  {
    id: 'CP-2024-001',
    projectId: 'PRJ-2024-001',
    projectName: '광명전기 LED 교체',
    energyUser: '(주)광명전기',
    manager: '김민준',
    currentRevision: 2,
    lastChangedAt: '2025-01-10',
    changeSummary: '착공일 2개월 연장, 총예산 소폭 증액',
    nextPlannedChange: '2025-07-01',
    status: 'ACTIVE',
  },
  {
    id: 'CP-2024-002',
    projectId: 'PRJ-2024-002',
    projectName: '한국철강 ESS 설치',
    energyUser: '한국철강(주)',
    manager: '이서연',
    currentRevision: 1,
    lastChangedAt: '2024-12-05',
    changeSummary: '설계 변경으로 공기 2개월 조정',
    nextPlannedChange: '2025-06-01',
    status: 'ACTIVE',
  },
  {
    id: 'CP-2024-003',
    projectId: 'PRJ-2024-003',
    projectName: '인천항 냉동창고 절감',
    energyUser: '인천항만공사',
    manager: '박지훈',
    currentRevision: 0,
    lastChangedAt: '2024-01-10',
    changeSummary: '원계획 수립',
    status: 'ACTIVE',
  },
  {
    id: 'CP-2024-004',
    projectId: 'PRJ-2024-004',
    projectName: '서울시청 제로에너지',
    energyUser: '서울특별시',
    manager: '최수빈',
    currentRevision: 1,
    lastChangedAt: '2025-02-15',
    changeSummary: '설비 사양 변경으로 예산 조정',
    nextPlannedChange: '2025-08-01',
    status: 'ACTIVE',
  },
  {
    id: 'CP-2024-005',
    projectId: 'PRJ-2024-005',
    projectName: '롯데마트 냉난방 절감',
    energyUser: '롯데쇼핑(주)',
    manager: '최수빈',
    currentRevision: 2,
    lastChangedAt: '2024-11-20',
    changeSummary: '추가 점포 포함으로 물량 증가',
    status: 'ACTIVE',
  },
  {
    id: 'CP-2023-002',
    projectId: 'PRJ-2023-002',
    projectName: 'KT 데이터센터 절감',
    energyUser: 'KT(주)',
    manager: '한승우',
    currentRevision: 3,
    lastChangedAt: '2024-09-30',
    changeSummary: 'AI 제어 모듈 추가로 예산 증액 및 일정 조정',
    status: 'ACTIVE',
  },
  {
    id: 'CP-2024-006',
    projectId: 'PRJ-2024-006',
    projectName: '창원공장 인버터 교체',
    energyUser: '(주)창원산업',
    manager: '박지훈',
    currentRevision: 0,
    lastChangedAt: '2025-01-15',
    changeSummary: '원계획 수립',
    nextPlannedChange: '2025-09-01',
    status: 'ACTIVE',
  },
  {
    id: 'CP-2023-001',
    projectId: 'PRJ-2023-001',
    projectName: '부산항 조명 교체',
    energyUser: '부산항만공사',
    manager: '정다은',
    currentRevision: 1,
    lastChangedAt: '2023-09-05',
    changeSummary: '공사 구역 확대로 물량 조정',
    status: 'CLOSED',
  },
];

export const mockCpInvestmentRevisions: CpInvestmentRevision[] = [
  // ── CP-2024-001 (광명전기 LED, 2차)
  {
    id: 'REV-001-0', cpId: 'CP-2024-001', revisionNumber: 0,
    confirmedAt: '2024-01-15', reason: '원계획 수립',
    status: 'CONFIRMED', startDate: '2024-03-01', endDate: '2027-02-28', totalBudget: 250000000,
  },
  {
    id: 'REV-001-1', cpId: 'CP-2024-001', revisionNumber: 1,
    confirmedAt: '2024-07-20', reason: '전기 설비 추가 공사 및 BEMS 서버 사양 상향으로 공기 연장',
    status: 'CONFIRMED', startDate: '2024-05-01', endDate: '2027-04-30', totalBudget: 265000000,
  },
  {
    id: 'REV-001-2', cpId: 'CP-2024-001', revisionNumber: 2,
    confirmedAt: '2025-01-10', reason: '착공일 2개월 연장 (고객사 공장 가동 스케줄 협의)',
    status: 'CONFIRMED', startDate: '2024-07-01', endDate: '2027-06-30', totalBudget: 265000000,
  },

  // ── CP-2024-002 (한국철강 ESS, 1차)
  {
    id: 'REV-002-0', cpId: 'CP-2024-002', revisionNumber: 0,
    confirmedAt: '2024-03-20', reason: '원계획 수립',
    status: 'CONFIRMED', startDate: '2024-06-01', endDate: '2029-05-31', totalBudget: 800000000,
  },
  {
    id: 'REV-002-1', cpId: 'CP-2024-002', revisionNumber: 1,
    confirmedAt: '2024-12-05', reason: '설계 변경(배터리 셀 사양 변경)으로 공기 2개월 조정',
    status: 'CONFIRMED', startDate: '2024-08-01', endDate: '2029-07-31', totalBudget: 820000000,
  },
  {
    id: 'REV-002-2', cpId: 'CP-2024-002', revisionNumber: 2,
    reason: '추가 안전설비 요건 반영 (고용노동부 지침 개정)',
    status: 'DRAFT', startDate: '2024-08-01', endDate: '2029-09-30', totalBudget: 845000000,
  },

  // ── CP-2024-003 (인천항 냉동창고, 0차)
  {
    id: 'REV-003-0', cpId: 'CP-2024-003', revisionNumber: 0,
    confirmedAt: '2024-01-10', reason: '원계획 수립',
    status: 'CONFIRMED', startDate: '2024-01-10', endDate: '2031-01-09', totalBudget: 1500000000,
  },

  // ── CP-2024-004 (서울시청 제로에너지, 1차)
  {
    id: 'REV-004-0', cpId: 'CP-2024-004', revisionNumber: 0,
    confirmedAt: '2024-05-10', reason: '원계획 수립',
    status: 'CONFIRMED', startDate: '2024-09-01', endDate: '2025-08-31', totalBudget: 4500000000,
  },
  {
    id: 'REV-004-1', cpId: 'CP-2024-004', revisionNumber: 1,
    confirmedAt: '2025-02-15', reason: '고효율 히트펌프로 설비 사양 변경 — 초기 투자비 증가, 연간 절감액 확대',
    status: 'CONFIRMED', startDate: '2024-09-01', endDate: '2025-10-31', totalBudget: 4750000000,
  },
  {
    id: 'REV-004-2', cpId: 'CP-2024-004', revisionNumber: 2,
    reason: '공사 기간 중 추가 설비 발견으로 석면 해체 공사 선행 필요',
    status: 'PENDING_APPROVAL', startDate: '2024-09-01', endDate: '2026-01-31', totalBudget: 4900000000,
  },

  // ── CP-2024-005 (롯데마트, 2차)
  {
    id: 'REV-005-0', cpId: 'CP-2024-005', revisionNumber: 0,
    confirmedAt: '2024-02-05', reason: '원계획 수립',
    status: 'CONFIRMED', startDate: '2024-04-01', endDate: '2029-03-31', totalBudget: 520000000,
  },
  {
    id: 'REV-005-1', cpId: 'CP-2024-005', revisionNumber: 1,
    confirmedAt: '2024-07-10', reason: '점포 1개 추가(영등포점) 포함으로 물량 및 예산 증가',
    status: 'CONFIRMED', startDate: '2024-04-01', endDate: '2029-03-31', totalBudget: 580000000,
  },
  {
    id: 'REV-005-2', cpId: 'CP-2024-005', revisionNumber: 2,
    confirmedAt: '2024-11-20', reason: '냉매 규격 변경(R-410A → R-32) 설계 재검토로 공기 조정',
    status: 'CONFIRMED', startDate: '2024-06-01', endDate: '2029-05-31', totalBudget: 585000000,
  },

  // ── CP-2023-002 (KT 데이터센터, 3차)
  {
    id: 'REV-KT-0', cpId: 'CP-2023-002', revisionNumber: 0,
    confirmedAt: '2023-04-15', reason: '원계획 수립',
    status: 'CONFIRMED', startDate: '2023-07-01', endDate: '2028-06-30', totalBudget: 2200000000,
  },
  {
    id: 'REV-KT-1', cpId: 'CP-2023-002', revisionNumber: 1,
    confirmedAt: '2024-02-20', reason: '냉매 회수 설비 추가 및 일부 배관 재설계',
    status: 'CONFIRMED', startDate: '2023-07-01', endDate: '2028-08-31', totalBudget: 2280000000,
  },
  {
    id: 'REV-KT-2', cpId: 'CP-2023-002', revisionNumber: 2,
    confirmedAt: '2024-06-01', reason: '2단계 AI 제어 모듈 범위 확대 (Rack 3동 → 전동)',
    status: 'CONFIRMED', startDate: '2023-07-01', endDate: '2028-08-31', totalBudget: 2380000000,
  },
  {
    id: 'REV-KT-3', cpId: 'CP-2023-002', revisionNumber: 3,
    confirmedAt: '2024-09-30', reason: '전력 수전 설비 용량 증설로 예산 재편성',
    status: 'CONFIRMED', startDate: '2023-09-01', endDate: '2028-10-31', totalBudget: 2420000000,
  },

  // ── CP-2024-006 (창원공장 인버터, 0차)
  {
    id: 'REV-006-0', cpId: 'CP-2024-006', revisionNumber: 0,
    confirmedAt: '2025-01-15', reason: '원계획 수립',
    status: 'CONFIRMED', startDate: '2025-01-15', endDate: '2030-01-14', totalBudget: 430000000,
  },

  // ── CP-2023-001 (부산항 조명, 1차, CLOSED)
  {
    id: 'REV-BUS-0', cpId: 'CP-2023-001', revisionNumber: 0,
    confirmedAt: '2022-12-01', reason: '원계획 수립',
    status: 'CONFIRMED', startDate: '2023-03-01', endDate: '2025-12-31', totalBudget: 600000000,
  },
  {
    id: 'REV-BUS-1', cpId: 'CP-2023-001', revisionNumber: 1,
    confirmedAt: '2023-09-05', reason: '3부두 추가 공사 구역 확대로 물량 조정',
    status: 'CONFIRMED', startDate: '2023-03-01', endDate: '2025-12-31', totalBudget: 635000000,
  },
];
