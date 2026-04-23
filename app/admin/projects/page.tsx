'use client';

import { useState } from 'react';
import DataTable from '@/components/common/DataTable';
import DrawerPanel from '@/components/common/DrawerPanel';
import ModalDialog from '@/components/common/ModalDialog';
import StatusBadge from '@/components/common/StatusBadge';
import { mockProjects } from '@/lib/mock-data/projects';
import { Project, ProjectStatus } from '@/types';
import { PROJECT_STATUS } from '@/lib/constants/status';
import { formatAmount, formatDate } from '@/lib/utils';

// 변경 이력 Mock (PRJ-2024-001 기준)
const mockHistory = [
  { id: 1, changedAt: '2025-01-10', changer: '김민준', fieldName: '착공일', before: '2024-03-01', after: '2024-05-01' },
  { id: 2, changedAt: '2025-01-10', changer: '김민준', fieldName: '준공일', before: '2027-02-28', after: '2027-06-30' },
  { id: 3, changedAt: '2024-12-15', changer: '오미래', fieldName: '사업비', before: '250,000,000', after: '265,000,000' },
  { id: 4, changedAt: '2024-08-20', changer: '이서연', fieldName: '담당자', before: '이서연', after: '김민준' },
  { id: 5, changedAt: '2024-02-15', changer: '시스템', fieldName: '상태', before: 'RECEPTION', after: 'REPAYMENT' },
];

// 첨부파일 Mock
const mockAttachments = [
  { id: 1, fileName: 'proposal-sample.pdf', fileType: 'PDF', size: '2.1 MB', uploadedAt: '2024-01-15', uploadedBy: '김민준' },
  { id: 2, fileName: 'evaluation-sample.pdf', fileType: 'PDF', size: '1.4 MB', uploadedAt: '2024-01-20', uploadedBy: '김민준' },
];

