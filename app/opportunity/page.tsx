'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import IntakeChart from '@/components/common/IntakeChart';
import DrawerPanel from '@/components/common/DrawerPanel';
import StatusBadge from '@/components/common/StatusBadge';
import DocumentViewer from '@/components/common/DocumentViewer';
import { mockOpportunities } from '@/lib/mock-data/opportunities';
import { Opportunity } from '@/types';
import { formatDate } from '@/lib/utils';

const INTAKE_STEPS = [
  { key: 'DRAFT',        label: '기회등록중' },
  { key: 'REVIEWING',    label: '검토중' },
  { key: 'APPROVED',     label: '승인완료' },
  { key: 'PO_REQUESTED', label: '발주요청완료' },
  { key: 'CONTRACTED',   label: '계약체결' },
];

// Drawer 상단 결재상태 배지 매핑 (설계서 SCR-P-03 기준)
const APPROVAL_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT:        { label: '등록중',      bg: '#e2e3e5', color: '#383d41' },
  REVIEWING:    { label: '검토중',      bg: '#fff3cd', color: '#856404' },
  APPROVED:     { label: '승인완료',    bg: '#d4edda', color: '#155724' },
  PO_REQUESTED: { label: '발주요청완료', bg: '#cff4fc', color: '#055160' },
  CONTRACTED:   { label: '계약체결',   bg: '#cfe2ff', color: '#084298' },
};

const YEARS = ['전체', '2023', '2024', '2025', '2026'];
const TYPES = ['전체', '3자간', '용역'];
const STATUS_OPTIONS = ['전체', 'DRAFT', 'REVIEWING', 'APPROVED', 'PO_REQUESTED', 'CONTRACTED'];

const MOCK_ATTACHMENTS = [
  { name: 'proposal-sample.pdf', url: '/sample-docs/proposal-sample.pdf', isPdf: true },
  { name: 'evaluation-sample.pdf', url: '/sample-docs/evaluation-sample.pdf', isPdf: true },
];

