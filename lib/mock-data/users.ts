import { User } from '@/types';

export const mockUsers: User[] = [
  { id: 'USR-001', name: '김민준', department: '사업개발팀', email: 'minjun.kim@kepcoes.co.kr', phone: '010-1234-5678', role: 'USER', status: 'ACTIVE', syncedFromGroupware: true },
  { id: 'USR-002', name: '이서연', department: '사업개발팀', email: 'seoyeon.lee@kepcoes.co.kr', phone: '010-2345-6789', role: 'USER', status: 'ACTIVE', syncedFromGroupware: true },
  { id: 'USR-003', name: '박지훈', department: '기술팀', email: 'jihun.park@kepcoes.co.kr', phone: '010-3456-7890', role: 'USER', status: 'ACTIVE', syncedFromGroupware: true },
  { id: 'USR-004', name: '최수빈', department: '재무팀', email: 'subin.choi@kepcoes.co.kr', phone: '010-4567-8901', role: 'USER', status: 'ACTIVE', syncedFromGroupware: false },
  { id: 'USR-005', name: '정다은', department: '계약팀', email: 'daeun.jung@kepcoes.co.kr', phone: '010-5678-9012', role: 'USER', status: 'ACTIVE', syncedFromGroupware: true },
  { id: 'USR-006', name: '한승우', department: 'IT팀', email: 'seungwoo.han@kepcoes.co.kr', phone: '010-6789-0123', role: 'ADMIN', status: 'ACTIVE', syncedFromGroupware: true },
  { id: 'USR-007', name: '오미래', department: '경영기획팀', email: 'mirae.oh@kepcoes.co.kr', phone: '010-7890-1234', role: 'ADMIN', status: 'INACTIVE', syncedFromGroupware: true },
];