const STATUS_OPTIONS: ProjectStatus[] = ['RECEPTION', 'CONSTRUCTION', 'REPAYMENT', 'LUMP_SUM', 'TERMINATED', 'COMPLETED'];
const TYPE_OPTIONS = ['전체', '3자간', '용역'];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  // 검색 조건
  const [searchName, setSearchName] = useState('');
  const [searchEnergyUser, setSearchEnergyUser] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchType, setSearchType] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(mockProjects);

  // Drawer 상태
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'detail' | 'history'>('detail');
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');

  // 편집 필드
  const [editManager, setEditManager] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editProjectCost, setEditProjectCost] = useState<number>(0);

  // DocumentViewer Modal
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState('');

  // 삭제 확인 Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // 조회
  const handleSearch = () => {
    let result = projects;
    if (searchName) result = result.filter(p => p.name.includes(searchName));
    if (searchEnergyUser) result = result.filter(p => p.energyUser.includes(searchEnergyUser));
    if (searchStatus) result = result.filter(p => p.status === searchStatus);
    if (searchType && searchType !== '전체') result = result.filter(p => p.type === searchType);
    setFilteredProjects(result);
  };

  const handleReset = () => {
    setSearchName('');
    setSearchEnergyUser('');
    setSearchStatus('');
    setSearchType('');
    setFilteredProjects(projects);
  };

  // 행 클릭
  const handleRowClick = (project: Project) => {
    setSelectedProject(project);
    setDrawerTab('detail');
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  // 편집 시작
  const handleEditStart = () => {
    if (!selectedProject) return;
    setEditManager(selectedProject.manager);
    setEditStartDate(selectedProject.startDate);
    setEditEndDate(selectedProject.endDate);
    setEditProjectCost(selectedProject.projectCost);
    setDrawerMode('edit');
  };

  // 저장
  const handleEditSave = () => {
    if (!selectedProject) return;
    const updated = projects.map(p =>
      p.id === selectedProject.id
        ? { ...p, manager: editManager, startDate: editStartDate, endDate: editEndDate, projectCost: editProjectCost }
        : p
    );
    setProjects(updated);
    setFilteredProjects(updated);
    const updatedProject = updated.find(p => p.id === selectedProject.id)!;
    setSelectedProject(updatedProject);
    setDrawerMode('view');
  };

  // 삭제
  const handleDelete = () => {
    if (!selectedProject) return;
    const updated = projects.filter(p => p.id !== selectedProject.id);
    setProjects(updated);
    setFilteredProjects(updated);
    setDeleteModalOpen(false);
    setDrawerOpen(false);
    setSelectedProject(null);
  };

  const columns = [
    { key: 'no', header: 'No', align: 'center' as const, render: (_: Project, i: number) => i + 1 },
    { key: 'name', header: '프로젝트명', align: 'left' as const },
    { key: 'type', header: '유형', align: 'center' as const },
    { key: 'energyUser', header: '에너지사용자', align: 'left' as const },
    { key: 'manager', header: '담당자', align: 'center' as const },
    {
      key: 'status', header: '상태', align: 'center' as const,
      render: (p: Project) => <StatusBadge type="project" value={p.status} />,
    },
    {
      key: 'startDate', header: '착공일', align: 'center' as const,
      render: (p: Project) => formatDate(p.startDate),
    },
    {
      key: 'endDate', header: '준공일', align: 'center' as const,
      render: (p: Project) => formatDate(p.endDate),
    },
    {
      key: 'projectCost', header: '사업비', align: 'right' as const,
      render: (p: Project) => p.projectCost.toLocaleString('ko-KR'),
    },
  ];

  const historyColumns = [
    { key: 'changedAt', header: '변경일시', align: 'center' as const },
    { key: 'changer', header: '변경자', align: 'left' as const },
    { key: 'fieldName', header: '필드명', align: 'left' as const },
    { key: 'before', header: '변경 전', align: 'left' as const },
    { key: 'after', header: '변경 후', align: 'left' as const },
  ];

  return (
    <div className="content-wrap">
      <div className="content-title-wrap">
        <h2>프로젝트정보관리</h2>
      </div>

      {/* 조회조건 */}
      <div className="content-box-wrap">
        <div className="filter-row">
          <div className="filter-item">
            <label className="filter-label">프로젝트명</label>
            <input
              type="text"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              style={{ width: 160 }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="filter-item">
            <label className="filter-label">에너지사용자</label>
            <input
              type="text"
              value={searchEnergyUser}
              onChange={e => setSearchEnergyUser(e.target.value)}
              style={{ width: 140 }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="filter-item">
            <label className="filter-label">상태</label>
            <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} style={{ width: 110, height: 24 }}>
              <option value="">전체</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{PROJECT_STATUS[s].label}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">사업유형</label>
            <select value={searchType} onChange={e => setSearchType(e.target.value)} style={{ width: 90, height: 24 }}>
              {TYPE_OPTIONS.map(t => <option key={t} value={t === '전체' ? '' : t}>{t}</option>)}
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
          <h3>프로젝트 목록</h3>
        </div>
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={filteredProjects as unknown as Record<string, unknown>[]}
          onRowClick={(row) => handleRowClick(row as unknown as Project)}
        />
      </div>

      {/* DrawerPanel: 프로젝트 상세 */}
      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setDrawerMode('view'); }}
        title={selectedProject ? `${selectedProject.name} (${selectedProject.id})` : '프로젝트 상세'}
        width={640}
        footer={
          drawerMode === 'view' ? (
            <>
              <button className="btn type-03" onClick={handleEditStart}>편집</button>
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
        {selectedProject && (
          <div>
            {/* 탭 */}
            <div className="tab-list" style={{ marginBottom: '1rem' }}>
              <button
                className={`tab-btn ${drawerTab === 'detail' ? 'active' : ''}`}
                onClick={() => setDrawerTab('detail')}
              >
                상세
              </button>
              <button
                className={`tab-btn ${drawerTab === 'history' ? 'active' : ''}`}
                onClick={() => { setDrawerTab('history'); setDrawerMode('view'); }}
              >
                이력
              </button>
            </div>

            {/* 상세 탭 */}
            {drawerTab === 'detail' && (
              <div>
                {/* 상태 배지 */}
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <StatusBadge type="project" value={selectedProject.status} />
                  <span style={{ color: '#6c757d', fontSize: 12 }}>{selectedProject.type}</span>
                </div>

                {drawerMode === 'view' ? (
                  <div className="form-grid">
                    <span className="form-label">프로젝트명</span>
                    <span style={{ gridColumn: 'span 3' }}>{selectedProject.name}</span>
                    <span className="form-label">에너지사용자</span>
                    <span>{selectedProject.energyUser}</span>
                    <span className="form-label">담당자</span>
                    <span>{selectedProject.manager}</span>
                    <span className="form-label">사업유형</span>
                    <span>{selectedProject.type}</span>
                    <span className="form-label">상태</span>
                    <span>{PROJECT_STATUS[selectedProject.status]?.label}</span>
                    <span className="form-label">착공일</span>
                    <span>{formatDate(selectedProject.startDate)}</span>
                    <span className="form-label">준공일</span>
                    <span>{formatDate(selectedProject.endDate)}</span>
                    <span className="form-label">사업비</span>
                    <span>{selectedProject.projectCost.toLocaleString('ko-KR')} 원</span>
                    <span className="form-label">투자비</span>
                    <span>{selectedProject.investmentCost.toLocaleString('ko-KR')} 원</span>
                    <span className="form-label">계약금액</span>
                    <span>{selectedProject.contractAmount.toLocaleString('ko-KR')} 원</span>
                    <span className="form-label">상환진행률</span>
                    <span>{selectedProject.repaymentProgress}%</span>
                    <span className="form-label">등록일</span>
                    <span>{formatDate(selectedProject.createdAt)}</span>
                  </div>
                ) : (
                  <div className="form-grid">
                    <span className="form-label">프로젝트명</span>
                    <span style={{ gridColumn: 'span 3', color: '#6c757d' }}>{selectedProject.name} (수정불가)</span>
                    <span className="form-label">에너지사용자</span>
                    <span style={{ color: '#6c757d' }}>{selectedProject.energyUser} (수정불가)</span>
                    <span className="form-label">담당자</span>
                    <input
                      type="text"
                      value={editManager}
                      onChange={e => setEditManager(e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <span className="form-label">착공일</span>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={e => setEditStartDate(e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <span className="form-label">준공일</span>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={e => setEditEndDate(e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <span className="form-label">사업비</span>
                    <input
                      type="number"
                      value={editProjectCost}
                      onChange={e => setEditProjectCost(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}

                {/* 첨부파일 */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: '0.75rem', borderTop: '1px solid #dee2e6', paddingTop: '1rem' }}>
                    첨부파일
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>파일명</th>
                        <th>유형</th>
                        <th>크기</th>
                        <th>업로드일</th>
                        <th>업로드자</th>
                        <th>보기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAttachments.map(att => (
                        <tr key={att.id}>
                          <td
                            className="text-left"
                            style={{ cursor: 'pointer', color: '#00a9e0', textDecoration: 'underline' }}
                            onClick={() => { setViewerFile(att.fileName); setViewerOpen(true); }}
                          >
                            {att.fileName}
                          </td>
                          <td className="text-center">{att.fileType}</td>
                          <td className="text-center">{att.size}</td>
                          <td className="text-center">{att.uploadedAt}</td>
                          <td className="text-center">{att.uploadedBy}</td>
                          <td className="text-center">
                            <button
                              className="btn type-05"
                              onClick={() => { setViewerFile(att.fileName); setViewerOpen(true); }}
                            >
                              보기
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 이력 탭 */}
            {drawerTab === 'history' && (
              <div>
                <DataTable
                  columns={historyColumns as Parameters<typeof DataTable>[0]['columns']}
                  data={mockHistory as unknown as Record<string, unknown>[]}
                  emptyMessage="변경 이력이 없습니다."
                />
              </div>
            )}
          </div>
        )}
      </DrawerPanel>

      {/* 삭제 확인 Modal */}
      <ModalDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="프로젝트 삭제"
        size="sm"
        footer={
          <>
            <button className="btn" style={{ backgroundColor: '#dc3545' }} onClick={handleDelete}>삭제</button>
            <button className="btn type-02" onClick={() => setDeleteModalOpen(false)}>취소</button>
          </>
        }
      >
        <p style={{ textAlign: 'center', padding: '1rem 0' }}>
          삭제 후 복구 불가합니다.<br />삭제하시겠습니까?
        </p>
      </ModalDialog>

      {/* DocumentViewer Modal */}
      <ModalDialog
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={viewerFile}
        size="lg"
      >
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6c757d' }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>📄</div>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{viewerFile}</div>
          <div style={{ fontSize: 12 }}>PDF 뷰어가 이곳에 표시됩니다.</div>
        </div>
      </ModalDialog>
    </div>
  );
}
