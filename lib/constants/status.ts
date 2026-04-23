export const PROJECT_STATUS = {
  RECEPTION:    { label: '접수',     bg: '#cfe2ff', text: '#084298' },
  CONSTRUCTION: { label: '공사',     bg: '#fff3cd', text: '#856404' },
  REPAYMENT:    { label: '상환중',   bg: '#d1e7dd', text: '#0a3622' },
  LUMP_SUM:     { label: '일시상환', bg: '#cff4fc', text: '#055160' },
  TERMINATED:   { label: '해지',     bg: '#f8d7da', text: '#721c24' },
  COMPLETED:    { label: '사업종료', bg: '#e2e3e5', text: '#383d41' },
} as const;

export const REPAYMENT_STATUS = {
  PLANNED:  { label: '예정',   bg: '#e2e3e5', text: '#383d41' },
  INVOICED: { label: '청구됨', bg: '#cfe2ff', text: '#084298' },
  REPAID:   { label: '완료',   bg: '#d1e7dd', text: '#0a3622' },
  UNPAID:   { label: '미납',   bg: '#f8d7da', text: '#721c24' },
} as const;

export const OPPORTUNITY_STATUS = {
  DRAFT:        { label: '임시저장',    bg: '#e2e3e5', text: '#383d41' },
  REVIEWING:    { label: '검토중',      bg: '#fff3cd', text: '#856404' },
  APPROVED:     { label: '승인완료',    bg: '#d4edda', text: '#155724' },
  PO_REQUESTED: { label: '발주요청완료', bg: '#cff4fc', text: '#055160' },
  CONTRACTED:   { label: '계약체결',   bg: '#cfe2ff', text: '#084298' },
} as const;

export const PIPELINE_STAGE_ORDER: string[] = [
  '발주요청접수', '공고중', '제안서접수중', '기술평가', '가격평가', '낙찰', '계약체결',
];

export const CP_REVISION_STATUS = {
  CONFIRMED:        { label: '확정',        bg: '#d4edda', text: '#155724' },
  DRAFT:            { label: '초안',        bg: '#fff3cd', text: '#856404' },
  PENDING_APPROVAL: { label: '결재진행중',  bg: '#cfe2ff', text: '#084298' },
} as const;

export const ALERT_LEVEL = {
  RED:    { label: 'RED',    bg: '#f8d7da', text: '#721c24' },
  ORANGE: { label: 'ORANGE', bg: '#fff3cd', text: '#856404' },
  YELLOW: { label: 'YELLOW', bg: '#fff9c4', text: '#856404' },
} as const;
