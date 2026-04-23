'use client';

import { useState } from 'react';
import DataTable from '@/components/common/DataTable';
import DrawerPanel from '@/components/common/DrawerPanel';
import ModalDialog from '@/components/common/ModalDialog';
import StatusBadge from '@/components/common/StatusBadge';
import { mockUsers } from '@/lib/mock-data/users';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';

// 그룹웨어 연동 Mock 데이터
const gwSyncData = [
  { id: 1, name: '김민준', department: '사업개발팀', changeType: '신규', changeTypeBg: '#d4edda', changeTypeText: '#155724', changedAt: '2025-01-15', status: '동기화완료' },
  { id: 2, name: '이서연', department: '사업개발팀', changeType: '정보변경', changeTypeBg: '#fff3cd', changeTypeText: '#856404', changedAt: '2025-02-10', status: '동기화완료' },
  { id: 3, name: '박지훈', department: '기술팀', changeType: '신규', changeTypeBg: '#d4edda', changeTypeText: '#155724', changedAt: '2025-03-01', status: '동기화완료' },
  { id: 4, name: '오미래', department: '경영기획팀', changeType: '퇴직', changeTypeBg: '#f8d7da', changeTypeText: '#721c24', changedAt: '2025-03-20', status: '비활성처리완료' },
  { id: 5, name: '신동현', department: 'IT팀', changeType: '신규', changeTypeBg: '#d4edda', changeTypeText: '#155724', changedAt: '2025-04-01', status: '동기화대기' },
];

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'pms' | 'gw'>('pms');
  const [users, setUsers] = useState<User[]>(mockUsers);

  // 검색 조건
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);

  // Drawer 상태
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');
  const [editDept, setEditDept] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'USER' | 'ADMIN'>('USER');

  // 신규 등록 Modal
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');

  // 삭제 확인 Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // 조회
  const handleSearch = () => {
    let result = users;
    if (searchName) result = result.filter(u => u.name.includes(searchName));
    if (searchDept) result = result.filter(u => u.department.includes(searchDept));
    if (searchRole) result = result.filter(u => u.role === searchRole);
    if (searchStatus) result = result.filter(u => u.status === searchStatus);
    setFilteredUsers(result);
  };

  const handleReset = () => {
    setSearchName('');
    setSearchDept('');
    setSearchRole('');
    setSearchStatus('');
    setFilteredUsers(users);
  };

  // 행 클릭
  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  // 편집 시작
  const handleEditStart = () => {
    if (!selectedUser) return;
    setEditDept(selectedUser.department);
    setEditPhone(selectedUser.phone);
    setEditRole(selectedUser.role);
    setDrawerMode('edit');
  };

  // 저장
  const handleEditSave = () => {
    if (!selectedUser) return;
    const updated = users.map(u =>
      u.id === selectedUser.id
        ? { ...u, department: editDept, phone: editPhone, role: editRole }
        : u
    );
    setUsers(updated);
    setFilteredUsers(updated);
    const updatedUser = updated.find(u => u.id === selectedUser.id)!;
    setSelectedUser(updatedUser);
    setDrawerMode('view');
  };

  // 상태 변경 (활성화/비활성화)
  const handleToggleStatus = () => {
    if (!selectedUser) return;
    const newStatus: 'ACTIVE' | 'INACTIVE' = selectedUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated: User[] = users.map(u =>
      u.id === selectedUser.id ? { ...u, status: newStatus } : u
    );
    setUsers(updated);
    setFilteredUsers(updated);
    setSelectedUser({ ...selectedUser, status: newStatus });
  };

  // 삭제
  const handleDelete = () => {
    if (!selectedUser) return;
    const updated = users.filter(u => u.id !== selectedUser.id);
    setUsers(updated);
    setFilteredUsers(updated);
    setDeleteModalOpen(false);
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  // 신규 등록
  const handleRegister = () => {
    if (!newName || !newDept || !newEmail) return;
    const newUser: User = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      name: newName,
      department: newDept,
      email: newEmail,
      phone: newPhone,
      role: newRole,
      status: 'ACTIVE',
      syncedFromGroupware: false,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    setFilteredUsers(updated);
    setRegisterModalOpen(false);
    setNewName(''); setNewDept(''); setNewEmail(''); setNewPhone(''); setNewRole('USER');
  };

  const columns = [
    { key: 'no', header: 'No', align: 'center' as const, render: (_: User, i: number) => i + 1 },
    { key: 'name', header: '이름', align: 'left' as const },
    { key: 'department', header: '부서', align: 'left' as const },
    { key: 'email', header: '이메일', align: 'left' as const },
    { key: 'phone', header: '연락처', align: 'center' as const },
    {
      key: 'role', header: '권한', align: 'center' as const,
      render: (u: User) => (
        <StatusBadge
          type="custom"
          value={u.role}
          customLabel={u.role === 'ADMIN' ? 'ADMIN' : 'USER'}
          customBg={u.role === 'ADMIN' ? '#cfe2ff' : '#e2e3e5'}
          customText={u.role === 'ADMIN' ? '#084298' : '#383d41'}
        />
      ),
    },
    {
      key: 'status', header: '상태', align: 'center' as const,
      render: (u: User) => (
        <StatusBadge
          type="custom"
          value={u.status}
          customLabel={u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
          customBg={u.status === 'ACTIVE' ? '#d4edda' : '#f8d7da'}
          customText={u.status === 'ACTIVE' ? '#155724' : '#721c24'}
        />
      ),
    },
    { key: 'createdAt', header: '등록일', align: 'center' as const, render: () => '2024-01-01' },
  ];

  const gwColumns = [
    { key: 'name', header: '이름', align: 'left' as const },
    { key: 'department', header: '부서', align: 'left' as const },
    {
      key: 'changeType', header: '변경유형', align: 'center' as const,
      render: (row: typeof gwSyncData[0]) => (
        <StatusBadge
          type="custom"
          value={row.changeType}
          customLabel={row.changeType}
          customBg={row.changeTypeBg}
          customText={row.changeTypeText}
        />
      ),
    },
    { key: 'changedAt', header: '변경일시', align: 'center' as const },
    { key: 'status', header: '처리상태', align: 'center' as const },
  ];

  return (
    <div className="content-wrap">
      <div className="content-title-wrap">
        <h2>사용자관리</h2>
      </div>

      {/* 탭 */}
      <div className="tab-list">
        <button className={`tab-btn ${activeTab === 'pms' ? 'active' : ''}`} onClick={() => setActiveTab('pms')}>
          PMS 사용자
        </button>
        <button className={`tab-btn ${activeTab === 'gw' ? 'active' : ''}`} onClick={() => setActiveTab('gw')}>
          그룹웨어 연동
        </button>
      </div>

      {/* PMS 사용자 탭 */}
      {activeTab === 'pms' && (
        <>
          {/* 조회조건 */}
          <div className="content-box-wrap">
            <div className="filter-row">
              <div className="filter-item">
                <label className="filter-label">이름</label>
                <input
                  type="text"
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  style={{ width: 120 }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="filter-item">
                <label className="filter-label">부서</label>
                <input
                  type="text"
                  value={searchDept}
                  onChange={e => setSearchDept(e.target.value)}
                  style={{ width: 120 }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="filter-item">
                <label className="filter-label">권한</label>
                <select value={searchRole} onChange={e => setSearchRole(e.target.value)} style={{ width: 100, height: 24 }}>
                  <option value="">전체</option>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="filter-item">
                <label className="filter-label">상태</label>
                <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} style={{ width: 100, height: 24 }}>
                  <option value="">전체</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="filter-actions">
                <button className="btn" onClick={handleSearch}>조회</button>
                <button className="btn type-02" onClick={handleReset}>초기화</button>
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>사용자 목록</h3>
              <button className="btn type-03" onClick={() => setRegisterModalOpen(true)}>신규 등록</button>
            </div>
            <DataTable
              columns={columns as Parameters<typeof DataTable>[0]['columns']}
              data={filteredUsers as unknown as Record<string, unknown>[]}
              onRowClick={(row) => handleRowClick(row as unknown as User)}
            />
          </div>
        </>
      )}

      {/* 그룹웨어 연동 탭 */}
      {activeTab === 'gw' && (
        <div className="content-box-wrap type-02">
          <div className="title-row-wrap">
            <h3>그룹웨어 조직 동기화 현황</h3>
          </div>
          <DataTable
            columns={gwColumns as Parameters<typeof DataTable>[0]['columns']}
            data={gwSyncData as unknown as Record<string, unknown>[]}
          />
        </div>
      )}

      {/* DrawerPanel: 사용자 상세 */}
      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setDrawerMode('view'); }}
        title="사용자 상세"
        width={480}
        footer={
          drawerMode === 'view' ? (
            <>
              <button className="btn type-03" onClick={handleEditStart}>편집</button>
              <button
                className="btn type-02"
                onClick={handleToggleStatus}
              >
                {selectedUser?.status === 'ACTIVE' ? '비활성화' : '활성화'}
              </button>
              <button className="btn" style={{ backgroundColor: '#dc3545' }} onClick={() => setDeleteModalOpen(true)}>삭제</button>
            </>
          ) : (
            <>
              <button className="btn type-03" onClick={handleEditSave}>저장</button>
              <button className="btn type-02" onClick={() => setDrawerMode('view')}>취소</button>
            </>
          )
        }
      >
        {selectedUser && (
          <div>
            {/* 헤더 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{selectedUser.name}</span>
                <StatusBadge
                  type="custom"
                  value={selectedUser.role}
                  customLabel={selectedUser.role}
                  customBg={selectedUser.role === 'ADMIN' ? '#cfe2ff' : '#e2e3e5'}
                  customText={selectedUser.role === 'ADMIN' ? '#084298' : '#383d41'}
                />
                <StatusBadge
                  type="custom"
                  value={selectedUser.status}
                  customLabel={selectedUser.status}
                  customBg={selectedUser.status === 'ACTIVE' ? '#d4edda' : '#f8d7da'}
                  customText={selectedUser.status === 'ACTIVE' ? '#155724' : '#721c24'}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
              {drawerMode === 'view' ? (
                <div className="form-grid">
                  <span className="form-label">부서</span>
                  <span>{selectedUser.department}</span>
                  <span className="form-label">이메일</span>
                  <span>{selectedUser.email}</span>
                  <span className="form-label">연락처</span>
                  <span>{selectedUser.phone}</span>
                  <span className="form-label">권한</span>
                  <span>{selectedUser.role}</span>
                  <span className="form-label">상태</span>
                  <span>{selectedUser.status}</span>
                  <span className="form-label">GW 동기화</span>
                  <span>{selectedUser.syncedFromGroupware ? '연동됨' : '미연동'}</span>
                </div>
              ) : (
                <div className="form-grid">
                  <span className="form-label">부서</span>
                  <input
                    type="text"
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <span className="form-label">이메일</span>
                  <span style={{ color: '#6c757d' }}>{selectedUser.email} (수정불가)</span>
                  <span className="form-label">연락처</span>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <span className="form-label">권한</span>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="editRole"
                        value="USER"
                        checked={editRole === 'USER'}
                        onChange={() => setEditRole('USER')}
                      />
                      USER
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="editRole"
                        value="ADMIN"
                        checked={editRole === 'ADMIN'}
                        onChange={() => setEditRole('ADMIN')}
                      />
                      ADMIN
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DrawerPanel>

      {/* 신규 등록 Modal */}
      <ModalDialog
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="사용자 등록"
        footer={
          <>
            <button className="btn type-03" onClick={handleRegister}>등록</button>
            <button className="btn type-02" onClick={() => setRegisterModalOpen(false)}>취소</button>
          </>
        }
      >
        <div className="form-grid">
          <label className="form-label required">이름</label>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%' }} />
          <label className="form-label required">부서</label>
          <input type="text" value={newDept} onChange={e => setNewDept(e.target.value)} style={{ width: '100%' }} />
          <label className="form-label required">이메일</label>
          <input type="text" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ width: '100%' }} />
          <label className="form-label">연락처</label>
          <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={{ width: '100%' }} />
          <label className="form-label">권한</label>
          <select value={newRole} onChange={e => setNewRole(e.target.value as 'USER' | 'ADMIN')} style={{ width: '100%', height: 24 }}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </ModalDialog>

      {/* 삭제 확인 Modal */}
      <ModalDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="사용자 삭제"
        size="sm"
        footer={
          <>
            <button className="btn" style={{ backgroundColor: '#dc3545' }} onClick={handleDelete}>삭제</button>
            <button className="btn type-02" onClick={() => setDeleteModalOpen(false)}>취소</button>
          </>
        }
      >
        <p style={{ textAlign: 'center', padding: '1rem 0' }}>
          <strong>{selectedUser?.name}</strong> 사용자를 삭제하시겠습니까?<br />
          <span style={{ color: '#dc3545', fontSize: 11, marginTop: 4, display: 'block' }}>삭제 후 복구할 수 없습니다.</span>
        </p>
      </ModalDialog>
    </div>
  );
}
