/** 피그마 기준: 상태 칩 배경은 통일, 글자색만 단계·의미에 따라 주황 계열로 구분 */

const CHIP_BG = '#fff0e6';

export const PROJECT_STATUS = {
  RECEPTION:    { label: '접수',     bg: CHIP_BG, text: '#78716f' },
  CONSTRUCTION: { label: '공사',     bg: CHIP_BG, text: '#fb923c' },
  REPAYMENT:    { label: '상환중',   bg: CHIP_BG, text: '#ea580c' },
  LUMP_SUM:     { label: '일시상환', bg: CHIP_BG, text: '#c2410c' },
  TERMINATED:   { label: '해지',     bg: CHIP_BG, text: '#7c2d12' },
  COMPLETED:    { label: '사업종료', bg: CHIP_BG, text: '#9a3412' },
} as const;

export const REPAYMENT_STATUS = {
  PLANNED:  { label: '예정',   bg: CHIP_BG, text: '#78716f' },
  INVOICED: { label: '청구됨', bg: CHIP_BG, text: '#fb923c' },
  REPAID:   { label: '완료',   bg: CHIP_BG, text: '#c2410c' },
  UNPAID:   { label: '미납',   bg: CHIP_BG, text: '#7c2d12' },
} as const;

export const OPPORTUNITY_STATUS = {
  DRAFT:        { label: '임시저장',    bg: CHIP_BG, text: '#78716f' },
  REVIEWING:    { label: '검토중',      bg: CHIP_BG, text: '#fb923c' },
  APPROVED:     { label: '승인완료',    bg: CHIP_BG, text: '#ea580c' },
  PO_REQUESTED: { label: '발주요청완료', bg: CHIP_BG, text: '#c2410c' },
  CONTRACTED:   { label: '계약체결',   bg: CHIP_BG, text: '#9a3412' },
} as const;

export const BID_STAGE_ORDER: string[] = [
  '발주요청접수', '공고중', '제안서접수중', '기술평가', '가격평가', '낙찰', '계약체결',
];

export const CP_INVESTMENT_REVISION_STATUS = {
  CONFIRMED:        { label: '확정',       bg: CHIP_BG, text: '#c2410c' },
  DRAFT:            { label: '초안',       bg: CHIP_BG, text: '#fb923c' },
  PENDING_APPROVAL: { label: '결재진행중', bg: CHIP_BG, text: '#ea580c' },
} as const;

export const ALERT_LEVEL = {
  YELLOW: { label: 'YELLOW', bg: CHIP_BG, text: '#fb923c' },
  ORANGE: { label: 'ORANGE', bg: CHIP_BG, text: '#ea580c' },
  RED:    { label: 'RED',    bg: CHIP_BG, text: '#7c2d12' },
} as const;
