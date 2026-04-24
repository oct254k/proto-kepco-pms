'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ModalDialog from '@/components/common/ModalDialog';
import StatusBadge from '@/components/common/StatusBadge';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { mockCpInvestments, mockCpInvestmentRevisions } from '@/lib/mock-data/cp';
import { CpInvestmentRevision } from '@/types';
import { formatDate } from '@/lib/utils';

// Mock WBS 일정 데이터
const MOCK_SCHEDULE = [
  { code: '1.0', name: '설계', start: '2024-03-01', end: '2024-06-30', duration: '4M', progress: 100 },
  { code: '1.1', name: '구매', start: '2024-07-01', end: '2024-09-30', duration: '3M', progress: 100 },
  { code: '1.2', name: '시공', start: '2024-10-01', end: '2026-03-31', duration: '18M', progress: 42 },
  { code: '1.3', name: '시운전', start: '2026-04-01', end: '2026-09-30', duration: '6M', progress: 0 },
  { code: '1.4', name: '준공', start: '2026-10-01', end: '2027-02-28', duration: '5M', progress: 0 },
];

// Mock 예산 데이터
const MOCK_BUDGET = [
  { code: '1.0', name: '설계비', planned: 15000000, actual: 14800000, balance: 200000, note: '설계 완료' },
  { code: '1.1', name: '구매비', planned: 80000000, actual: 78500000, balance: 1500000, note: '구매 완료' },
  { code: '1.2', name: '시공비', planned: 120000000, actual: 52000000, balance: 68000000, note: '진행중' },
  { code: '1.3', name: '시운전비', planned: 25000000, actual: 0, balance: 25000000, note: '' },
  { code: '1.4', name: '준공비', planned: 10000000, actual: 0, balance: 10000000, note: '' },
];

// Mock 물량 데이터
const MOCK_QUANTITY = [
  { name: 'LED 조명', unit: '세트', qty: 500, unitPrice: 150000, total: 75000000 },
  { name: '분전반', unit: '대', qty: 10, unitPrice: 2000000, total: 20000000 },
  { name: 'BEMS 서버', unit: '식', qty: 1, unitPrice: 50000000, total: 50000000 },
  { name: '배선자재', unit: 'M', qty: 5000, unitPrice: 10000, total: 50000000 },
  { name: '설치공사', unit: '식', qty: 1, unitPrice: 55000000, total: 55000000 },
];

