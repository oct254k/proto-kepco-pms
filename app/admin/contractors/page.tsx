'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import DrawerPanel from '@/components/common/DrawerPanel';
import ModalDialog from '@/components/common/ModalDialog';
import DocumentViewer from '@/components/common/DocumentViewer';
import EmptyState from '@/components/common/EmptyState';
import { mockContractors } from '@/lib/mock-data/contractors';
import { mockContracts } from '@/lib/mock-data/contracts';
import { formatDate, formatAmountShort, formatAmount } from '@/lib/utils';
import { Contractor } from '@/types';

// ── 신용등급 배지 스타일 ──────────────────────────────────────────────────────
function getCreditBadgeStyle(grade: string) {
  if (grade === 'A+' || grade === 'A') {
    return { background: '#d4edda', color: '#155724' };
  }
  if (grade === 'BB+' || grade === 'BB-') {
    return { background: '#fff3cd', color: '#856404' };
  }
  return { background: '#f8d7da', color: '#721c24' };
}

function CreditBadge({ grade }: { grade: string }) {
  const style = getCreditBadgeStyle(grade);
  return (
    <span
      className="status-badge"
      style={style}
    >
      {grade}
    </span>
  );
}

// ── 3개년 재무지표 Mock ───────────────────────────────────────────────────────
const financialData = [
  { year: '2022', revenue: 450, operatingProfit: 32, debtRatio: 85, marginRate: 7.1 },
  { year: '2023', revenue: 520, operatingProfit: 40, debtRatio: 78, marginRate: 7.7 },
  { year: '2024', revenue: 580, operatingProfit: 48, debtRatio: 72, marginRate: 8.3 },
];

const CREDIT_GRADES = ['전체', 'A+', 'A', 'BB+', 'BB-', 'B 이하'];

// ── 신규 등록 초기값 ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  businessNo: '',
  representative: '',
  address: '',
  creditGrade: 'A',
  settlementDate: '',
};

