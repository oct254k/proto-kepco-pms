export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  children?: MenuItem[];
}

export const menuTree: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    children: [
      { id: 'dashboard-main', label: '경영실적', href: '/dashboard' },
      { id: 'cashflow', label: '자금회수율', href: '/cashflow' },
    ],
  },
  {
    id: 'reception',
    label: '사업접수',
    children: [
      { id: 'opportunity-new', label: '신규프로젝트 생성', href: '/opportunity/new' },
      { id: 'pipeline', label: '사업접수 현황', href: '/pipeline' },
    ],
  },
  {
    id: 'project-mgmt',
    label: '프로젝트 관리',
    children: [
      { id: 'projects', label: '프로젝트별 진행 정보', href: '/projects' },
    ],
  },
  {
    id: 'contracts',
    label: '계약',
    children: [
      { id: 'contracts-award', label: '수주계약현황', href: '/contracts?tab=award' },
      { id: 'contracts-order', label: '발주계약현황', href: '/contracts?tab=order' },
    ],
  },
  {
    id: 'funds',
    label: '자금관리',
    children: [
      { id: 'funds-investment', label: '투자비 지급현황', href: '/funds/investment' },
      { id: 'funds-tax-invoice', label: '세금계산서 발행회차', href: '/funds/tax-invoice' },
      { id: 'funds-repayment', label: '상환현황', href: '/funds/repayment' },
      { id: 'funds-uncollected', label: '미회수 사업현황', href: '/funds/uncollected' },
    ],
  },
  {
    id: 'settlement',
    label: '사업결산',
    children: [
      { id: 'settlement-main', label: '사업결산현황', href: '/settlement' },
    ],
  },
  {
    id: 'mypage',
    label: '마이페이지',
    children: [
      { id: 'mypage-projects', label: '나의 사업현황', href: '/mypage?tab=projects' },
      { id: 'mypage-profile', label: '사용자정보 변경', href: '/mypage?tab=profile' },
      { id: 'mypage-request', label: '데이터수정 요청', href: '/mypage?tab=request' },
    ],
  },
  {
    id: 'admin',
    label: '관리자',
    children: [
      { id: 'admin-users', label: '사용자 관리', href: '/admin/users' },
      { id: 'admin-projects', label: '프로젝트 정보관리', href: '/admin/projects' },
      { id: 'admin-targets', label: '경영실적 목표', href: '/admin/targets' },
      { id: 'admin-contractors', label: '협력업체·신용평가', href: '/admin/contractors' },
      { id: 'admin-system', label: '시스템 환경', href: '/admin/system' },
    ],
  },
];
