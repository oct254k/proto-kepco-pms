'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormStepper from '@/components/common/FormStepper';
import ModalDialog from '@/components/common/ModalDialog';
import { mockContractors } from '@/lib/mock-data/contractors';

const STEPS = [
  { label: '사업유형' },
  { label: '기본정보' },
  { label: '계약정보' },
  { label: '검토·제출' },
  { label: '발주요청' },
];

// Mock 에너지사용자 데이터
const MOCK_ENERGY_USERS = [
  { id: 'EU-001', name: '(주)광명전기', bizNo: '123-45-67890' },
  { id: 'EU-002', name: '한국철강(주)', bizNo: '234-56-78901' },
  { id: 'EU-003', name: '인천항만공사', bizNo: '345-67-89012' },
  { id: 'EU-004', name: '서울특별시', bizNo: '456-78-90123' },
  { id: 'EU-005', name: '롯데쇼핑(주)', bizNo: '567-89-01234' },
];

interface ProcurementItem {
  id: number;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
}

interface ProcurementOrder {
  id: number;
  method: string;
  items: ProcurementItem[];
  vendors: typeof mockContractors;
  qualification: string;
}

// STEP 4 승인 여부 (Mock: 실제 연동 전까지 true로 고정)
const MOCK_STEP4_APPROVED = true;

