'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import DrawerPanel from '@/components/common/DrawerPanel';
import ModalDialog from '@/components/common/ModalDialog';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils';

// ── Mock 데이터 ───────────────────────────────────────────────────────────────

// 메뉴별 사용량 (가로 막대용, recharts는 XAxis=접속횟수, YAxis=메뉴명)
const menuUsageData = [
  { menu: '대시보드', count: 245 },
  { menu: '프로젝트목록', count: 198 },
  { menu: 'Pipeline', count: 165 },
  { menu: 'CP관리', count: 142 },
  { menu: '계약조회', count: 98 },
  { menu: '사업결산', count: 87 },
  { menu: '기회현황', count: 76 },
  { menu: '마이페이지', count: 65 },
  { menu: '사용자관리', count: 32 },
];

// 최근 7일 접속자 수
const dailyAccessData = [
  { day: '월', count: 15 },
  { day: '화', count: 23 },
  { day: '수', count: 31 },
  { day: '목', count: 28 },
  { day: '금', count: 35 },
  { day: '토', count: 8 },
  { day: '일', count: 5 },
];

// 시스템 현황 카드
const systemStats = {
  users: 7,
  activeProjects: 8,
  monthlyAccess: 1152,
  pendingRequests: 2,
};

// 요청사항 Mock
interface Request {
  id: string;
  requestNo: string;
  requester: string;
  projectId: string;
  content: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
}

const initialRequests: Request[] = [
  {
    id: '1',
    requestNo: 'REQ-001',
    requester: '김민준',
    projectId: 'PRJ-2024-001',
    content: '6회차 상환금액 수정 요청',
    status: 'COMPLETED',
    createdAt: '2025-03-10',
  },
  {
    id: '2',
    requestNo: 'REQ-002',
    requester: '이서연',
    projectId: 'PRJ-2024-003',
    content: '계약금액 단위 오류 수정',
    status: 'PENDING',
    createdAt: '2025-04-01',
  },
  {
    id: '3',
    requestNo: 'REQ-003',
    requester: '박지훈',
    projectId: 'PRJ-2024-002',
    content: '착공일 변경 요청',
    status: 'PENDING',
    createdAt: '2025-04-15',
  },
  {
    id: '4',
    requestNo: 'REQ-004',
    requester: '최수빈',
    projectId: 'PRJ-2023-002',
    content: '투자비 항목 추가 요청',
    status: 'REJECTED',
    createdAt: '2025-02-20',
  },
  {
    id: '5',
    requestNo: 'REQ-005',
    requester: '정다은',
    projectId: 'PRJ-2024-005',
    content: '담당자 변경 요청',
    status: 'COMPLETED',
    createdAt: '2025-03-25',
  },
];

