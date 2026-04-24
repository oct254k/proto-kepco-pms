export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  children?: MenuItem[];
}

export const menuTree: MenuItem[] = [
  {
    id: 'business',
    label: '사업관리',
    children: [
      { id: 'dashboard', label: '대시보드', href: '/dashboard' },
    ],
  },
  {
    id: 'opportunity',
    label: '사업 기회관리',
    children: [
      { id: 'opportunity-list', label: '사업접수 현황', href: '/opportunity' },
      { id: 'opportunity-new', label: '사업접수 등록', href: '/opportunity/new' },
      { id: 'pipeline', label: '입찰현황', href: '/pipeline' },
    ],
  },
  {
    id: 'cp-project',
    label: '투자/프로젝트 관리',
    children: [
      { id: 'cp', label: '투자 관리', href: '/cp' },
      { id: 'projects', label: '프로젝트 관리', href: '/projects' },
    ],
  },
  {
    id: 'finance',
    label: '재무관리',
    children: [
      { id: 'contracts', label: '계약 통합조회', href: '/contracts' },
      { id: 'settlement', label: '사업결산·IRR', href: '/settlement' },
    ],
  },
  {
    id: 'personal',
    label: '개인',
    children: [
      { id: 'mypage', label: '마이페이지', href: '/mypage' },
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
