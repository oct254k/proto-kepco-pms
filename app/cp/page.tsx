'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DrawerPanel from '@/components/common/DrawerPanel';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { mockCPs, mockCPRevisions } from '@/lib/mock-data/cp';
import { CP } from '@/types';
import { formatDate, formatAmount } from '@/lib/utils';

const REVISION_OPTIONS = ['전체', '0차', '1차 이상'];
// 상태 옵션: mock 데이터의 status 값(ACTIVE/CLOSED/DRAFT)에 맞게 정의
const STATUS_OPTIONS = [
  { label: '전체',  value: '전체' },
  { label: 'DRAFT', value: 'DRAFT' },
  { label: '진행중', value: 'ACTIVE' },
  { label: '완료',  value: 'CLOSED' },
];

export default function CPListPage() {
  const router = useRouter();

  const [filterProject, setFilterProject] = useState('');
  const [filterEnergyUser, setFilterEnergyUser] = useState('');
  const [filterRevision, setFilterRevision] = useState('전체');
  const [filterStatus, setFilterStatus] = useState('전체');

  const [selectedCP, setSelectedCP] = useState<CP | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 필터
  const filtered = useMemo(() => {
    return mockCPs.filter(cp => {
      const projOk = !filterProject || cp.projectName.includes(filterProject);
      const euOk = !filterEnergyUser || cp.energyUser.includes(filterEnergyUser);
      const revOk = filterRevision === '전체'
        || (filterRevision === '0차' && cp.currentRevision === 0)
        || (filterRevision === '1차 이상' && cp.currentRevision >= 1);
      const statusOk = filterStatus === '전체' || cp.status === filterStatus;
      return projOk && euOk && revOk && statusOk;
    });
  }, [filterProject, filterEnergyUser, filterRevision, filterStatus]);

  const handleRowClick = (cp: CP) => {
    setSelectedCP(cp);
    setIsDrawerOpen(true);
  };

  const handleReset = () => {
    setFilterProject('');
    setFilterEnergyUser('');
    setFilterRevision('전체');
    setFilterStatus('전체');
  };

  // 선택된 CP의 차수 이력
  const selectedRevisions = useMemo(() => {
    if (!selectedCP) return [];
    return mockCPRevisions
      .filter(r => r.cpId === selectedCP.id)
      .sort((a, b) => a.revisionNumber - b.revisionNumber);
  }, [selectedCP]);

  // 현재 표시 차수: 확정(CONFIRMED) 중 가장 최신 차수
  const currentRevision = useMemo(() => {
    if (!selectedCP) return null;
    const confirmed = selectedRevisions.filter(r => r.status === 'CONFIRMED');
    return confirmed[confirmed.length - 1] ?? selectedRevisions[0] ?? null;
  }, [selectedCP, selectedRevisions]);

  // Drawer 헤더용 현재차수 레이블 계산
  const currentRevisionLabel = useMemo(() => {
    if (!selectedCP || selectedRevisions.length === 0) return '';
    const pendingRev = selectedRevisions.find(r => r.status === 'PENDING_APPROVAL');
    const draftRev   = selectedRevisions.find(r => r.status === 'DRAFT');
    if (pendingRev) return `${pendingRev.revisionNumber}차 (결재진행중)`;
    if (draftRev)   return `${draftRev.revisionNumber}차 (초안)`;
    return `${selectedCP.currentRevision}차 (확정)`;
  }, [selectedCP, selectedRevisions]);

  return (
    <div className="content-wrap">
      <Breadcrumb items={[{ label: 'CP/프로젝트 관리' }, { label: 'CP 관리' }]} />
      <div className="content-title-wrap">
        <h2>CP 목록</h2>
      </div>

      {/* 조회 조건 */}
      <div className="content-box-wrap">
        <div className="form-grid" style={{ gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr auto 1fr' }}>
          <label className="form-label">프로젝트명</label>
          <input type="text" value={filterProject} onChange={e => setFilterProject(e.target.value)} placeholder="프로젝트명 검색" style={{ width: '100%' }} />
          <label className="form-label">에너지사용자명</label>
          <input type="text" value={filterEnergyUser} onChange={e => setFilterEnergyUser(e.target.value)} placeholder="업체명 검색" style={{ width: '100%' }} />
          <label className="form-label">현재차수</label>
          <select value={filterRevision} onChange={e => setFilterRevision(e.target.value)} style={{ width: '100%' }}>
            {REVISION_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <label className="form-label">상태</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%' }}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn type-03" onClick={() => {}}>조회</button>
          <button className="btn type-02" onClick={handleReset}>초기화</button>
        </div>
      </div>

      {/* 목록 테이블 */}
      <div className="content-box-wrap type-02">
        <div className="title-row-wrap">
          <h3>CP 목록</h3>
          <span style={{ fontSize: '12px', color: '#6c757d' }}>총 {filtered.length}건</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th style={{ textAlign: 'left' }}>프로젝트명</th>
                <th style={{ textAlign: 'left' }}>에너지사용자</th>
                <th>현재차수</th>
                <th>최근변경일</th>
                <th style={{ textAlign: 'left' }}>변경사유요약</th>
                <th>다음계획변경예정일</th>
                <th>담당자</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                    조건에 맞는 CP가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((cp, idx) => (
                  <tr key={cp.id} onClick={() => handleRowClick(cp)}>
                    <td className="text-center">{idx + 1}</td>
                    <td className="text-left">
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00a7ea', fontSize: '12px', padding: 0 }}
                        onClick={e => { e.stopPropagation(); router.push('/cp/' + cp.id); }}
                      >
                        {cp.projectName}
                      </button>
                    </td>
                    <td className="text-left">{cp.energyUser}</td>
                    <td className="text-center">{cp.currentRevision}차</td>
                    <td className="text-center">{formatDate(cp.lastChangedAt)}</td>
                    <td className="text-left">{cp.changeSummary}</td>
                    <td className="text-center">{cp.nextPlannedChange ? formatDate(cp.nextPlannedChange) : '-'}</td>
                    <td className="text-center">{cp.manager}</td>
                    <td className="text-center">
                      <StatusBadge
                        type="custom"
                        value={cp.status}
                        customLabel={
                          cp.status === 'ACTIVE' ? '진행중' :
                          cp.status === 'DRAFT'  ? 'DRAFT'  :
                          cp.status === 'CLOSED' ? '완료'   : cp.status
                        }
                        customBg={
                          cp.status === 'ACTIVE' ? '#d1e7dd' :
                          cp.status === 'DRAFT'  ? '#fff3cd' :
                          cp.status === 'CLOSED' ? '#e2e3e5' : '#e2e3e5'
                        }
                        customText={
                          cp.status === 'ACTIVE' ? '#0a3622' :
                          cp.status === 'DRAFT'  ? '#856404' :
                          cp.status === 'CLOSED' ? '#383d41' : '#383d41'
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <DrawerPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="CP 미리보기"
        width={480}
        footer={
          <div className="button-wrap">
            <button className="btn type-03" onClick={() => { if (selectedCP) router.push('/cp/' + selectedCP.id); }}>
              CP 상세 →
            </button>
          </div>
        }
      >
        {selectedCP && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 헤더 */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{selectedCP.projectName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: '#555' }}>
                <span>현재차수: <strong>{currentRevisionLabel}</strong></span>
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                원계획수립일: {selectedRevisions[0] ? formatDate(selectedRevisions[0].confirmedAt ?? '') : '-'}
              </div>
            </div>

            {/* 현 차수 계획 요약 */}
            {currentRevision && (
              <div className="content-box-wrap type-02" style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '12px' }}>
                  현 차수 계획 요약 ({currentRevisionLabel})
                </div>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#555', padding: '3px 0', width: '80px' }}>착공일</td>
                      <td>{formatDate(currentRevision.startDate)}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#555', padding: '3px 0' }}>준공일</td>
                      <td>{formatDate(currentRevision.endDate)}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#555', padding: '3px 0' }}>총예산</td>
                      <td>{formatAmount(currentRevision.totalBudget)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 차수 이력 타임라인 */}
            <div className="content-box-wrap" style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '12px' }}>차수 이력 타임라인</div>
              {selectedRevisions.length === 0 ? (
                <div style={{ color: '#6c757d', fontSize: '12px' }}>차수 이력이 없습니다.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {selectedRevisions.map((rev, idx) => (
                    <div key={rev.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      {/* 타임라인 선 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                        <div style={{
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: rev.status === 'CONFIRMED' ? '#00a7ea' : rev.status === 'PENDING_APPROVAL' ? '#eff6ff' : '#f5f5f5',
                          border: rev.status === 'CONFIRMED' ? '2px solid #00a7ea' : rev.status === 'PENDING_APPROVAL' ? '2px dashed #0d6efd' : '2px dashed #adb5bd',
                          marginTop: '4px',
                        }} />
                        {idx < selectedRevisions.length - 1 && (
                          <div style={{ width: '2px', flex: 1, minHeight: '24px', background: '#dee2e6', margin: '2px 0' }} />
                        )}
                      </div>
                      {/* 내용 */}
                      <div style={{ flex: 1, paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 700, fontSize: '12px' }}>{rev.revisionNumber}차</span>
                          <StatusBadge type="cpRevision" value={rev.status} />
                        </div>
                        <div style={{ fontSize: '11px', color: '#555' }}>
                          확정일: {formatDate(rev.confirmedAt ?? '')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6c757d' }}>{rev.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DrawerPanel>
    </div>
  );
}