export default function ContractorsPage() {
  // 조회조건
  const [searchName, setSearchName] = useState('');
  const [searchGrade, setSearchGrade] = useState('전체');

  // 드로어
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'basic' | 'credit' | 'projects'>('basic');

  // 문서뷰어
  const [docViewerOpen, setDocViewerOpen] = useState(false);

  // 신규 등록 모달
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({ ...EMPTY_FORM });

  // 삭제 모달
  const [deleteOpen, setDeleteOpen] = useState(false);

  // 로컬 업체 목록 (신규 등록 mock 반영)
  const [contractors, setContractors] = useState([...mockContractors]);

  // 행 선택 (편집/삭제용)
  const [checkedId, setCheckedId] = useState<string | null>(null);

  // ── 필터링 ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return contractors.filter((c) => {
      const nameMatch = searchName === '' || c.name.includes(searchName);
      const gradeMatch =
        searchGrade === '전체' ||
        (searchGrade === 'B 이하' && !['A+', 'A', 'BB+', 'BB-'].includes(c.creditGrade)) ||
        c.creditGrade === searchGrade;
      return nameMatch && gradeMatch;
    });
  }, [contractors, searchName, searchGrade]);

  // ── 행 클릭 ───────────────────────────────────────────────────────────────
  function handleRowClick(c: Contractor) {
    setSelectedContractor(c);
    setDrawerTab('basic');
    setDrawerOpen(true);
  }

  // ── 사업실적 (계약 목록) ──────────────────────────────────────────────────
  const relatedContracts = useMemo(() => {
    if (!selectedContractor) return [];
    return mockContracts.filter(
      (c) => c.counterparty === selectedContractor.name,
    );
  }, [selectedContractor]);

  // ── 신규 등록 처리 ─────────────────────────────────────────────────────────
  function handleRegister() {
    if (!registerForm.name || !registerForm.businessNo) return;
    const newItem: Contractor = {
      id: `EPC-${String(contractors.length + 1).padStart(3, '0')}`,
      name: registerForm.name,
      businessNo: registerForm.businessNo,
      representative: registerForm.representative,
      address: registerForm.address,
      creditGrade: registerForm.creditGrade,
      settlementDate: registerForm.settlementDate,
      validUntil: '',
      registeredAt: new Date().toISOString().slice(0, 10),
    };
    setContractors((prev) => [...prev, newItem]);
    setRegisterForm({ ...EMPTY_FORM });
    setRegisterOpen(false);
  }

  // ── 삭제 처리 ─────────────────────────────────────────────────────────────
  function handleDelete() {
    if (!checkedId) return;
    setContractors((prev) => prev.filter((c) => c.id !== checkedId));
    if (selectedContractor?.id === checkedId) {
      setDrawerOpen(false);
      setSelectedContractor(null);
    }
    setCheckedId(null);
    setDeleteOpen(false);
  }

  return (
    <div>
      {/* 브레드크럼 */}
      <div className="breadcrumb-container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">관리자</li>
          <li className="breadcrumb-item active">협력업체·신용평가</li>
        </ol>
      </div>

      <div className="content-title-wrap">
        <h2>협력업체·EPC 신용평가 관리</h2>
      </div>

      <div className="content-wrap">
        {/* ── 조회조건 ── */}
        <div className="content-box-wrap">
          <div className="filter-row">
            <div className="filter-item">
              <label className="filter-label">업체명</label>
              <input
                type="text"
                style={{ width: 160 }}
                placeholder="업체명 입력"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="filter-item">
              <label className="filter-label">신용등급</label>
              <select
                style={{ width: 100 }}
                value={searchGrade}
                onChange={(e) => setSearchGrade(e.target.value)}
              >
                {CREDIT_GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button className="btn" onClick={() => {}}>조회</button>
              <button
                className="btn type-02"
                onClick={() => { setSearchName(''); setSearchGrade('전체'); }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* ── 테이블 ── */}
        <div className="content-box-wrap type-02">
          <div className="title-row-wrap">
            <h3>협력업체 목록</h3>
            <div className="button-wrap">
              <button className="btn" onClick={() => setRegisterOpen(true)}>신규 등록</button>
              <button
                className="btn type-03"
                disabled={!checkedId}
                onClick={() => {}}
              >
                편집
              </button>
              <button
                className="btn type-02"
                style={{ background: checkedId ? '#dc3545' : undefined }}
                disabled={!checkedId}
                onClick={() => checkedId && setDeleteOpen(true)}
              >
                삭제
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th style={{ textAlign: 'left' }}>업체명</th>
                  <th>사업자번호</th>
                  <th>신용등급</th>
                  <th>결산일</th>
                  <th>유효기간</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState message="등록된 협력업체가 없습니다." />
                    </td>
                  </tr>
                )}
                {filtered.map((c, idx) => (
                  <tr
                    key={c.id}
                    style={{
                      background:
                        checkedId === c.id
                          ? 'var(--bg-table-hover)'
                          : undefined,
                    }}
                    onClick={() => {
                      setCheckedId(c.id);
                      handleRowClick(c);
                    }}
                  >
                    <td className="text-center">{idx + 1}</td>
                    <td className="text-left">{c.name}</td>
                    <td className="text-center">{c.businessNo}</td>
                    <td className="text-center">
                      <CreditBadge grade={c.creditGrade} />
                    </td>
                    <td className="text-center">{formatDate(c.settlementDate)}</td>
                    <td className="text-center">{formatDate(c.validUntil)}</td>
                    <td className="text-center">{formatDate(c.registeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="count-wrap">총 {filtered.length}건</div>
        </div>
      </div>

      {/* ── Drawer ── */}
      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedContractor ? selectedContractor.name : ''}
        width={640}
      >
        {selectedContractor && (
          <>
            {/* 탭 */}
            <div className="tab-list" style={{ marginTop: '-0.5rem' }}>
              {(['basic', 'credit', 'projects'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${drawerTab === tab ? 'active' : ''}`}
                  onClick={() => setDrawerTab(tab)}
                >
                  {tab === 'basic' ? '기본정보' : tab === 'credit' ? '신용평가' : '사업실적'}
                </button>
              ))}
            </div>

            {/* ── 기본정보 탭 ── */}
            {drawerTab === 'basic' && (
              <div className="form-grid" style={{ rowGap: '0.75rem' }}>
                <span className="form-label">업체명</span>
                <span>{selectedContractor.name}</span>
                <span className="form-label">사업자번호</span>
                <span>{selectedContractor.businessNo}</span>

                <span className="form-label">대표자</span>
                <span>{selectedContractor.representative}</span>
                <span className="form-label">신용등급</span>
                <span><CreditBadge grade={selectedContractor.creditGrade} /></span>

                <span className="form-label">주소</span>
                <span style={{ gridColumn: 'span 3' }}>{selectedContractor.address}</span>

                <span className="form-label">결산일</span>
                <span>{formatDate(selectedContractor.settlementDate)}</span>
                <span className="form-label">유효기간</span>
                <span>{formatDate(selectedContractor.validUntil)}</span>

                <span className="form-label">등록일</span>
                <span>{formatDate(selectedContractor.registeredAt)}</span>
                <span className="form-label"></span>
                <span></span>
              </div>
            )}

            {/* ── 신용평가 탭 ── */}
            {drawerTab === 'credit' && (
              <div>
                {/* 등급 강조 */}
                <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '13px', color: '#555' }}>현재 신용등급</span>
                  <span
                    className="status-badge"
                    style={{
                      ...getCreditBadgeStyle(selectedContractor.creditGrade),
                      fontSize: '18px',
                      padding: '4px 16px',
                      borderRadius: '4px',
                    }}
                  >
                    {selectedContractor.creditGrade}
                  </span>
                </div>

                {/* 3개년 재무지표 테이블 */}
                <div className="title-row-wrap">
                  <h3>3개년 재무지표 (억원)</h3>
                </div>
                <div className="table-wrap" style={{ marginBottom: '1.25rem' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>연도</th>
                        <th style={{ textAlign: 'right' }}>매출액</th>
                        <th style={{ textAlign: 'right' }}>영업이익</th>
                        <th style={{ textAlign: 'right' }}>부채비율</th>
                        <th style={{ textAlign: 'right' }}>영업이익률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedContractor.id === 'EPC-001' ? financialData : []).map((row) => (
                        <tr key={row.year}>
                          <td className="text-center">{row.year}</td>
                          <td className="text-right">{row.revenue}억</td>
                          <td className="text-right">{row.operatingProfit}억</td>
                          <td className="text-right">{row.debtRatio}%</td>
                          <td className="text-right">{row.marginRate}%</td>
                        </tr>
                      ))}
                      {selectedContractor.id !== 'EPC-001' && (
                        <tr>
                          <td colSpan={5}>
                            <EmptyState message="재무지표 데이터가 없습니다." />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Recharts BarChart */}
                {selectedContractor.id === 'EPC-001' && (
                  <>
                    <div className="title-row-wrap">
                      <h3>3개년 매출·영업이익 비교</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={financialData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} unit="억" />
                        <Tooltip formatter={(v) => `${v}억원`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="revenue" name="매출액" fill="#00a7ea" />
                        <Bar dataKey="operatingProfit" name="영업이익" fill="#417498" />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}

                {/* 신용평가서 보기 */}
                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '12px', color: '#555' }}>신용평가서</span>
                  <button
                    className="btn type-04"
                    onClick={() => setDocViewerOpen(true)}
                  >
                    보기
                  </button>
                </div>
              </div>
            )}

            {/* ── 사업실적 탭 ── */}
            {drawerTab === 'projects' && (
              <div>
                <div className="title-row-wrap">
                  <h3>관련 프로젝트 계약 목록</h3>
                </div>
                {relatedContracts.length === 0 ? (
                  <EmptyState message="계약 실적이 없습니다." />
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>프로젝트명</th>
                          <th style={{ textAlign: 'right' }}>계약금액</th>
                          <th>계약일</th>
                          <th>상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatedContracts.map((c) => (
                          <tr key={c.id}>
                            <td className="text-left">{c.name}</td>
                            <td className="text-right">{formatAmountShort(c.amount)}</td>
                            <td className="text-center">{formatDate(c.date)}</td>
                            <td className="text-center">{c.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </DrawerPanel>

      {/* ── 신규 등록 Modal ── */}
      <ModalDialog
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="협력업체 신규 등록"
        size="md"
        footer={
          <>
            <button className="btn" onClick={handleRegister}>등록</button>
            <button className="btn type-02" onClick={() => setRegisterOpen(false)}>취소</button>
          </>
        }
      >
        <div className="form-grid" style={{ rowGap: '0.75rem' }}>
          <label className="form-label required">업체명</label>
          <input
            type="text"
            style={{ gridColumn: 'span 3' }}
            value={registerForm.name}
            onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="업체명 입력"
          />

          <label className="form-label required">사업자번호</label>
          <input
            type="text"
            style={{ gridColumn: 'span 3' }}
            value={registerForm.businessNo}
            onChange={(e) => setRegisterForm((f) => ({ ...f, businessNo: e.target.value }))}
            placeholder="000-00-00000"
          />

          <label className="form-label">대표자</label>
          <input
            type="text"
            value={registerForm.representative}
            onChange={(e) => setRegisterForm((f) => ({ ...f, representative: e.target.value }))}
          />

          <label className="form-label">신용등급</label>
          <select
            value={registerForm.creditGrade}
            onChange={(e) => setRegisterForm((f) => ({ ...f, creditGrade: e.target.value }))}
          >
            {['A+', 'A', 'BB+', 'BB-', 'B'].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <label className="form-label">주소</label>
          <input
            type="text"
            style={{ gridColumn: 'span 3' }}
            value={registerForm.address}
            onChange={(e) => setRegisterForm((f) => ({ ...f, address: e.target.value }))}
          />

          <label className="form-label">결산일</label>
          <input
            type="date"
            value={registerForm.settlementDate}
            onChange={(e) => setRegisterForm((f) => ({ ...f, settlementDate: e.target.value }))}
          />
          <span></span>
          <span></span>
        </div>
      </ModalDialog>

      {/* ── 삭제 확인 Modal ── */}
      <ModalDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="협력업체 삭제"
        size="sm"
        footer={
          <>
            <button
              className="btn"
              style={{ background: '#dc3545' }}
              onClick={handleDelete}
            >
              삭제
            </button>
            <button className="btn type-02" onClick={() => setDeleteOpen(false)}>취소</button>
          </>
        }
      >
        <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
          삭제 후 복구할 수 없습니다.<br />
          <strong>{contractors.find((c) => c.id === checkedId)?.name}</strong> 업체를 삭제하시겠습니까?
        </p>
      </ModalDialog>

      {/* ── 신용평가서 DocumentViewer ── */}
      <DocumentViewer
        isOpen={docViewerOpen}
        onClose={() => setDocViewerOpen(false)}
        fileName="evaluation-sample.pdf"
        fileUrl="/sample-docs/evaluation-sample.pdf"
      />
    </div>
  );
}