export default function CpInvestmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const cp = useMemo(() => mockCpInvestments.find(c => c.id === id), [id]);
  const [revisions, setRevisions] = useState<CpInvestmentRevision[]>(() =>
    mockCpInvestmentRevisions.filter(r => r.cpId === id).sort((a, b) => a.revisionNumber - b.revisionNumber)
  );

  const [selectedRevNo, setSelectedRevNo] = useState<number>(() => {
    const cpData = mockCpInvestments.find(c => c.id === id);
    return cpData?.currentRevision ?? 0;
  });

  const [activeTab, setActiveTab] = useState<'schedule' | 'budget' | 'quantity'>('schedule');

  // 차수 UP Modal
  const [isRevUpModalOpen, setIsRevUpModalOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [impactAnalysis, setImpactAnalysis] = useState('');
  const [revUpError, setRevUpError] = useState('');

  // 결재 요청 Modal
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalLine, setApprovalLine] = useState('');
  const [approvalLineError, setApprovalLineError] = useState('');
  const [approvalTargetRevNo, setApprovalTargetRevNo] = useState<number | null>(null);

  if (!cp) {
    return (
      <div className="content-wrap">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
          투자 정보를 불러오지 못했습니다. 새로고침 후 재시도하세요.
        </div>
      </div>
    );
  }

  // 차수 UP 비활성 조건: DRAFT 또는 PENDING_APPROVAL 차수가 이미 있는 경우
  const hasDraftOrPending = revisions.some(r => r.status === 'DRAFT' || r.status === 'PENDING_APPROVAL');
  const selectedRevision = revisions.find(r => r.revisionNumber === selectedRevNo) ?? revisions[revisions.length - 1];
  const currentConfirmedRevision = revisions.filter(r => r.status === 'CONFIRMED').slice(-1)[0];

  // 차수 UP 저장
  const handleRevUpSave = () => {
    if (changeReason.trim().length < 10) {
      setRevUpError('변경사유는 10자 이상 입력하세요.');
      return;
    }
    const maxRev = Math.max(...revisions.map(r => r.revisionNumber));
    const newRev: CpInvestmentRevision = {
      id: `REV-NEW-${Date.now()}`,
      cpId: cp.id,
      revisionNumber: maxRev + 1,
      reason: changeReason,
      status: 'DRAFT',
      startDate: selectedRevision?.startDate ?? '',
      endDate: selectedRevision?.endDate ?? '',
      totalBudget: selectedRevision?.totalBudget ?? 0,
    };
    setRevisions(prev => [...prev, newRev]);
    setSelectedRevNo(newRev.revisionNumber);
    setChangeReason('');
    setImpactAnalysis('');
    setRevUpError('');
    setIsRevUpModalOpen(false);
  };

  // DRAFT 취소
  const handleDraftCancel = (revNo: number) => {
    if (!confirm('초안을 삭제하시겠습니까?')) return;
    setRevisions(prev => prev.filter(r => r.revisionNumber !== revNo));
    setSelectedRevNo(currentConfirmedRevision?.revisionNumber ?? 0);
  };

  // 결재 요청
  const handleApprovalRequest = () => {
    if (!approvalTargetRevNo) return;
    if (!approvalLine) {
      setApprovalLineError('결재라인을 선택하세요.');
      return;
    }
    setApprovalLineError('');
    setRevisions(prev => prev.map(r =>
      r.revisionNumber === approvalTargetRevNo ? { ...r, status: 'PENDING_APPROVAL' } : r
    ));
    setIsApprovalModalOpen(false);
    setApprovalLine('');
    alert('결재 요청이 완료되었습니다. (Mock)');
  };

  // Gantt 바 계산
  const ganttStart = new Date('2024-03-01').getTime();
  const ganttEnd = new Date('2027-02-28').getTime();
  const ganttTotal = ganttEnd - ganttStart;
  const getGanttWidth = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(2, Math.round(((e - s) / ganttTotal) * 100));
  };
  const getGanttLeft = (start: string) => {
    const s = new Date(start).getTime();
    return Math.round(((s - ganttStart) / ganttTotal) * 100);
  };

  const totalBudgetPlanned = MOCK_BUDGET.reduce((s, b) => s + b.planned, 0);
  const totalBudgetActual = MOCK_BUDGET.reduce((s, b) => s + b.actual, 0);
  const totalBudgetBalance = MOCK_BUDGET.reduce((s, b) => s + b.balance, 0);
  const totalQuantity = MOCK_QUANTITY.reduce((s, q) => s + q.total, 0);

  return (
    <div className="content-wrap">
      <Breadcrumb items={[{ label: '투자/프로젝트 관리' }, { label: '투자 관리', href: '/cp' }, { label: cp.projectName }]} />
      <div className="content-title-wrap">
        <h2>투자 상세 — 차수 관리</h2>
      </div>

      {/* 헤더 카드 */}
      <div className="content-box-wrap type-02">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>{cp.projectName}</span>
              <StatusBadge
                type="custom"
                value="current"
                customLabel={
                  revisions.some(r => r.status === 'PENDING_APPROVAL')
                    ? `${revisions.find(r => r.status === 'PENDING_APPROVAL')!.revisionNumber}차 결재진행중`
                    : revisions.some(r => r.status === 'DRAFT')
                    ? `${revisions.find(r => r.status === 'DRAFT')!.revisionNumber}차 초안`
                    : `${cp.currentRevision}차 확정`
                }
                customBg={
                  revisions.some(r => r.status === 'PENDING_APPROVAL') ? '#cfe2ff' :
                  revisions.some(r => r.status === 'DRAFT') ? '#fff3cd' : '#d1e7dd'
                }
                customText={
                  revisions.some(r => r.status === 'PENDING_APPROVAL') ? '#084298' :
                  revisions.some(r => r.status === 'DRAFT') ? '#856404' : '#0a3622'
                }
              />
            </div>
            <div style={{ fontSize: '12px', color: '#555', display: 'flex', gap: '1.5rem' }}>
              <span>에너지사용자: <strong>{cp.energyUser}</strong></span>
              <span>담당자: <strong>{cp.manager}</strong></span>
            </div>
          </div>
          <div className="button-wrap">
            <button
              className="btn type-03"
              disabled={hasDraftOrPending}
              onClick={() => { if (!hasDraftOrPending) setIsRevUpModalOpen(true); }}
              title={hasDraftOrPending ? '이미 진행 중인 차수 변경 초안이 있습니다' : ''}
            >
              차수 UP 신규 작성
            </button>
            <button className="btn type-02" onClick={() => router.push('/projects/' + cp.projectId)}>
              프로젝트 상세 →
            </button>
          </div>
        </div>
      </div>

      {/* 차수 타임라인 */}
      <div className="content-box-wrap type-02">
        <div className="title-row-wrap">
          <h3>차수 타임라인</h3>
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', minWidth: 'max-content' }}>
            {revisions.map((rev) => {
              const isSelected = rev.revisionNumber === selectedRevNo;
              const isDraft = rev.status === 'DRAFT';
              const isPendingApproval = rev.status === 'PENDING_APPROVAL';
              const isCurrentConfirmed = rev.revisionNumber === currentConfirmedRevision?.revisionNumber;

              let borderStyle: string;
              if (isPendingApproval) {
                borderStyle = '2px dashed #0d6efd';
              } else if (isDraft) {
                borderStyle = '2px dashed #adb5bd';
              } else if (isCurrentConfirmed) {
                borderStyle = '2px solid #00a7ea';
              } else {
                borderStyle = isSelected ? '2px solid #00a7ea' : '2px solid #dee2e6';
              }

              return (
                <div
                  key={rev.id}
                  onClick={() => setSelectedRevNo(rev.revisionNumber)}
                  style={{
                    border: borderStyle,
                    borderRadius: '6px',
                    padding: '0.75rem',
                    minWidth: '160px',
                    cursor: 'pointer',
                    background: isPendingApproval ? '#eff6ff' : isDraft ? '#fafafa' : isSelected ? '#f0fbff' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{rev.revisionNumber}차</span>
                    <StatusBadge type="cpInvestmentRevision" value={rev.status} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>
                    {rev.confirmedAt ? formatDate(rev.confirmedAt) : '작성중'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '0.5rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rev.reason}
                  </div>
                  {isPendingApproval && (
                    <div style={{ fontSize: '11px', color: '#0d6efd', fontWeight: 600, marginBottom: '0.25rem' }}>
                      결재 진행 중
                    </div>
                  )}
                  {isDraft && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn type-05"
                        onClick={e => { e.stopPropagation(); setApprovalTargetRevNo(rev.revisionNumber); setIsApprovalModalOpen(true); }}
                      >
                        결재 요청
                      </button>
                      <button
                        className="btn type-05 type-02"
                        onClick={e => { e.stopPropagation(); handleDraftCancel(rev.revisionNumber); }}
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="content-box-wrap type-02">
        <div style={{ marginBottom: '0.5rem', fontSize: '12px', color: '#555' }}>
          선택된 차수: <strong>
            {selectedRevision?.revisionNumber}차{' '}
            {selectedRevision?.status === 'CONFIRMED'
              ? '확정'
              : selectedRevision?.status === 'DRAFT'
              ? 'DRAFT'
              : selectedRevision?.status === 'PENDING_APPROVAL'
              ? '결재 진행 중'
              : ''}
          </strong>
        </div>
        <div className="tab-list">
          <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>일정 계획</button>
          <button className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>예산 계획</button>
          <button className={`tab-btn ${activeTab === 'quantity' ? 'active' : ''}`} onClick={() => setActiveTab('quantity')}>물량 계획</button>
        </div>

        {/* 일정 계획 탭 */}
        {activeTab === 'schedule' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { label: '착공일', value: formatDate(selectedRevision?.startDate ?? '') },
                { label: '준공일', value: formatDate(selectedRevision?.endDate ?? '') },
                { label: '공사기간', value: '약 36개월' },
              ].map(card => (
                <div key={card.label} className="content-box-wrap" style={{ flex: 1, padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '4px' }}>{card.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{card.value}</div>
                </div>
              ))}
            </div>

            <div className="table-wrap" style={{ marginBottom: '1rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>WBS코드</th>
                    <th style={{ textAlign: 'left' }}>항목명</th>
                    <th>시작일</th>
                    <th>종료일</th>
                    <th>기간</th>
                    <th>진행률</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SCHEDULE.map(row => (
                    <tr key={row.code}>
                      <td className="text-center">{row.code}</td>
                      <td className="text-left">{row.name}</td>
                      <td className="text-center">{row.start}</td>
                      <td className="text-center">{row.end}</td>
                      <td className="text-center">{row.duration}</td>
                      <td className="text-center">{row.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '0.75rem' }}>Gantt 바 (기간 시각화)</div>
              {MOCK_SCHEDULE.map(row => (
                <div key={row.code} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '6px' }}>
                  <div style={{ width: '60px', fontSize: '11px', color: '#555', flexShrink: 0 }}>{row.code} {row.name}</div>
                  <div style={{ flex: 1, height: '14px', background: '#e9ecef', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: `${getGanttLeft(row.start)}%`,
                        width: `${getGanttWidth(row.start, row.end)}%`,
                        height: '100%',
                        background: row.progress === 100 ? '#28a745' : row.progress > 0 ? '#00a7ea' : '#adb5bd',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <div style={{ width: '30px', fontSize: '11px', color: '#6c757d', flexShrink: 0, textAlign: 'right' }}>{row.progress}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 예산 계획 탭 */}
        {activeTab === 'budget' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>WBS코드</th>
                  <th style={{ textAlign: 'left' }}>항목명</th>
                  <th style={{ textAlign: 'right' }}>계획예산</th>
                  <th style={{ textAlign: 'right' }}>실행예산</th>
                  <th style={{ textAlign: 'right' }}>잔액</th>
                  <th style={{ textAlign: 'left' }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BUDGET.map(row => (
                  <tr key={row.code}>
                    <td className="text-center">{row.code}</td>
                    <td className="text-left">{row.name}</td>
                    <td className="text-right">{row.planned.toLocaleString('ko-KR')}원</td>
                    <td className="text-right">{row.actual.toLocaleString('ko-KR')}원</td>
                    <td className="text-right">{row.balance.toLocaleString('ko-KR')}원</td>
                    <td className="text-left">{row.note}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, background: '#f8f9fa' }}>
                  <td className="text-center" colSpan={2}>합계</td>
                  <td className="text-right">{totalBudgetPlanned.toLocaleString('ko-KR')}원</td>
                  <td className="text-right">{totalBudgetActual.toLocaleString('ko-KR')}원</td>
                  <td className="text-right">{totalBudgetBalance.toLocaleString('ko-KR')}원</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 물량 계획 탭 */}
        {activeTab === 'quantity' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>품목명</th>
                  <th>단위</th>
                  <th style={{ textAlign: 'right' }}>수량</th>
                  <th style={{ textAlign: 'right' }}>단가</th>
                  <th style={{ textAlign: 'right' }}>합계금액</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_QUANTITY.map(row => (
                  <tr key={row.name}>
                    <td className="text-left">{row.name}</td>
                    <td className="text-center">{row.unit}</td>
                    <td className="text-right">{row.qty.toLocaleString('ko-KR')}</td>
                    <td className="text-right">{row.unitPrice.toLocaleString('ko-KR')}원</td>
                    <td className="text-right">{row.total.toLocaleString('ko-KR')}원</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, background: '#f8f9fa' }}>
                  <td className="text-left" colSpan={4}>합계</td>
                  <td className="text-right">{totalQuantity.toLocaleString('ko-KR')}원</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 차수 UP Modal */}
      <ModalDialog
        isOpen={isRevUpModalOpen}
        onClose={() => { setIsRevUpModalOpen(false); setChangeReason(''); setImpactAnalysis(''); setRevUpError(''); }}
        title="차수 UP — 신규 작성"
        size="md"
        footer={
          <div className="button-wrap">
            <button className="btn type-02" onClick={() => setIsRevUpModalOpen(false)}>취소</button>
            <button className="btn" onClick={handleRevUpSave}>초안 저장</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-grid" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <label className="form-label">변경 차수 번호</label>
            <input
              type="text"
              value={`${Math.max(...revisions.map(r => r.revisionNumber)) + 1}차 (자동)`}
              readOnly
              className="display"
              style={{ width: '100%' }}
            />
            <label className="form-label required">변경사유</label>
            <textarea
              value={changeReason}
              onChange={e => setChangeReason(e.target.value)}
              placeholder="10자 이상 입력하세요"
              style={{ width: '100%', height: '80px' }}
            />
            {revUpError && <div style={{ gridColumn: '2', color: '#dc3545', fontSize: '11px' }}>{revUpError}</div>}
            <label className="form-label">영향분석</label>
            <textarea
              value={impactAnalysis}
              onChange={e => setImpactAnalysis(e.target.value)}
              placeholder="선택 입력"
              style={{ width: '100%', height: '60px' }}
            />
          </div>
        </div>
      </ModalDialog>

      {/* 결재 요청 Modal */}
      <ModalDialog
        isOpen={isApprovalModalOpen}
        onClose={() => { setIsApprovalModalOpen(false); setApprovalLine(''); setApprovalLineError(''); }}
        title={`결재 요청 — ${approvalTargetRevNo}차 차수 변경`}
        size="md"
        footer={
          <div className="button-wrap">
            <button className="btn type-02" onClick={() => { setIsApprovalModalOpen(false); setApprovalLine(''); setApprovalLineError(''); }}>취소</button>
            <button className="btn" onClick={handleApprovalRequest}>그룹웨어 결재 요청</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-grid" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <label className="form-label">차수 번호</label>
            <span style={{ fontSize: '12px' }}>{approvalTargetRevNo}차</span>
            <label className="form-label">변경사유</label>
            <span style={{ fontSize: '12px', color: '#555' }}>
              {revisions.find(r => r.revisionNumber === approvalTargetRevNo)?.reason}
            </span>
          </div>
          <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '0.5rem' }}>결재라인 <span style={{ color: '#dc3545' }}>*</span></div>
            <select
              value={approvalLine}
              onChange={e => { setApprovalLine(e.target.value); setApprovalLineError(''); }}
              style={{ width: '100%' }}
            >
              <option value="">결재라인을 선택하세요</option>
              <option value="team_leader">팀장 결재</option>
              <option value="department_head">부장 결재</option>
              <option value="division_head">본부장 결재</option>
              <option value="full_line">팀장 → 부장 → 본부장</option>
            </select>
            {approvalLineError && (
              <div style={{ color: '#dc3545', fontSize: '11px', marginTop: '4px' }}>{approvalLineError}</div>
            )}
          </div>
          <div className="content-box-wrap" style={{ padding: '0.75rem', fontSize: '11px', color: '#6c757d' }}>
            결재라인 (Mock): 팀장 → 부장 → 본부장
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
