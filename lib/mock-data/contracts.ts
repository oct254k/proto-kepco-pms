import { Contract } from '@/types';

const PDF = '/sample-docs/contract-sample.pdf';

export const mockContracts: Contract[] = [
  // ── PRJ-2024-001 광명전기
  { id: 'CNT-2024-001', projectId: 'PRJ-2024-001', type: 'AWARD', name: '광명전기 LED교체 수주계약', counterparty: '(주)광명전기', amount: 250000000, date: '2024-02-15', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2024-002', projectId: 'PRJ-2024-001', type: 'ORDER', name: '광명전기 LED교체 발주계약', counterparty: '(주)한빛전기', amount: 180000000, date: '2024-02-20', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2024-002 한국철강
  { id: 'CNT-2024-003', projectId: 'PRJ-2024-002', type: 'AWARD', name: '한국철강 ESS 수주계약', counterparty: '한국철강(주)', amount: 800000000, date: '2024-05-10', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2024-003B', projectId: 'PRJ-2024-002', type: 'ORDER', name: '한국철강 ESS 발주계약', counterparty: '에너지솔루션(주)', amount: 580000000, date: '2024-05-20', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2024-003 인천항
  { id: 'CNT-2024-004', projectId: 'PRJ-2024-003', type: 'AWARD', name: '인천항 냉동창고 수주계약', counterparty: '인천항만공사', amount: 1500000000, date: '2023-12-20', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2024-004B', projectId: 'PRJ-2024-003', type: 'ORDER', name: '인천항 냉동창고 발주계약', counterparty: '(주)그린테크', amount: 1100000000, date: '2024-01-05', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2024-004 서울시청
  { id: 'CNT-2024-006', projectId: 'PRJ-2024-004', type: 'AWARD', name: '서울시청 제로에너지 수주계약', counterparty: '서울특별시', amount: 4500000000, date: '2024-07-15', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2024-006B', projectId: 'PRJ-2024-004', type: 'ORDER', name: '서울시청 제로에너지 발주계약', counterparty: '(주)한빛전기', amount: 3200000000, date: '2024-08-01', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2024-005 롯데마트
  { id: 'CNT-2024-005', projectId: 'PRJ-2024-005', type: 'AWARD', name: '롯데마트 냉난방 수주계약', counterparty: '롯데쇼핑(주)', amount: 520000000, date: '2024-03-10', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2024-005B', projectId: 'PRJ-2024-005', type: 'ORDER', name: '롯데마트 냉난방 발주계약', counterparty: '에너지솔루션(주)', amount: 390000000, date: '2024-03-20', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2023-001 부산항 (COMPLETED)
  { id: 'CNT-2023-001', projectId: 'PRJ-2023-001', type: 'AWARD', name: '부산항 조명교체 수주계약', counterparty: '부산항만공사', amount: 600000000, date: '2022-12-15', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2023-001B', projectId: 'PRJ-2023-001', type: 'ORDER', name: '부산항 조명교체 발주계약', counterparty: '(주)한빛전기', amount: 440000000, date: '2023-01-10', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2023-002 KT 데이터센터 (LUMP_SUM)
  { id: 'CNT-2023-002', projectId: 'PRJ-2023-002', type: 'AWARD', name: 'KT IDC 냉각 최적화 수주계약', counterparty: 'KT(주)', amount: 2200000000, date: '2023-04-20', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2023-002B', projectId: 'PRJ-2023-002', type: 'ORDER', name: 'KT IDC 냉각 최적화 발주계약', counterparty: '(주)그린테크', amount: 1650000000, date: '2023-05-10', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2025-001 대전공장 (RECEPTION)
  { id: 'CNT-2025-001', projectId: 'PRJ-2025-001', type: 'AWARD', name: '대전공장 공조 최적화 수주계약', counterparty: '(주)대전산업', amount: 380000000, date: '2025-01-20', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2025-002 경기도청 (RECEPTION)
  { id: 'CNT-2025-002', projectId: 'PRJ-2025-002', type: 'AWARD', name: '경기도청 태양광 수주계약', counterparty: '경기도', amount: 1200000000, date: '2025-02-28', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2025-003 여수산단 (REPAYMENT)
  { id: 'CNT-2025-003', projectId: 'PRJ-2025-003', type: 'AWARD', name: '여수산단 압축공기 수주계약', counterparty: '여수산단관리공단', amount: 360000000, date: '2024-12-10', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2025-003B', projectId: 'PRJ-2025-003', type: 'ORDER', name: '여수산단 압축공기 발주계약', counterparty: '(주)대한컴프레서', amount: 280000000, date: '2024-12-20', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2024-006 창원 인버터 (CONSTRUCTION)
  { id: 'CNT-2024-007', projectId: 'PRJ-2024-006', type: 'AWARD', name: '창원공장 인버터교체 수주계약', counterparty: '(주)창원산업', amount: 430000000, date: '2024-12-05', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2024-007B', projectId: 'PRJ-2024-006', type: 'ORDER', name: '창원공장 인버터교체 발주계약', counterparty: '(주)한빛전기', amount: 310000000, date: '2024-12-15', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2024-007 안산공단 (LUMP_SUM)
  { id: 'CNT-2024-008', projectId: 'PRJ-2024-007', type: 'AWARD', name: '안산공단 공조절감 수주계약', counterparty: '(주)안산에너지', amount: 195000000, date: '2024-04-15', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2024-008B', projectId: 'PRJ-2024-007', type: 'ORDER', name: '안산공단 공조절감 발주계약', counterparty: '(주)그린테크', amount: 145000000, date: '2024-04-25', status: '계약체결', fileUrl: PDF },

  // ── PRJ-2022-001 포스코 (TERMINATED)
  { id: 'CNT-2022-001', projectId: 'PRJ-2022-001', type: 'AWARD', name: '포스코 열에너지 수주계약 (해지)', counterparty: '포스코(주)', amount: 3100000000, date: '2022-02-10', status: '계약해지', fileUrl: PDF },

  // ── PRJ-2021-001 삼성전자 (COMPLETED)
  { id: 'CNT-2021-001', projectId: 'PRJ-2021-001', type: 'AWARD', name: '삼성전자 공조 최적화 수주계약', counterparty: '삼성전자(주)', amount: 3800000000, date: '2021-01-15', status: '계약체결', fileUrl: PDF },
  { id: 'CNT-2021-001B', projectId: 'PRJ-2021-001', type: 'ORDER', name: '삼성전자 공조 최적화 발주계약', counterparty: '에너지솔루션(주)', amount: 2800000000, date: '2021-02-01', status: '계약체결', fileUrl: PDF },
];
