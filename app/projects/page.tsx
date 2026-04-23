'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DrawerPanel from '@/components/common/DrawerPanel';
import StatusBadge from '@/components/common/StatusBadge';
import { mockProjects } from '@/lib/mock-data/projects';
import { formatAmount, formatAmountShort, formatDate, calcDday, formatDday } from '@/lib/utils';
import { Project } from '@/types';

type SortField = 'name' | 'energyUser' | 'status' | 'startDate' | 'endDate' | 'projectCost';
type SortDir = 'asc' | 'desc';

const INSURANCE_EXPIRY = '2026-12-31';

function getDdayBadge(dateStr: string) {
  if (!dateStr) return null;
  const d = calcDday(dateStr);
  if (d <= 7) return { color: '#dc3545', bg: '#f8d7da', text: `D-${d}` };
  if (d <= 30) return { color: '#856404', bg: '#fff3cd', text: `D-${d}` };
  return null;
}

export default function ProjectsPage() {
  const router = useRouter();

  // 필터 상태
  const [filterName, setFilterName] = useState('');
  const [filterEnergyUser, setFilterEnergyUser] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterManager, setFilterManager] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // 정렬 상태
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Drawer 상태
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 조회 조건 적용된 실제 필터 상태
  const [appliedFilter, setAppliedFilter] = useState({
    name: '', energyUser: '', type: '', status: '', manager: '', year: '',
  });

  const handleSearch = () => {
    setAppliedFilter({ name: filterName, energyUser: filterEnergyUser, type: filterType, status: filterStatus, manager: filterManager, year: filterYear });
  };

  const handleReset = () => {
    setFilterName(''); setFilterEnergyUser(''); setFilterType('');
    setFilterStatus(''); setFilterManager(''); setFilterYear('');
    setAppliedFilter({ name: '', energyUser: '', type: '', status: '', manager: '', year: '' });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return ' ↕';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  const filtered = useMemo(() => {
    let data = mockProjects.filter((p) => {
      if (appliedFilter.name && !p.name.includes(appliedFilter.name)) return false;
      if (appliedFilter.energyUser && !p.energyUser.includes(appliedFilter.energyUser)) return false;
      if (appliedFilter.type && p.type !== appliedFilter.type) return false;
      if (appliedFilter.status && p.status !== appliedFilter.status) return false;
      if (appliedFilter.manager && !p.manager.includes(appliedFilter.manager)) return false;
      if (appliedFilter.year && !p.createdAt.startsWith(appliedFilter.year)) return false;
      return true;
    });

    data = [...data].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (sortField === 'name') { valA = a.name; valB = b.name; }
      else if (sortField === 'energyUser') { valA = a.energyUser; valB = b.energyUser; }
      else if (sortField === 'status') { valA = a.status; valB = b.status; }
      else if (sortField === 'startDate') { valA = a.startDate || ''; valB = b.startDate || ''; }
      else if (sortField === 'endDate') { valA = a.endDate || ''; valB = b.endDate || ''; }
      else if (sortField === 'projectCost') { valA = a.projectCost; valB = b.projectCost; }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [appliedFilter, sortField, sortDir]);

  const handleRowClick = (p: Project) => {
    setSelectedProject(p);
    setDrawerOpen(true);
  };

  const insuranceDday = calcDday(INSURANCE_EXPIRY);

  return (
    <div>
      <div className="breadcrumb-container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">홈</li>
          <li className="breadcrumb-item">CP/프로젝트 관리</li>
          <li className="breadcrumb-item active">프로젝트 관리</li>
        </ol>
      </div>
      <div className="content-title-wrap">
        <h2>프로젝트 관리</h2>
      </div>

      <div className="content-wrap">
        {/* 조회조건 */}
        <div className="content-box-wrap">
          <div className="filter-row">
            <div className="filter-item">
              <label className="filter-label">프로젝트명</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="프로젝트명 검색"
                style={{ width: 160 }}
              />
            </div>
            <div className="filter-item">
              <label className="filter-label">에너지사용자</label>
              <input
                type="text"
                value={filterEnergyUser}
                onChange={(e) => setFilterEnergyUser(e.target.value)}
                placeholder="에너지사용자"
                style={{ width: 140 }}
              />
            </div>
            <div className="filter-item">
              <label className="filter-label">사업유형</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: 100 }}>
                <option value="">전체</option>
                <option value="3자간">3자간</option>
                <option value="용역">용역</option>
              </select>
            </div>
            <div className="filter-item">
              <label className="filter-label">프로젝트상태</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 110 }}>
                <option value="">전체</option>
                <option value="RECEPTION">접수</option>
                <option value="CONSTRUCTION">공사</option>
                <option value="REPAYMENT">상환중</option>
                <option value="LUMP_SUM">일시상환</option>
                <option value="TERMINATED">해지</option>
                <option value="COMPLETED">사업종료</option>
              </select>
            </div>
            <div className="filter-item">
              <label className="filter-label">담당자</label>
              <input
                type="text"
                value={filterManager}
                onChange={(e) => setFilterManager(e.target.value)}
                placeholder="담당자"
                style={{ width: 100 }}
              />
            </div>
            <div className="filter-item">
              <label className="filter-label">접수연도</label>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: 90 }}>
                <option value="">전체</option>
                {[2022, 2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={String(y)}>{y}년</option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button className="btn" onClick={handleSearch}>조회</button>
              <button className="btn type-02" onClick={handleReset}>초기화</button>
            </div>
          </div>
        </div>

        {/* 목록 */}
        <div className="content-box-wrap type-02">
          <div className="title-row-wrap">
            <h3>프로젝트 목록</h3>
            <div className="button-wrap">
              <span style={{ fontSize: '12px', color: '#6c757d' }}>총 {filtered.length}건</span>
              <button className="btn type-04">엑셀내보내기</button>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => handleSort('name')}
                  >프로젝트명{sortIcon('name')}</th>
                  <th>유형</th>
                  <th
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => handleSort('energyUser')}
                  >에너지사용자{sortIcon('energyUser')}</th>
                  <th>담당자</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>상태{sortIcon('status')}</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('startDate')}>착공일{sortIcon('startDate')}</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('endDate')}>준공일{sortIcon('endDate')}</th>
                  <th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('projectCost')}>사업비{sortIcon('projectCost')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                      조회 조건에 맞는 프로젝트가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => {
                    const badge = getDdayBadge(p.endDate);
                    return (
                      <tr key={p.id} onClick={() => handleRowClick(p)}>
                        <td className="text-center">{i + 1}</td>
                        <td className="text-left" style={{ color: '#00a7ea', fontWeight: '600' }}>{p.name}</td>
                        <td className="text-center">{p.type}</td>
                        <td className="text-left">{p.energyUser}</td>
                        <td className="text-center">{p.manager}</td>
                        <td className="text-center"><StatusBadge type="project" value={p.status} /></td>
                        <td className="text-center">{p.startDate ? formatDate(p.startDate) : '-'}</td>
                        <td className="text-center">
                          <span>{p.endDate ? formatDate(p.endDate) : '-'}</span>
                          {badge && (
                            <span style={{
                              marginLeft: '0.375rem', background: badge.bg, color: badge.color,
                              fontSize: '10px', padding: '1px 5px', borderRadius: '10px', fontWeight: '700',
                            }}>{badge.text}</span>
                          )}
                        </td>
                        <td className="text-right">{formatAmountShort(p.projectCost)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="프로젝트 현황"
        width={480}
        footer={
          <button
            className="btn type-03"
            onClick={() => { setDrawerOpen(false); router.push('/projects/' + selectedProject?.id); }}
          >
            상세관리 →
          </button>
        }
      >
        {selectedProject && (
          <div>
            {/* 프로젝트명 + 상태 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '11px', color: '#6c757d' }}>{selectedProject.id}</span>
                <StatusBadge type="project" value={selectedProject.status} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>{selectedProject.name}</div>
            </div>

            {/* 기본정보 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', fontSize: '12px', color: '#333', marginBottom: '0.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '0.25rem' }}>기본정보</div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['사업유형', selectedProject.type],
                    ['에너지사용자', selectedProject.energyUser],
                    ['담당자', selectedProject.manager],
                    ['착공일', selectedProject.startDate ? formatDate(selectedProject.startDate) : '-'],
                    ['준공일', selectedProject.endDate ? `${formatDate(selectedProject.endDate)} (${formatDday(selectedProject.endDate)})` : '-'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ color: '#6c757d', padding: '0.25rem 0', width: 100 }}>{label}</td>
                      <td style={{ fontWeight: '600', padding: '0.25rem 0' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 재무현황 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', fontSize: '12px', color: '#333', marginBottom: '0.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '0.25rem' }}>재무 현황</div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['총 사업비', formatAmount(selectedProject.projectCost)],
                    ['총 투자비', formatAmount(selectedProject.investmentCost)],
                    ['수주 금액', formatAmount(selectedProject.contractAmount)],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ color: '#6c757d', padding: '0.25rem 0', width: 100 }}>{label}</td>
                      <td style={{ fontWeight: '600', padding: '0.25rem 0', textAlign: 'right' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 상환 진행 Progress Bar */}
            {(selectedProject.status === 'REPAYMENT' || selectedProject.status === 'LUMP_SUM') && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', color: '#333', marginBottom: '0.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '0.25rem' }}>상환 진행</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6c757d', marginBottom: '0.25rem' }}>
                  <span>진행률</span>
                  <span style={{ fontWeight: '700', color: '#00a7ea' }}>{selectedProject.repaymentProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${selectedProject.repaymentProgress}%` }} />
                </div>
              </div>
            )}

            {/* 보험증권 만료 */}
            <div>
              <div style={{ fontWeight: '700', fontSize: '12px', color: '#333', marginBottom: '0.5rem', borderBottom: '1px solid #dee2e6', paddingBottom: '0.25rem' }}>보험증권 만료</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#6c757d' }}>지정약정</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {INSURANCE_EXPIRY}
                  {insuranceDday <= 30 && (
                    <span style={{
                      background: insuranceDday <= 7 ? '#f8d7da' : '#fff3cd',
                      color: insuranceDday <= 7 ? '#721c24' : '#856404',
                      fontSize: '10px', padding: '1px 5px', borderRadius: '10px', fontWeight: '700',
                    }}>
                      {formatDday(INSURANCE_EXPIRY)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </DrawerPanel>
    </div>
  );
}
