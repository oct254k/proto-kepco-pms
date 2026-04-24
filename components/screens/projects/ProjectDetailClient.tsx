'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/common/StatusBadge';
import ModalDialog from '@/components/common/ModalDialog';
import DrawerPanel from '@/components/common/DrawerPanel';
import { mockProjects } from '@/lib/mock-data/projects';
import { mockContracts } from '@/lib/mock-data/contracts';
import { mockRepayments } from '@/lib/mock-data/repayments';
import { mockInvoices } from '@/lib/mock-data/invoices';
import { mockUncollected } from '@/lib/mock-data/dashboard';
import { mockCpInvestments } from '@/lib/mock-data/cp';
import { formatAmount, formatDate, formatDday } from '@/lib/utils';

// Mock 투자비 데이터
const mockInvestments = [
  { id: 'INV-P-001', projectId: 'PRJ-2024-001', category: '기성금', contractor: '(주)한빛전기', supplyAmt: 90000000, tax: 9000000, total: 99000000, payDate: '2024-04-01', status: 'SYNCED' },
  { id: 'INV-P-002', projectId: 'PRJ-2024-001', category: '기성금', contractor: '(주)한빛전기', supplyAmt: 90000000, tax: 9000000, total: 99000000, payDate: '2024-06-01', status: 'SYNCED' },
  { id: 'INV-P-003', projectId: 'PRJ-2024-001', category: '준공금', contractor: '(주)한빛전기', supplyAmt: 0, tax: 0, total: 0, payDate: '', status: 'PENDING' },
];

const mockEditHistory = [
  { date: '2024-03-15', field: '담당자', before: '이서연', after: '김민준' },
  { date: '2024-05-20', field: '예상준공일', before: '2026-12-31', after: '2027-02-28' },
  { date: '2024-08-10', field: '프로젝트명', before: '광명전기 LED', after: '광명전기 LED 교체' },
];


interface Props {
  id: string;
}