export default function OpportunityNewPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // STEP 1
  const [bizType, setBizType] = useState<'3자간' | '용역' | ''>('');
  const [deliberation, setDeliberation] = useState<'Y' | 'N' | ''>('');

  // STEP 2
  const [energyUser, setEnergyUser] = useState('');
  const [projectName, setProjectName] = useState('');
  const [manager, setManager] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectCost, setProjectCost] = useState('');
  const [epcName, setEpcName] = useState('');
  const [epcBizNo, setEpcBizNo] = useState('');
  const [errors2, setErrors2] = useState<Record<string, string>>({});

  // STEP 3
  const [contractName, setContractName] = useState('');
  const [contractType, setContractType] = useState('ESCO계약');
  const [contractAmount, setContractAmount] = useState('');
  const [contractPeriod, setContractPeriod] = useState('');
  const [exemptReason, setExemptReason] = useState('');
  const [deliberationDocFiles, setDeliberationDocFiles] = useState<File[]>([]);

  // STEP 4 — 검토·제출
  const [attachFiles, setAttachFiles] = useState<{ contract: File[]; deliberation: File[]; bizReg: File[] }>({
    contract: [], deliberation: [], bizReg: [],
  });
  const [confirmChecked, setConfirmChecked] = useState(false);

  // STEP 5
  const [orders, setOrders] = useState<ProcurementOrder[]>([
    { id: 1, method: '경쟁입찰', items: [{ id: 1, name: '', unit: '식', qty: 1, unitPrice: 0 }], vendors: [], qualification: '' },
  ]);
  const [vendorSearchOpen, setVendorSearchOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [euSearchOpen, setEuSearchOpen] = useState(false);
  const [euSearchKeyword, setEuSearchKeyword] = useState('');

  // Toast 상태
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 유효성 검사 STEP 1
  const validateStep1 = () => bizType !== '' && deliberation !== '';

  // 유효성 검사 STEP 2
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!energyUser) errs.energyUser = '에너지사용자를 선택하세요.';
    if (!projectName) errs.projectName = '사업명을 입력하세요.';
    if (!manager) errs.manager = '담당자를 입력하세요.';
    if (bizType === '3자간' && !epcName) errs.epcName = 'EPC사명을 입력하세요.';
    setErrors2(errs);
    return Object.keys(errs).length === 0;
  };

  // 유효성 검사 STEP 4
  const validateStep4 = () => {
    if (!confirmChecked) return false;
    if (attachFiles.contract.length === 0) return false;
    if (deliberation === 'Y' && attachFiles.deliberation.length === 0) return false;
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleTempSave = () => {
    showToast('임시저장되었습니다.', 'success');
  };

  // 발주요청 예상계약금액 자동계산
  const calcOrderTotal = (order: ProcurementOrder) =>
    order.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  const addOrder = () => {
    const newId = Math.max(...orders.map((o) => o.id)) + 1;
    setOrders([...orders, {
      id: newId, method: '경쟁입찰',
      items: [{ id: 1, name: '', unit: '식', qty: 1, unitPrice: 0 }],
      vendors: [], qualification: '',
    }]);
  };

  const removeOrder = (orderId: number) => {
    setOrders(orders.filter((o) => o.id !== orderId));
  };

  const updateOrder = (orderId: number, field: string, value: string) => {
    setOrders(orders.map((o) => o.id === orderId ? { ...o, [field]: value } : o));
  };

  const addItem = (orderId: number) => {
    setOrders(orders.map((o) => {
      if (o.id !== orderId) return o;
      const newItemId = Math.max(...o.items.map((i) => i.id)) + 1;
      return { ...o, items: [...o.items, { id: newItemId, name: '', unit: '식', qty: 1, unitPrice: 0 }] };
    }));
  };

  const removeItem = (orderId: number, itemId: number) => {
    setOrders(orders.map((o) => {
      if (o.id !== orderId) return o;
      return { ...o, items: o.items.filter((i) => i.id !== itemId) };
    }));
  };

  const updateItem = (orderId: number, itemId: number, field: string, value: string | number) => {
    setOrders(orders.map((o) => {
      if (o.id !== orderId) return o;
      return { ...o, items: o.items.map((i) => i.id === itemId ? { ...i, [field]: value } : i) };
    }));
  };

  const addVendorToOrder = (orderId: number, vendor: typeof mockContractors[0]) => {
    setOrders(orders.map((o) => {
      if (o.id !== orderId) return o;
      if (o.vendors.find((v) => v.id === vendor.id)) return o;
      if (o.vendors.length >= 5) return o;
      return { ...o, vendors: [...o.vendors, vendor] };
    }));
  };

  const removeVendorFromOrder = (orderId: number, vendorId: string) => {
    setOrders(orders.map((o) => {
      if (o.id !== orderId) return o;
      return { ...o, vendors: o.vendors.filter((v) => v.id !== vendorId) };
    }));
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'success' ? '#155724' : '#721c24',
          color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '0.375rem',
          fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {toast.type === 'success' ? '✔' : '✖'} {toast.message}
        </div>
      )}

      <div className="breadcrumb-container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">홈</li>
          <li className="breadcrumb-item">사업 기회관리</li>
          <li className="breadcrumb-item active">Funnel 등록·발주요청</li>
        </ol>
      </div>
      <div className="content-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Funnel 등록·발주요청</h2>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button className="btn type-02" onClick={handleTempSave}>임시저장</button>
          <button className="btn type-02" onClick={() => router.push('/opportunity')}>닫기</button>
        </div>
      </div>

      <div className="content-wrap">
        {/* Stepper */}
        <div className="content-box-wrap type-02">
          <FormStepper steps={STEPS} currentStep={step} />
        </div>

        {/* STEP 1 */}
        {step === 0 && (
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap"><h3>STEP 1 — 사업유형 선택</h3></div>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {(['3자간', '용역'] as const).map((t) => (
                <div
                  key={t}
                  onClick={() => setBizType(t)}
                  style={{
                    border: `2px solid ${bizType === t ? 'var(--color-primary)' : '#dee2e6'}`,
                    borderRadius: '0.5rem',
                    padding: '1.5rem 2rem',
                    cursor: 'pointer',
                    minWidth: 200,
                    background: bizType === t ? '#e8f4fd' : '#fff',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '0.5rem' }}>{t} 계약</div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>
                    {t === '3자간' ? '에너지사용자 + 시공사 참여' : '용역·서비스 중심'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '12px' }}>심의 대상 여부 <span style={{ color: '#ff0b3a' }}>*</span></div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {(['Y', 'N'] as const).map((v) => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
                    <input type="radio" name="deliberation" checked={deliberation === v} onChange={() => setDeliberation(v)} />
                    {v === 'Y' ? '심의 대상' : '심의 면제'}
                  </label>
                ))}
              </div>
            </div>

            {!validateStep1() && bizType === '' && (
              <p style={{ color: '#dc3545', fontSize: '11px' }}>사업유형을 선택하세요.</p>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap"><h3>STEP 2 — 기본정보 입력</h3></div>
            <div className="form-grid">
              {/* 에너지사용자 */}
              <label className="form-label required">에너지사용자</label>
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <input
                  type="text"
                  style={{ flex: 1 }}
                  value={energyUser}
                  onChange={(e) => setEnergyUser(e.target.value)}
                  placeholder="에너지사용자명"
                  readOnly
                  className={`${errors2.energyUser ? 'error' : ''}`}
                />
                <button className="btn type-05" onClick={() => setEuSearchOpen(true)}>찾기</button>
              </div>
              {errors2.energyUser && <><span /><span style={{ color: '#dc3545', fontSize: '11px' }}>{errors2.energyUser}</span></>}

              {/* 사업명 */}
              <label className="form-label required">사업명</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="사업명을 입력하세요"
                className={errors2.projectName ? 'error' : ''}
              />
              {errors2.projectName && <><span /><span style={{ color: '#dc3545', fontSize: '11px' }}>{errors2.projectName}</span></>}

              {/* 담당자 */}
              <label className="form-label required">담당자</label>
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <input
                  type="text"
                  style={{ flex: 1 }}
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="담당자 검색"
                  readOnly
                  className={errors2.manager ? 'error' : ''}
                />
                <button className="btn type-05" onClick={() => setUserSearchOpen(true)}>찾기</button>
              </div>
              {errors2.manager && <><span /><span style={{ color: '#dc3545', fontSize: '11px' }}>{errors2.manager}</span></>}

              {/* 예상착공일 */}
              <label className="form-label">예상착공일</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

              {/* 예상준공일 */}
              <label className="form-label">예상준공일</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

              {/* 예상사업비 */}
              <label className="form-label">예상사업비</label>
              <input
                type="number"
                value={projectCost}
                onChange={(e) => setProjectCost(e.target.value)}
                placeholder="원 단위 입력"
              />
            </div>

            {/* EPC사 정보 (3자간일 때만) */}
            {bizType === '3자간' && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '0.75rem', color: '#333' }}>
                  시공사(EPC사) 정보
                </div>
                <div className="form-grid">
                  <label className="form-label required">시공사명</label>
                  <input
                    type="text"
                    value={epcName}
                    onChange={(e) => setEpcName(e.target.value)}
                    placeholder="시공사명 입력"
                    className={errors2.epcName ? 'error' : ''}
                  />
                  {errors2.epcName && <><span /><span style={{ color: '#dc3545', fontSize: '11px' }}>{errors2.epcName}</span></>}
                  <label className="form-label">사업자번호</label>
                  <input
                    type="text"
                    value={epcBizNo}
                    onChange={(e) => setEpcBizNo(e.target.value)}
                    placeholder="000-00-00000"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap"><h3>STEP 3 — 계약정보</h3></div>
            <div className="form-grid">
              <label className="form-label required">계약명</label>
              <input
                type="text"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="계약명 입력"
              />
              <label className="form-label">계약형태</label>
              <select value={contractType} onChange={(e) => setContractType(e.target.value)}>
                <option>ESCO계약</option>
                <option>도급계약</option>
                <option>위탁계약</option>
              </select>
              <label className="form-label">예상계약금액</label>
              <input
                type="number"
                value={contractAmount}
                onChange={(e) => setContractAmount(e.target.value)}
                placeholder="원 단위"
              />
              <label className="form-label">계약기간</label>
              <input
                type="text"
                value={contractPeriod}
                onChange={(e) => setContractPeriod(e.target.value)}
                placeholder="예: 2026-01-01 ~ 2031-12-31"
              />
            </div>

            {/* 심의 분기 */}
            <div style={{
              border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '1rem', marginTop: '1.5rem',
            }}>
              <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '0.75rem' }}>심의 대상 여부</div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
                {(['Y', 'N'] as const).map((v) => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
                    <input type="radio" name="deliberation3" checked={deliberation === v} onChange={() => setDeliberation(v)} />
                    {v === 'Y' ? '심의 대상' : '심의 면제'}
                  </label>
                ))}
              </div>
              {deliberation === 'Y' && (
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '0.375rem', fontWeight: '700' }}>
                    사업추진계획(안) 첨부 <span style={{ color: '#ff0b3a' }}>*</span>
                    <span style={{ fontSize: '10px', color: '#6c757d', fontWeight: 400, marginLeft: '0.375rem' }}>(PDF/HWP/DOC, 최대 50MB)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.hwp,.doc,.docx"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      setDeliberationDocFiles((prev) => [...prev, ...files]);
                      e.target.value = '';
                    }}
                  />
                  {deliberationDocFiles.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '11px' }}>
                      <span>{f.name}</span>
                      <button
                        className="btn type-05"
                        style={{ height: 18, fontSize: 10 }}
                        onClick={() => setDeliberationDocFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      >삭제</button>
                    </div>
                  ))}
                </div>
              )}
              {deliberation === 'N' && (
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '0.375rem' }}>면제 사유 <span style={{ color: '#ff0b3a' }}>*</span></label>
                  <textarea
                    style={{ width: '100%', height: 80 }}
                    value={exemptReason}
                    onChange={(e) => setExemptReason(e.target.value)}
                    placeholder="심의 면제 사유를 입력하세요 (10자 이상)"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 — 검토·제출 */}
        {step === 3 && (
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap"><h3>STEP 4 — 검토·제출</h3></div>

            {/* 입력 요약 */}
            <div className="content-box-wrap" style={{ marginBottom: '1rem', fontSize: '12px' }}>
              <strong>입력 내용 요약</strong><br />
              사업유형: {bizType} &nbsp;|&nbsp; 에너지사용자: {energyUser || '-'} &nbsp;|&nbsp; 심의: {deliberation === 'Y' ? '대상' : deliberation === 'N' ? '면제' : '-'}<br />
              사업명: {projectName || '-'} &nbsp;|&nbsp; 계약형태: {contractType} &nbsp;|&nbsp; 예상사업비: {projectCost ? Number(projectCost).toLocaleString('ko-KR') + '원' : '-'}
            </div>

            {/* 필수 첨부파일 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '0.75rem' }}>필수 첨부파일</div>

              {/* 계약서 */}
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>① 계약서</span>
                  <span style={{ fontSize: '10px', color: '#dc3545' }}>* 필수</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.hwp,.doc,.docx"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);
                    setAttachFiles((prev) => ({ ...prev, contract: [...prev.contract, ...files] }));
                    e.target.value = '';
                  }}
                />
                {attachFiles.contract.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '11px' }}>
                    <span>{f.name}</span>
                    <button className="btn type-05" style={{ height: 18, fontSize: 10 }}
                      onClick={() => setAttachFiles((prev) => ({ ...prev, contract: prev.contract.filter((_, idx) => idx !== i) }))}>삭제</button>
                  </div>
                ))}
              </div>

              {/* 심의결과문서 (심의대상 시만 필수) */}
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>② 심의결과문서</span>
                  {deliberation === 'Y'
                    ? <span style={{ fontSize: '10px', color: '#dc3545' }}>* 심의대상 필수</span>
                    : <span style={{ fontSize: '10px', color: '#6c757d' }}>선택</span>}
                </div>
                <input
                  type="file"
                  accept=".pdf,.hwp,.doc,.docx"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);
                    setAttachFiles((prev) => ({ ...prev, deliberation: [...prev.deliberation, ...files] }));
                    e.target.value = '';
                  }}
                />
                {attachFiles.deliberation.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '11px' }}>
                    <span>{f.name}</span>
                    <button className="btn type-05" style={{ height: 18, fontSize: 10 }}
                      onClick={() => setAttachFiles((prev) => ({ ...prev, deliberation: prev.deliberation.filter((_, idx) => idx !== i) }))}>삭제</button>
                  </div>
                ))}
              </div>

              {/* 사업자등록증 */}
              <div style={{ padding: '0.75rem', border: '1px solid #dee2e6', borderRadius: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>③ 사업자등록증</span>
                  <span style={{ fontSize: '10px', color: '#6c757d' }}>선택</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.hwp,.doc,.docx"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);
                    setAttachFiles((prev) => ({ ...prev, bizReg: [...prev.bizReg, ...files] }));
                    e.target.value = '';
                  }}
                />
                {attachFiles.bizReg.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '11px' }}>
                    <span>{f.name}</span>
                    <button className="btn type-05" style={{ height: 18, fontSize: 10 }}
                      onClick={() => setAttachFiles((prev) => ({ ...prev, bizReg: prev.bizReg.filter((_, idx) => idx !== i) }))}>삭제</button>
                  </div>
                ))}
              </div>
            </div>

            {/* 제출 전 확인 체크박스 */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '12px' }}>
              <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} />
              기입 내용이 정확함을 확인합니다.
            </label>
            {!confirmChecked && attachFiles.contract.length === 0 && (
              <p style={{ fontSize: '11px', color: '#6c757d', marginTop: '0.375rem' }}>
                계약서 첨부 및 확인 체크 후 제출이 가능합니다.
              </p>
            )}
          </div>
        )}

        {/* STEP 5 — 발주요청 */}
        {step === 4 && (
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>STEP 5 — 발주요청</h3>
              {MOCK_STEP4_APPROVED && (
                <button className="btn type-02" onClick={addOrder}>+ 발주요청 추가</button>
              )}
            </div>

            {/* STEP4 미승인 안내 배너 */}
            {!MOCK_STEP4_APPROVED && (
              <div style={{
                background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '0.25rem',
                padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '12px', color: '#856404',
              }}>
                ⚠ 수주계약 체결이 완료되지 않았습니다.<br />
                STEP 4 결재 승인 → 수주계약 체결 + PROJECT 생성 완료 후 발주요청을 작성할 수 있습니다.
              </div>
            )}

            {/* STEP4 승인 완료 안내 */}
            {MOCK_STEP4_APPROVED && (
              <div style={{
                background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '0.25rem',
                padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '12px', color: '#155724',
              }}>
                ✅ 수주계약 체결 완료 / PROJECT 생성 완료 — 아래 발주요청을 1건 이상 작성하여 SRM으로 전송하세요.
              </div>
            )}

            {orders.map((order, oidx) => (
              <div
                key={order.id}
                style={{
                  border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '1rem', marginBottom: '1rem',
                  opacity: MOCK_STEP4_APPROVED ? 1 : 0.5, pointerEvents: MOCK_STEP4_APPROVED ? 'auto' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '12px' }}>발주요청-{oidx + 1}</strong>
                  {orders.length > 1 && (
                    <button className="btn type-02 type-05" onClick={() => removeOrder(order.id)}>삭제</button>
                  )}
                </div>

                {/* 조달방식 */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '0.375rem' }}>조달방식 <span style={{ color: '#ff0b3a' }}>*</span></div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {['경쟁입찰', '수의계약', '제한경쟁', '2단계입찰', '적격심사'].map((m) => (
                      <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '12px' }}>
                        <input
                          type="radio"
                          name={`method-${order.id}`}
                          checked={order.method === m}
                          onChange={() => updateOrder(order.id, 'method', m)}
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 예상 품목 테이블 */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700' }}>예상 품목</span>
                    <button className="btn type-05" onClick={() => addItem(order.id)}>+ 행 추가</button>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>품목명</th>
                        <th>단위</th>
                        <th>수량</th>
                        <th style={{ textAlign: 'right' }}>단가</th>
                        <th style={{ textAlign: 'right' }}>합계</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="text"
                              style={{ width: '100%' }}
                              value={item.name}
                              onChange={(e) => updateItem(order.id, item.id, 'name', e.target.value)}
                              placeholder="품목명"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              style={{ width: 50 }}
                              value={item.unit}
                              onChange={(e) => updateItem(order.id, item.id, 'unit', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              style={{ width: 60 }}
                              value={item.qty}
                              min={1}
                              onChange={(e) => updateItem(order.id, item.id, 'qty', Number(e.target.value))}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <input
                              type="number"
                              style={{ width: 100, textAlign: 'right' }}
                              value={item.unitPrice}
                              min={0}
                              onChange={(e) => updateItem(order.id, item.id, 'unitPrice', Number(e.target.value))}
                            />
                          </td>
                          <td className="text-right">{(item.qty * item.unitPrice).toLocaleString('ko-KR')}</td>
                          <td className="text-center">
                            {order.items.length > 1 && (
                              <button className="btn type-05" style={{ fontSize: 10 }} onClick={() => removeItem(order.id, item.id)}>×</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'right', fontWeight: '700', padding: '0.5rem 0.75rem' }}>예상 계약금액</td>
                        <td className="text-right" style={{ fontWeight: '700', color: '#00a7ea' }}>
                          {calcOrderTotal(order).toLocaleString('ko-KR')}원
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* 참여업체 Pool */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700' }}>참여업체 Pool (최대 5개)</span>
                    <button
                      className="btn type-05"
                      disabled={order.vendors.length >= 5}
                      onClick={() => { setCurrentOrderId(order.id); setVendorSearchOpen(true); }}
                    >
                      업체 추가
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {order.vendors.map((v) => (
                      <span
                        key={v.id}
                        style={{
                          background: '#e8f4fd', border: '1px solid #00a7ea', borderRadius: '20px',
                          padding: '2px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}
                      >
                        {v.name}
                        <button
                          onClick={() => removeVendorFromOrder(order.id, v.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontWeight: '700', lineHeight: 1 }}
                        >×</button>
                      </span>
                    ))}
                    {order.vendors.length === 0 && <span style={{ color: '#6c757d', fontSize: '11px' }}>업체를 추가하세요</span>}
                  </div>
                </div>

                {/* 자격요건 */}
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '0.375rem', fontWeight: '700' }}>자격요건</label>
                  <textarea
                    style={{ width: '100%' }}
                    value={order.qualification}
                    onChange={(e) => updateOrder(order.id, 'qualification', e.target.value)}
                    placeholder="참여업체 자격요건을 입력하세요"
                  />
                </div>
              </div>
            ))}

            <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '0.5rem' }}>
              ※ 각 발주요청은 개별적으로 SRM에 전송됩니다. &nbsp; ※ 각 발주요청 = Pipeline 카드 1장 생성
            </div>
          </div>
        )}

        {/* 하단 네비게이션 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {step > 0 && (
              <button className="btn type-02" onClick={handlePrev}>← 이전</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button className="btn type-02" onClick={handleTempSave}>임시저장</button>
            {step < STEPS.length - 2 && (
              /* STEP 1~3: 다음 버튼 */
              <button className="btn" onClick={handleNext}>다음 →</button>
            )}
            {step === STEPS.length - 2 && (
              /* STEP 4: 제출 버튼 */
              <button
                className="btn type-03"
                disabled={!validateStep4()}
                style={{ opacity: validateStep4() ? 1 : 0.5 }}
                onClick={() => {
                  if (!validateStep4()) return;
                  showToast('제출되었습니다. 그룹웨어 결재 요청이 생성됩니다.', 'success');
                  // 제출 후 SUBMITTED 상태로 변경되고 SCR-P-03(Funnel 현황)으로 이동
                  setTimeout(() => router.push('/opportunity'), 1500);
                }}
              >
                제출 ✔
              </button>
            )}
            {step === STEPS.length - 1 && (
              /* STEP 5: 발주요청 전송 버튼 */
              <button
                className="btn type-03"
                disabled={!MOCK_STEP4_APPROVED}
                style={{ opacity: MOCK_STEP4_APPROVED ? 1 : 0.5 }}
                onClick={() => MOCK_STEP4_APPROVED && setSubmitModalOpen(true)}
              >
                전체 발주요청 전송 →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 에너지사용자 검색 팝업 */}
      <ModalDialog
        isOpen={euSearchOpen}
        onClose={() => setEuSearchOpen(false)}
        title="에너지사용자 검색"
        size="md"
      >
        <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.375rem' }}>
          <input
            type="text"
            value={euSearchKeyword}
            onChange={(e) => setEuSearchKeyword(e.target.value)}
            placeholder="업체명 또는 사업자번호"
            style={{ flex: 1 }}
          />
          <button className="btn type-05">검색</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>업체명</th>
              <th>사업자번호</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ENERGY_USERS
              .filter((u) => !euSearchKeyword || u.name.includes(euSearchKeyword) || u.bizNo.includes(euSearchKeyword))
              .map((u) => (
                <tr key={u.id}>
                  <td className="text-left">{u.name}</td>
                  <td className="text-center">{u.bizNo}</td>
                  <td className="text-center">
                    <button
                      className="btn type-05"
                      onClick={() => { setEnergyUser(u.name); setEuSearchOpen(false); }}
                    >선택</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </ModalDialog>

      {/* 담당자 검색 팝업 */}
      <ModalDialog
        isOpen={userSearchOpen}
        onClose={() => setUserSearchOpen(false)}
        title="담당자 검색"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['김민준', '이서연', '박지훈', '최수빈', '정다은', '한승우'].map((name) => (
            <button
              key={name}
              className="btn type-02"
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
              onClick={() => { setManager(name); setUserSearchOpen(false); }}
            >
              {name}
            </button>
          ))}
        </div>
      </ModalDialog>

      {/* 업체 검색 팝업 */}
      <ModalDialog
        isOpen={vendorSearchOpen}
        onClose={() => setVendorSearchOpen(false)}
        title="참여업체 검색"
        size="md"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>업체명</th>
              <th>신용등급</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody>
            {mockContractors.map((c) => (
              <tr key={c.id}>
                <td className="text-left">{c.name}</td>
                <td className="text-center">{c.creditGrade}</td>
                <td className="text-center">
                  <button
                    className="btn type-05"
                    onClick={() => {
                      if (currentOrderId !== null) addVendorToOrder(currentOrderId, c);
                      setVendorSearchOpen(false);
                    }}
                  >선택</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ModalDialog>

      {/* 발주요청 전송 확인 Modal */}
      <ModalDialog
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="발주요청 전송 확인"
        size="sm"
        footer={
          <>
            <button className="btn type-02" onClick={() => setSubmitModalOpen(false)}>취소</button>
            <button
              className="btn type-03"
              onClick={() => {
                setSubmitModalOpen(false);
                showToast(`${orders.length}건의 발주요청이 SRM으로 전송되었습니다.`, 'success');
                setTimeout(() => router.push('/pipeline'), 1000);
              }}
            >확인</button>
          </>
        }
      >
        <p style={{ fontSize: '12px', lineHeight: 1.8 }}>
          총 {orders.length}건의 발주요청을 SRM으로 전송합니다.<br />
          Pipeline 카드 {orders.length}장이 생성됩니다.<br />
          계속하시겠습니까?
        </p>
      </ModalDialog>
    </div>
  );
}
