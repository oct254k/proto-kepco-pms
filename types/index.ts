// 프로젝트 상태
export type ProjectStatus = 'RECEPTION' | 'CONSTRUCTION' | 'REPAYMENT' | 'LUMP_SUM' | 'TERMINATED' | 'COMPLETED';

// 사업 유형
export type ProjectType = '3자간' | '용역';

// 상환 상태
export type RepaymentStatus = 'PLANNED' | 'INVOICED' | 'REPAID' | 'UNPAID';

// 기회 상태
export type OpportunityStatus = 'DRAFT' | 'REVIEWING' | 'APPROVED' | 'PO_REQUESTED' | 'CONTRACTED';

// Pipeline 단계
export type PipelineStage = '발주요청접수' | '공고중' | '제안서접수중' | '기술평가' | '가격평가' | '낙찰' | '계약체결';

// CP 차수 상태
export type CPRevisionStatus = 'CONFIRMED' | 'DRAFT' | 'PENDING_APPROVAL';

// 프로젝트
export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  energyUser: string;
  manager: string;
  startDate: string;
  endDate: string;
  projectCost: number;
  investmentCost: number;
  contractAmount: number;
  repaymentProgress: number;
  description?: string;
  createdAt: string;
}

// 계약
export interface Contract {
  id: string;
  projectId: string;
  type: 'ORDER' | 'AWARD';
  name: string;
  counterparty: string;
  amount: number;
  date: string;
  status: string;
  fileUrl?: string;
}

// 상환 스케줄
export interface Repayment {
  id: string;
  projectId: string;
  round: number;
  billingDate: string;
  billingAmount: number;
  repaidAmount: number;
  status: RepaymentStatus;
}

// 세금계산서
export interface Invoice {
  id: string;
  projectId: string;
  issueDate: string;
  supplyAmount: number;
  taxAmount: number;
  round: number;
  status: string;
}

// 투자비
export interface Investment {
  id: string;
  projectId: string;
  category: string;
  planAmount: number;
  actualAmount: number;
  payDate: string;
  status: string;
}

// 미회수
export interface Uncollected {
  id: string;
  projectId: string;
  round: number;
  billingDate: string;
  amount: number;
  elapsedDays: number;
  alertLevel: 'RED' | 'ORANGE' | 'YELLOW';
}

// 사용자
export interface User {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  syncedFromGroupware: boolean;
}

// 기회
export interface Opportunity {
  id: string;
  name: string;
  type: ProjectType;
  energyUser: string;
  manager: string;
  status: OpportunityStatus;
  createdAt: string;
  description?: string;
}

// Pipeline 카드
export interface PipelineCard {
  id: string;
  opportunityId: string;
  name: string;
  type: ProjectType;
  stage: PipelineStage;
  expectedAmount: number;
  procurementMethod: string;
  manager: string;
  deadline: string;
  epcCompany?: string;
}

// CP
export interface CP {
  id: string;
  projectId: string;
  projectName: string;
  energyUser: string;
  manager: string;
  currentRevision: number;
  lastChangedAt: string;
  changeSummary: string;
  nextPlannedChange?: string;
  status: string;
}

// CP 차수
export interface CPRevision {
  id: string;
  cpId: string;
  revisionNumber: number;
  confirmedAt?: string;
  reason: string;
  status: CPRevisionStatus;
  startDate: string;
  endDate: string;
  totalBudget: number;
}

// 협력업체
export interface Contractor {
  id: string;
  name: string;
  businessNo: string;
  representative: string;
  address: string;
  creditGrade: string;
  settlementDate: string;
  validUntil: string;
  registeredAt: string;
}

// 대시보드 KPI
export interface DashboardKpi {
  year: number;
  projectCost: { target: number; actual: number };
  investmentCost: { target: number; actual: number };
  eersSaving: { target: number; actual: number };
  irr: { planned: number; actual: number };
  fundRecovery: {
    rate: number;
    billed: number;
    recovered: number;
    uncollected: number;
  };
  uncollectedAlerts: { red: number; orange: number; yellow: number };
  monthlyTrend: { month: string; billed: number; recovered: number }[];
}

// 수정 요청
export interface DataEditRequest {
  id: string;
  requester: string;
  projectId: string;
  projectName: string;
  content: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
}