export default function ProjectDetailClient({ id }: Props) {
  const router = useRouter();
  const project = mockProjects.find((p) => p.id === id);

  const [activeTab, setActiveTab] = useState<'info' | 'contract' | 'invest' | 'invoice' | 'repayment' | 'uncollected'>('info');
  const [contractSubTab, setContractSubTab] = useState<'award' | 'order'>('award');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [repaymentModalOpen, setRepaymentModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedRepaymentRound, setSelectedRepaymentRound] = useState<number | null>(null);

  const [investCategory, setInvestCategory] = useState('기성금');
  const [investAmount, setInvestAmount] = useState('');
  const [investDate, setInvestDate] = useState('');

  if (!project) {
    return (
      <div className="content-box-wrap type-02" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6c757d' }}>프로젝트를 찾을 수 없습니다.</p>
        <button className="btn type-02" style={{ marginTop: '1rem' }} onClick={() => router.push('/projects')}>목록으로</button>
      </div>
    );
  }

  const cpId = mockCpInvestments.find((cp) => cp.projectId === id)?.id;

  const projectContracts = mockContracts.filter((c) => c.projectId === id);
  const projectRepayments = mockRepayments.filter((r) => r.projectId === id);
  const projectInvoices = mockInvoices.filter((inv) => inv.projectId === id);
  const projectUncollected = mockUncollected.filter((u) => u.projectId === id);
  const projectInvestments = mockInvestments.filter((inv) => inv.projectId === id);

  const awardContracts = projectContracts.filter((c) => c.type === 'AWARD');
  const orderContracts = projectContracts.filter((c) => c.type === 'ORDER');

  const repaidAmt = projectRepayments.filter((r) => r.status === 'REPAID').reduce((s, r) => s + r.repaidAmount, 0);
  const totalRepayAmt = projectRepayments.reduce((s, r) => s + r.billingAmount, 0);
  const uncollectedAmt = totalRepayAmt - repaidAmt;
  const recoveryRate = totalRepayAmt > 0 ? Math.round((repaidAmt / totalRepayAmt) * 100) : 0;

  const totalInvest = project.investmentCost;
  const paidInvest = projectInvestments.filter((i) => i.status === 'SYNCED').reduce((s, i) => s + i.total, 0);
  const remainInvest = totalInvest - paidInvest;
  const investRate = totalInvest > 0 ? Math.round((paidInvest / totalInvest) * 100) : 0;

  return (
    <div>
      <div className="breadcrumb-container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">홈</li>
          <li className="breadcrumb-item">투자/프로젝트 관리</li>
          <li className="breadcrumb-item" style={{ cursor: 'pointer', color: '#00a7ea' }} onClick={() => router.push('/projects')}>프로젝트 관리</li>
          <li className="breadcrumb-item active">{project.name}</li>
        </ol>
      </div>

      <div className="content-wrap">
        {/* 헤더 카드 */}
        <div className="content-box-wrap type-02">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '11px', color: '#6c757d' }}>{project.id}</span>
                <StatusBadge type="project" value={project.status} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '0.5rem' }}>{project.name}</h2>
              <div style={{ fontSize: '12px', color: '#555', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span>에너지사용자: <strong>{project.energyUser}</strong></span>
                <span>담당자: <strong>{project.manager}</strong></span>
                <span>착공일: <strong>{project.startDate ? formatDate(project.startDate) : '-'}</strong></span>
                <span>
                  준공일: <strong>{project.endDate ? formatDate(project.endDate) : '-'}</strong>
                  {project.endDate && <span style={{ marginLeft: '0.375rem', color: '#00a7ea', fontSize: '11px' }}>({formatDday(project.endDate)})</span>}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
              <button className="btn type-02" onClick={() => setStatusModalOpen(true)}>상태변경</button>
              <button className="btn type-02">편집</button>
              {cpId ? (
                <button className="btn type-03" onClick={() => router.push('/cp/' + cpId)}>투자 관리 →</button>
              ) : (
                <button className="btn type-03" disabled title="연결된 투자 항목이 없습니다" style={{ opacity: 0.5, cursor: 'not-allowed' }}>투자 관리 →</button>
              )}
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="content-box-wrap type-02">
          <div className="tab-list">
            {(['info', 'contract', 'invest', 'invoice', 'repayment', 'uncollected'] as const).map((tab) => {
              const labels: Record<string, string> = {
                info: '기본정보', contract: '계약', invest: '투자비',
                invoice: '세금계산서', repayment: '상환', uncollected: '미회수',
              };
              return (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* 기본정보 탭 */}
          {activeTab === 'info' && (
            <div>
              <div className="title-row-wrap">
                <h3>프로젝트 기본정보</h3>
                <button className="btn type-05" onClick={() => setHistoryDrawerOpen(true)}>수정이력 보기</button>
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: '130px 1fr 130px 1fr' }}>
                <label className="form-label">프로젝트ID</label>
                <span style={{ fontSize: '12px' }}>{project.id}</span>
                <label className="form-label">사업유형</label>
                <span style={{ fontSize: '12px' }}>{project.type}</span>
                <label className="form-label">에너지사용자</label>
                <span style={{ fontSize: '12px' }}>{project.energyUser}</span>
                <label className="form-label">담당자</label>
                <span style={{ fontSize: '12px' }}>{project.manager}</span>
                <label className="form-label">착공일</label>
                <span style={{ fontSize: '12px' }}>{project.startDate ? formatDate(project.startDate) : '-'}</span>
                <label className="form-label">준공일</label>
                <span style={{ fontSize: '12px' }}>{project.endDate ? formatDate(project.endDate) : '-'}</span>
                <label className="form-label">총 사업비</label>
                <span style={{ fontSize: '12px', fontWeight: '700' }}>{formatAmount(project.projectCost)}</span>
                <label className="form-label">총 투자비</label>
                <span style={{ fontSize: '12px', fontWeight: '700' }}>{formatAmount(project.investmentCost)}</span>
              </div>
            </div>
          )}

          {/* 계약 탭 */}
          {activeTab === 'contract' && (
            <div>
              <div className="title-row-wrap"><h3>계약 현황</h3></div>
              <div className="tab-list" style={{ marginBottom: '1rem' }}>
                <button className={`tab-btn ${contractSubTab === 'award' ? 'active' : ''}`} onClick={() => setContractSubTab('award')}>수주계약</button>
                <button className={`tab-btn ${contractSubTab === 'order' ? 'active' : ''}`} onClick={() => setContractSubTab('order')}>발주계약</button>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>계약명</th>
                      <th style={{ textAlign: 'left' }}>상대방</th>
                      <th style={{ textAlign: 'right' }}>계약금액</th>
                      <th>계약일</th>
                      <th>상태</th>
                      <th>보기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(contractSubTab === 'award' ? awardContracts : orderContracts).map((c) => (
                      <tr key={c.id}>
                        <td className="text-left">{c.name}</td>
                        <td className="text-left">{c.counterparty}</td>
                        <td className="text-right">{formatAmount(c.amount)}</td>
                        <td className="text-center">{formatDate(c.date)}</td>
                        <td className="text-center">
                          <StatusBadge type="custom" value={c.status} customLabel={c.status} customBg="#d1e7dd" customText="#0a3622" />
                        </td>
                        <td className="text-center">
                          <button className="btn type-05">보기</button>
                        </td>
                      </tr>
                    ))}
                    {(contractSubTab === 'award' ? awardContracts : orderContracts).length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>계약 정보가 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 투자비 탭 */}
          {activeTab === 'invest' && (
            <div>
              <div className="title-row-wrap">
                <h3>투자비 지급 현황</h3>
                <button className="btn" onClick={() => setInvestModalOpen(true)}>+ 지급 등록</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { label: '총 투자비', value: formatAmount(totalInvest) },
                  { label: '지급액', value: formatAmount(paidInvest) },
                  { label: '잔여액', value: formatAmount(remainInvest) },
                  { label: '지급률', value: `${investRate}%` },
                ].map((kpi) => (
                  <div key={kpi.label} className="kpi-card">
                    <div className="kpi-label">{kpi.label}</div>
                    <div className="kpi-value" style={{ fontSize: '14px', color: '#00a7ea' }}>{kpi.value}</div>
                  </div>
                ))}
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>순번</th>
                      <th style={{ textAlign: 'left' }}>지급구분</th>
                      <th style={{ textAlign: 'left' }}>협력업체</th>
                      <th style={{ textAlign: 'right' }}>공급액</th>
                      <th style={{ textAlign: 'right' }}>부가세</th>
                      <th style={{ textAlign: 'right' }}>합계</th>
                      <th>지급일</th>
                      <th>ERP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectInvestments.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>투자비 지급 내역이 없습니다.</td></tr>
                    ) : (
                      projectInvestments.map((inv, i) => (
                        <tr key={inv.id}>
                          <td className="text-center">{i + 1}</td>
                          <td className="text-left">{inv.category}</td>
                          <td className="text-left">{inv.contractor}</td>
                          <td className="text-right">{inv.supplyAmt > 0 ? inv.supplyAmt.toLocaleString('ko-KR') : '-'}</td>
                          <td className="text-right">{inv.tax > 0 ? inv.tax.toLocaleString('ko-KR') : '-'}</td>
                          <td className="text-right">{inv.total > 0 ? formatAmount(inv.total) : '-'}</td>
                          <td className="text-center">{inv.payDate || '-'}</td>
                          <td className="text-center">
                            <span style={{ fontSize: '11px', color: inv.status === 'SYNCED' ? '#0a3622' : '#6c757d', fontWeight: '700' }}>
                              {inv.status === 'SYNCED' ? '✓' : '○'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 세금계산서 탭 */}
          {activeTab === 'invoice' && (
            <div>
              <div className="title-row-wrap">
                <h3>세금계산서 (WEHAGO 연동)</h3>
                <button className="btn type-04">엑셀내보내기</button>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>회차</th>
                      <th>발행일</th>
                      <th style={{ textAlign: 'right' }}>공급가액</th>
                      <th style={{ textAlign: 'right' }}>세액</th>
                      <th style={{ textAlign: 'right' }}>합계</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectInvoices.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>세금계산서 내역이 없습니다.</td></tr>
                    ) : (
                      projectInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="text-center">{inv.round}회차</td>
                          <td className="text-center">{formatDate(inv.issueDate)}</td>
                          <td className="text-right">{inv.supplyAmount.toLocaleString('ko-KR')}원</td>
                          <td className="text-right">{inv.taxAmount.toLocaleString('ko-KR')}원</td>
                          <td className="text-right">{formatAmount(inv.supplyAmount + inv.taxAmount)}</td>
                          <td className="text-center">
                            <StatusBadge
                              type="custom"
                              value={inv.status}
                              customLabel={inv.status}
                              customBg={inv.status === '발행완료' ? '#d1e7dd' : '#e2e3e5'}
                              customText={inv.status === '발행완료' ? '#0a3622' : '#383d41'}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 상환 탭 */}
          {activeTab === 'repayment' && (
            <div>
              <div className="title-row-wrap">
                <h3>상환 현황</h3>
                <div className="button-wrap">
                  <button className="btn type-02">상환 헤더</button>
                  <button className="btn type-02">스케줄 생성</button>
                  <button className="btn type-04">엑셀</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { label: '총 상환예정금액', value: formatAmount(totalRepayAmt) },
                  { label: '상환완료금액', value: formatAmount(repaidAmt) },
                  { label: '미회수금액', value: formatAmount(uncollectedAmt) },
                  { label: '회수율', value: `${recoveryRate}%` },
                ].map((kpi) => (
                  <div key={kpi.label} className="kpi-card">
                    <div className="kpi-label">{kpi.label}</div>
                    <div className="kpi-value" style={{ fontSize: '14px', color: '#00a7ea' }}>{kpi.value}</div>
                  </div>
                ))}
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>회차</th>
                      <th>상환예정일</th>
                      <th style={{ textAlign: 'right' }}>상환예정금액</th>
                      <th>세금계산서발행일</th>
                      <th>상태</th>
                      <th>처리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectRepayments.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>상환 스케줄이 없습니다.</td></tr>
                    ) : (
                      projectRepayments.map((r) => {
                        const matchedInvoice = projectInvoices.find((inv) => inv.round === r.round);
                        return (
                          <tr key={r.id} style={{ background: r.status === 'UNPAID' ? '#fff2f4' : undefined }}>
                            <td className="text-center">{r.round}회차</td>
                            <td className="text-center">{formatDate(r.billingDate)}</td>
                            <td className="text-right">{formatAmount(r.billingAmount)}</td>
                            <td className="text-center">{matchedInvoice ? formatDate(matchedInvoice.issueDate) : '-'}</td>
                            <td className="text-center"><StatusBadge type="repayment" value={r.status} /></td>
                            <td className="text-center">
                              {r.status === 'UNPAID' && (
                                <button className="btn type-05" onClick={() => { setSelectedRepaymentRound(r.round); setRepaymentModalOpen(true); }}>처리</button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 미회수 탭 */}
          {activeTab === 'uncollected' && (
            <div>
              <div className="title-row-wrap"><h3>미회수 현황</h3></div>
              <div className="content-box-wrap" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['RED', 'ORANGE', 'YELLOW'].map((level) => {
                  const count = projectUncollected.filter((u) => u.alertLevel === level).length;
                  const colors = { RED: { bg: '#f8d7da', text: '#721c24' }, ORANGE: { bg: '#fff3cd', text: '#856404' }, YELLOW: { bg: '#fff9c4', text: '#856404' } };
                  const c = colors[level as keyof typeof colors];
                  return (
                    <span key={level} style={{ background: c.bg, color: c.text, padding: '2px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                      {level} {count}건
                    </span>
                  );
                })}
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>회차</th>
                      <th>청구일</th>
                      <th style={{ textAlign: 'right' }}>미회수금액</th>
                      <th>경과일수</th>
                      <th>경보레벨</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectUncollected.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>미회수 현황이 없습니다.</td></tr>
                    ) : (
                      projectUncollected.map((u) => {
                        const matchedRepayment = projectRepayments.find((r) => r.round === u.round);
                        const billingDate = matchedRepayment ? formatDate(matchedRepayment.billingDate) : '-';
                        return (
                          <tr key={u.projectId + u.round}>
                            <td className="text-center">{u.round}회차</td>
                            <td className="text-center">{billingDate}</td>
                            <td className="text-right">{formatAmount(u.amount)}</td>
                            <td className="text-center" style={{ color: '#dc3545', fontWeight: '700' }}>D+{u.elapsedDays}</td>
                            <td className="text-center"><StatusBadge type="alert" value={u.alertLevel} /></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상태변경 Modal */}
      <ModalDialog isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="상태 변경" size="sm"
        footer={<><button className="btn type-02" onClick={() => setStatusModalOpen(false)}>취소</button><button className="btn" onClick={() => setStatusModalOpen(false)}>저장</button></>}
      >
        <div style={{ fontSize: '12px' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.375rem' }}>변경할 상태</label>
            <select style={{ width: '100%' }}>
              <option>공사 (CONSTRUCTION)</option>
              <option>상환중 (REPAYMENT)</option>
              <option>해지 (TERMINATED)</option>
              <option>사업종료 (COMPLETED)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem' }}>변경 사유 <span style={{ color: '#ff0b3a' }}>*</span></label>
            <textarea style={{ width: '100%' }} placeholder="변경 사유를 10자 이상 입력하세요" />
          </div>
        </div>
      </ModalDialog>

      {/* 투자비 등록 Modal */}
      <ModalDialog isOpen={investModalOpen} onClose={() => setInvestModalOpen(false)} title="투자비 지급 등록" size="md"
        footer={<><button className="btn type-02" onClick={() => setInvestModalOpen(false)}>취소</button><button className="btn" onClick={() => setInvestModalOpen(false)}>저장</button></>}
      >
        <div className="form-grid">
          <label className="form-label required">지급구분</label>
          <select value={investCategory} onChange={(e) => setInvestCategory(e.target.value)}>
            <option>기성금</option>
            <option>준공금</option>
          </select>
          <label className="form-label required">지급금액</label>
          <input type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} placeholder="원 단위 입력" />
          <label className="form-label required">지급일</label>
          <input type="date" value={investDate} onChange={(e) => setInvestDate(e.target.value)} />
        </div>
      </ModalDialog>

      {/* 상환처리 Modal */}
      <ModalDialog isOpen={repaymentModalOpen} onClose={() => setRepaymentModalOpen(false)} title={`상환 처리 — ${selectedRepaymentRound}회차`} size="md"
        footer={<><button className="btn type-02" onClick={() => setRepaymentModalOpen(false)}>취소</button><button className="btn" onClick={() => setRepaymentModalOpen(false)}>저장</button></>}
      >
        <div style={{ fontSize: '12px' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.375rem' }}>처리유형</label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><input type="radio" name="repType" defaultChecked /> 유보등록</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><input type="radio" name="repType" /> 비정상상환</label>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem' }}>유보사유 <span style={{ color: '#ff0b3a' }}>*</span></label>
            <textarea style={{ width: '100%' }} placeholder="유보 사유를 10자 이상 입력하세요" />
          </div>
        </div>
      </ModalDialog>

      {/* 수정이력 Drawer */}
      <DrawerPanel isOpen={historyDrawerOpen} onClose={() => setHistoryDrawerOpen(false)} title="수정이력" width={480}>
        <table className="data-table">
          <thead>
            <tr>
              <th>변경일</th>
              <th>항목</th>
              <th style={{ textAlign: 'left' }}>변경 전</th>
              <th style={{ textAlign: 'left' }}>변경 후</th>
            </tr>
          </thead>
          <tbody>
            {mockEditHistory.map((h, i) => (
              <tr key={i}>
                <td className="text-center">{h.date}</td>
                <td className="text-center">{h.field}</td>
                <td className="text-left" style={{ color: '#6c757d' }}>{h.before}</td>
                <td className="text-left" style={{ color: '#00a7ea', fontWeight: '700' }}>{h.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DrawerPanel>
    </div>
  );
}