// ── 상태 배지 ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'PENDING' | 'COMPLETED' | 'REJECTED' }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    PENDING:   { bg: '#fff3cd', color: '#856404', label: 'PENDING' },
    COMPLETED: { bg: '#d4edda', color: '#155724', label: 'COMPLETED' },
    REJECTED:  { bg: '#f8d7da', color: '#721c24', label: 'REJECTED' },
  };
  const s = styles[status];
  return (
    <span
      className="status-badge"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export default function SystemPage() {
  // 메인 탭
  const [mainTab, setMainTab] = useState<'dashboard' | 'requests'>('dashboard');

  // 요청사항 상태
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [filterRequester, setFilterRequester] = useState('');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // 드로어
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 반려 모달
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // ── 요청사항 필터링 ───────────────────────────────────────────────────────
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const requesterMatch = filterRequester === '' || r.requester.includes(filterRequester);
      const statusMatch = filterStatus === '전체' || r.status === filterStatus;
      const dateFromMatch = filterDateFrom === '' || r.createdAt >= filterDateFrom;
      const dateToMatch = filterDateTo === '' || r.createdAt <= filterDateTo;
      return requesterMatch && statusMatch && dateFromMatch && dateToMatch;
    });
  }, [requests, filterRequester, filterStatus, filterDateFrom, filterDateTo]);

  // ── 행 클릭 ───────────────────────────────────────────────────────────────
  function handleRowClick(r: Request) {
    setSelectedRequest(r);
    setDrawerOpen(true);
  }

  // ── 처리 완료 ─────────────────────────────────────────────────────────────
  function handleComplete() {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id ? { ...r, status: 'COMPLETED' } : r,
      ),
    );
    setSelectedRequest((prev) => prev ? { ...prev, status: 'COMPLETED' } : prev);
  }

  // ── 반려 처리 ─────────────────────────────────────────────────────────────
  function handleReject() {
    if (!rejectReason.trim()) {
      setRejectError('반려 사유는 필수입력 항목입니다.');
      return;
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest?.id ? { ...r, status: 'REJECTED' } : r,
      ),
    );
    setSelectedRequest((prev) => prev ? { ...prev, status: 'REJECTED' } : prev);
    setRejectReason('');
    setRejectError('');
    setRejectModalOpen(false);
  }

  // 현황 카운트
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  return (
    <div>
      {/* 브레드크럼 */}
      <div className="breadcrumb-container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">관리자</li>
          <li className="breadcrumb-item active">시스템 환경</li>
        </ol>
      </div>

      <div className="content-title-wrap">
        <h2>시스템환경·요청 관리</h2>
      </div>

      {/* 메인 탭 */}
      <div className="tab-list">
        <button
          className={`tab-btn ${mainTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setMainTab('dashboard')}
        >
          시스템 대시보드
        </button>
        <button
          className={`tab-btn ${mainTab === 'requests' ? 'active' : ''}`}
          onClick={() => setMainTab('requests')}
        >
          요청사항
        </button>
      </div>

      {/* ══════════════ 시스템 대시보드 탭 ══════════════ */}
      {mainTab === 'dashboard' && (
        <div className="content-wrap">
          {/* 섹션 3 — 시스템 현황 카드 */}
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>시스템 현황</h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
              }}
            >
              {[
                { label: '등록 사용자 수', value: `${systemStats.users}명`, color: '#00a7ea' },
                { label: '활성 프로젝트 수', value: `${systemStats.activeProjects}건`, color: '#417498' },
                { label: '이번달 접속 횟수', value: `${systemStats.monthlyAccess.toLocaleString()}회`, color: '#fd7e14' },
                { label: '미처리 요청', value: `${systemStats.pendingRequests}건`, color: '#dc3545' },
              ].map(({ label, value, color }) => (
                <div key={label} className="kpi-card">
                  <div className="kpi-label">{label}</div>
                  <div className="kpi-value" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 섹션 1 — 메뉴별 사용량 (가로 막대) */}
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>메뉴별 사용량</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                layout="vertical"
                data={menuUsageData}
                margin={{ top: 4, right: 40, left: 20, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  label={{ value: '접속 횟수', position: 'insideBottomRight', offset: 0, fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="menu"
                  tick={{ fontSize: 11 }}
                  width={80}
                />
                <Tooltip formatter={(v) => [`${v}회`, '접속 횟수']} />
                <Bar dataKey="count" name="접속 횟수" fill="#00a7ea" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 섹션 2 — 최근 7일 일별 접속자 수 */}
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>최근 7일 일별 접속자 수</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={dailyAccessData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="명" />
                <Tooltip formatter={(v) => [`${v}명`, '접속자 수']} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="접속자"
                  stroke="#00a7ea"
                  strokeWidth={2}
                  dot={{ fill: '#00a7ea', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══════════════ 요청사항 탭 ══════════════ */}
      {mainTab === 'requests' && (
        <div className="content-wrap">
          {/* 조회조건 */}
          <div className="content-box-wrap">
            <div className="filter-row">
              <div className="filter-item">
                <label className="filter-label">요청자</label>
                <input
                  type="text"
                  style={{ width: 120 }}
                  placeholder="요청자명"
                  value={filterRequester}
                  onChange={(e) => setFilterRequester(e.target.value)}
                />
              </div>
              <div className="filter-item">
                <label className="filter-label">상태</label>
                <select
                  style={{ width: 120 }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {['전체', 'PENDING', 'COMPLETED', 'REJECTED'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <label className="filter-label">기간</label>
                <input
                  type="date"
                  style={{ width: 130 }}
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
                <span style={{ padding: '0 4px', color: '#6c757d' }}>~</span>
                <input
                  type="date"
                  style={{ width: 130 }}
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
              <div className="filter-actions">
                <button className="btn" onClick={() => {}}>조회</button>
                <button
                  className="btn type-02"
                  onClick={() => {
                    setFilterRequester('');
                    setFilterStatus('전체');
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                >
                  초기화
                </button>
              </div>
            </div>
          </div>

          {/* 현황 요약 카드 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
            }}
          >
            <div
              className="kpi-card"
              style={{ borderLeft: '4px solid #856404', cursor: 'pointer' }}
              onClick={() => setFilterStatus('PENDING')}
            >
              <div className="kpi-label">미처리 (PENDING)</div>
              <div className="kpi-value" style={{ color: '#856404' }}>{pendingCount}건</div>
            </div>
            <div
              className="kpi-card"
              style={{ borderLeft: '4px solid #155724', cursor: 'pointer' }}
              onClick={() => setFilterStatus('COMPLETED')}
            >
              <div className="kpi-label">처리완료 (COMPLETED)</div>
              <div className="kpi-value" style={{ color: '#155724' }}>{completedCount}건</div>
            </div>
            <div
              className="kpi-card"
              style={{ borderLeft: '4px solid #721c24', cursor: 'pointer' }}
              onClick={() => setFilterStatus('REJECTED')}
            >
              <div className="kpi-label">반려 (REJECTED)</div>
              <div className="kpi-value" style={{ color: '#721c24' }}>{rejectedCount}건</div>
            </div>
          </div>

          {/* 요청 목록 테이블 */}
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>요청사항 목록</h3>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>No</th>
                    <th>요청번호</th>
                    <th style={{ textAlign: 'left' }}>요청자</th>
                    <th style={{ textAlign: 'left' }}>프로젝트명</th>
                    <th style={{ textAlign: 'left' }}>요청내용요약</th>
                    <th>상태</th>
                    <th>요청일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState message="처리 대기 중인 요청이 없습니다." />
                      </td>
                    </tr>
                  )}
                  {filteredRequests.map((r, idx) => (
                    <tr
                      key={r.id}
                      onClick={() => handleRowClick(r)}
                      style={{
                        background: selectedRequest?.id === r.id ? 'var(--bg-table-hover)' : undefined,
                      }}
                    >
                      <td className="text-center">{idx + 1}</td>
                      <td className="text-center">{r.requestNo}</td>
                      <td className="text-left">{r.requester}</td>
                      <td className="text-left">{r.projectId}</td>
                      <td className="text-left">{r.content}</td>
                      <td className="text-center">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="text-center">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="count-wrap">총 {filteredRequests.length}건</div>
          </div>
        </div>
      )}

      {/* ── 요청사항 Drawer ── */}
      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedRequest ? `요청 상세 — ${selectedRequest.requestNo}` : ''}
        width={480}
        footer={
          selectedRequest?.status === 'PENDING' ? (
            <>
              <button
                className="btn"
                onClick={handleComplete}
              >
                처리 완료
              </button>
              <button
                className="btn type-02"
                style={{ background: '#dc3545' }}
                onClick={() => {
                  setRejectReason('');
                  setRejectError('');
                  setRejectModalOpen(true);
                }}
              >
                반려
              </button>
            </>
          ) : undefined
        }
      >
        {selectedRequest && (
          <div>
            {/* 기본 정보 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr',
                gap: '0.5rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '12px',
              }}
            >
              <span style={{ color: '#555' }}>요청번호</span>
              <span style={{ fontWeight: 700 }}>{selectedRequest.requestNo}</span>

              <span style={{ color: '#555' }}>요청자</span>
              <span>{selectedRequest.requester}</span>

              <span style={{ color: '#555' }}>프로젝트</span>
              <span>{selectedRequest.projectId}</span>

              <span style={{ color: '#555' }}>요청일</span>
              <span>{formatDate(selectedRequest.createdAt)}</span>

              <span style={{ color: '#555' }}>현재 상태</span>
              <span><StatusBadge status={selectedRequest.status} /></span>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

            {/* 요청 내용 */}
            <div className="title-row-wrap">
              <h3>요청 내용</h3>
            </div>
            <div
              style={{
                background: '#f8f9fa',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '0.75rem 1rem',
                fontSize: '12px',
                lineHeight: '1.6',
                marginBottom: '1.25rem',
              }}
            >
              {selectedRequest.content}
            </div>

            {/* 처리 상태 안내 */}
            {selectedRequest.status !== 'PENDING' && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  fontSize: '12px',
                  background: selectedRequest.status === 'COMPLETED' ? '#d4edda' : '#f8d7da',
                  color: selectedRequest.status === 'COMPLETED' ? '#155724' : '#721c24',
                }}
              >
                {selectedRequest.status === 'COMPLETED'
                  ? '이미 처리 완료된 요청입니다.'
                  : '이미 반려된 요청입니다.'}
              </div>
            )}
          </div>
        )}
      </DrawerPanel>

      {/* ── 반려 사유 입력 Modal ── */}
      <ModalDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="반려 사유 입력"
        size="sm"
        footer={
          <>
            <button
              className="btn"
              style={{ background: '#dc3545' }}
              onClick={handleReject}
            >
              반려 확정
            </button>
            <button
              className="btn type-02"
              onClick={() => setRejectModalOpen(false)}
            >
              취소
            </button>
          </>
        }
      >
        <div>
          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '0.5rem' }}>
            반려 사유 <span style={{ color: '#ff0b3a' }}>*</span>
          </label>
          <textarea
            style={{
              width: '100%',
              height: '100px',
              borderColor: rejectError ? '#ff0b3a' : undefined,
            }}
            placeholder="반려 사유를 입력하세요 (최대 500자)"
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              if (e.target.value.trim()) setRejectError('');
            }}
          />
          {rejectError && (
            <p style={{ color: '#ff0b3a', fontSize: '11px', marginTop: '0.25rem' }}>{rejectError}</p>
          )}
        </div>
      </ModalDialog>
    </div>
  );
}