export default function OpportunityPage() {
  const router = useRouter();

  // 검색 필터 상태
  const [filterYear, setFilterYear] = useState('전체');
  const [filterType, setFilterType] = useState('전체');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [filterEnergyUser, setFilterEnergyUser] = useState('');
  const [activeIntakeKey, setActiveIntakeKey] = useState<string | undefined>(undefined);

  // Drawer 상태
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Edit 상태
  const [editName, setEditName] = useState('');
  const [editEnergyUser, setEditEnergyUser] = useState('');
  const [editManager, setEditManager] = useState('');

  // DocumentViewer 상태
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState({ name: '', url: '' });

  // 사업접수 카운트 계산
  const intakeSteps = useMemo(() => {
    return INTAKE_STEPS.map(s => ({
      ...s,
      count: mockOpportunities.filter(o => o.status === s.key).length,
    }));
  }, []);

  // 필터링된 데이터
  const filtered = useMemo(() => {
    return mockOpportunities.filter(o => {
      const yearOk = filterYear === '전체' || o.createdAt.startsWith(filterYear);
      const typeOk = filterType === '전체' || o.type === filterType;
      const statusOk = (filterStatus === '전체' && !activeIntakeKey)
        || (activeIntakeKey && o.status === activeIntakeKey)
        || (!activeIntakeKey && filterStatus !== '전체' && o.status === filterStatus);
      const euOk = !filterEnergyUser || o.energyUser.includes(filterEnergyUser);
      return yearOk && typeOk && statusOk && euOk;
    });
  }, [filterYear, filterType, filterStatus, filterEnergyUser, activeIntakeKey]);

  // 사업접수 카드 클릭
  const handleIntakeClick = (key: string) => {
    if (activeIntakeKey === key) {
      setActiveIntakeKey(undefined);
    } else {
      setActiveIntakeKey(key);
      setFilterStatus('전체');
    }
  };

  // 행 클릭 → Drawer
  const handleRowClick = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setIsEditMode(false);
    setIsDrawerOpen(true);
  };

  // Edit 모드 전환
  const handleEditMode = () => {
    if (!selectedOpp) return;
    setEditName(selectedOpp.name);
    setEditEnergyUser(selectedOpp.energyUser);
    setEditManager(selectedOpp.manager);
    setIsEditMode(true);
  };

  // 저장 (Mock)
  const handleSave = () => {
    setIsEditMode(false);
    alert('저장되었습니다. (Mock)');
  };

  // 취소
  const handleCancel = () => {
    setIsEditMode(false);
  };

  // 초기화
  const handleReset = () => {
    setFilterYear('전체');
    setFilterType('전체');
    setFilterStatus('전체');
    setFilterEnergyUser('');
    setActiveIntakeKey(undefined);
  };

  return (
    <div>
      <div className="breadcrumb-container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">홈</li>
          <li className="breadcrumb-item">사업 기회관리</li>
          <li className="breadcrumb-item active">사업접수 현황</li>
        </ol>
      </div>
    <div className="content-wrap">
      {/* 페이지 제목 */}
      <div className="content-title-wrap">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>사업 기회접수 현황</h2>
          <button className="btn" onClick={() => router.push('/opportunity/new')}>+ 사업접수 등록</button>
        </div>
      </div>

      {/* 사업접수 시각화 */}
      <div className="content-box-wrap type-02">
        <div className="title-row-wrap">
          <h3>단계별 현황</h3>
        </div>
        <IntakeChart
          steps={intakeSteps}
          activeKey={activeIntakeKey}
          onStepClick={handleIntakeClick}
        />
        {activeIntakeKey && (
          <div style={{ marginTop: '0.5rem', fontSize: '11px', color: '#6c757d' }}>
            클릭한 단계로 필터 적용 중 —{' '}
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00a7ea', fontSize: '11px' }}
              onClick={() => setActiveIntakeKey(undefined)}
            >
              전체 보기
            </button>
          </div>
        )}
      </div>

      {/* 검색 조건 */}
      <div className="content-box-wrap">
        <div className="form-grid" style={{ gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr auto 1fr' }}>
          <label className="form-label">접수년도</label>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ width: '100%' }}>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
          <label className="form-label">사업유형</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '100%' }}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <label className="form-label">상태</label>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setActiveIntakeKey(undefined); }} style={{ width: '100%' }}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <label className="form-label">에너지사용자명</label>
          <input
            type="text"
            value={filterEnergyUser}
            onChange={e => setFilterEnergyUser(e.target.value)}
            placeholder="업체명 검색"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn type-03" onClick={() => {}}>조회</button>
          <button className="btn type-02" onClick={handleReset}>초기화</button>
        </div>
      </div>

      {/* 목록 테이블 */}
      <div className="content-box-wrap type-02">
        <div className="title-row-wrap">
          <h3>기회 목록</h3>
          <span style={{ fontSize: '12px', color: '#6c757d' }}>총 {filtered.length}건</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>접수번호</th>
                <th style={{ textAlign: 'left' }}>사업명</th>
                <th style={{ textAlign: 'center' }}>유형</th>
                <th style={{ textAlign: 'left' }}>에너지사용자</th>
                <th style={{ textAlign: 'center' }}>담당자</th>
                <th style={{ textAlign: 'center' }}>상태</th>
                <th style={{ textAlign: 'center' }}>접수일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                    조건에 맞는 사업접수 건이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map(opp => (
                  <tr key={opp.id} onClick={() => handleRowClick(opp)}>
                    <td className="text-center">{opp.id}</td>
                    <td className="text-left">{opp.name}</td>
                    <td className="text-center">{opp.type}</td>
                    <td className="text-left">{opp.energyUser}</td>
                    <td className="text-center">{opp.manager}</td>
                    <td className="text-center">
                      <StatusBadge type="opportunity" value={opp.status} />
                    </td>
                    <td className="text-center">{formatDate(opp.createdAt)}</td>
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
        onClose={() => { setIsDrawerOpen(false); setIsEditMode(false); }}
        title={isEditMode ? '기회 수정' : '사업 기회 상세'}
        width={480}
        footer={
          isEditMode ? (
            <div className="button-wrap">
              <button className="btn" onClick={handleSave}>저장</button>
              <button className="btn type-02" onClick={handleCancel}>취소</button>
            </div>
          ) : (
            <div className="button-wrap">
              <button className="btn type-02" onClick={handleEditMode}>편집</button>
              <button
                className="btn"
                disabled={selectedOpp?.status !== 'APPROVED'}
                onClick={() => { if (selectedOpp) router.push(`/opportunity/new?step=5&id=${selectedOpp.id}`); }}
                style={{ opacity: selectedOpp?.status === 'APPROVED' ? 1 : 0.4 }}
              >
                발주요청 →
              </button>
            </div>
          )
        }
      >
        {selectedOpp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 결재상태 배지 — Drawer 상단 (설계서 SCR-P-03 기준) */}
            {(() => {
              const approvalStatus = APPROVAL_STATUS_MAP[selectedOpp.status] ?? { label: selectedOpp.status, bg: '#e2e3e5', color: '#383d41' };
              return (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  background: '#f8f9fa', borderRadius: '0.375rem',
                  borderLeft: `4px solid ${approvalStatus.bg === '#e2e3e5' ? '#adb5bd' : approvalStatus.bg}`,
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    background: approvalStatus.bg,
                    color: approvalStatus.color,
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '-0.01em',
                  }}>
                    {approvalStatus.label}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6c757d' }}>{selectedOpp.id}</span>
                </div>
              );
            })()}

            {/* 기본정보 */}
            <div className="content-box-wrap type-02" style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '12px' }}>기본정보</div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '90px', color: '#555', padding: '4px 0' }}>사업명</td>
                    <td>
                      {isEditMode
                        ? <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%' }} />
                        : selectedOpp.name}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '4px 0' }}>유형</td>
                    <td>{selectedOpp.type}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '4px 0' }}>에너지사용자</td>
                    <td>
                      {isEditMode
                        ? <input type="text" value={editEnergyUser} onChange={e => setEditEnergyUser(e.target.value)} style={{ width: '100%' }} />
                        : selectedOpp.energyUser}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '4px 0' }}>담당자</td>
                    <td>
                      {isEditMode
                        ? <input type="text" value={editManager} onChange={e => setEditManager(e.target.value)} style={{ width: '100%' }} />
                        : selectedOpp.manager}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '4px 0' }}>접수일</td>
                    <td>{formatDate(selectedOpp.createdAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 첨부파일 */}
            {!isEditMode && (
              <div className="content-box-wrap" style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '12px' }}>첨부파일</div>
                {MOCK_ATTACHMENTS.map(att => (
                  <div key={att.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ flex: 1, fontSize: '12px' }}>📄 {att.name}</span>
                    <button
                      className="btn type-05"
                      disabled={!att.isPdf}
                      onClick={() => { setViewerFile({ name: att.name, url: att.url }); setViewerOpen(true); }}
                    >
                      보기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DrawerPanel>

      {/* DocumentViewer */}
      <DocumentViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileName={viewerFile.name}
        fileUrl={viewerFile.url}
      />
    </div>
    </div>
  );
}
