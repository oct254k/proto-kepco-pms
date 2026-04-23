'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KanbanBoard from '@/components/common/KanbanBoard';
import DrawerPanel from '@/components/common/DrawerPanel';
import ModalDialog from '@/components/common/ModalDialog';
import StatusBadge from '@/components/common/StatusBadge';
import { mockPipelineCards } from '@/lib/mock-data/pipeline';
import { mockContractors } from '@/lib/mock-data/contractors';
import { formatAmountShort, formatAmount, formatDate, calcDday } from '@/lib/utils';
import { PipelineCard, PipelineStage } from '@/types';

const STAGES: PipelineStage[] = [
  '발주요청접수', '공고중', '제안서접수중', '기술평가', '가격평가', '낙찰', '계약체결',
];

const STAGE_INDEX: Record<PipelineStage, number> = {
  '발주요청접수': 0, '공고중': 1, '제안서접수중': 2, '기술평가': 3, '가격평가': 4, '낙찰': 5, '계약체결': 6,
};

type SrmItem = { name: string; unit: string; qty: number; unitPrice: number };
type SrmData = { announcement: string; items: SrmItem[]; announceDate: string; deadline: string; webhookAt: string };
type Vendor = { vendor: string; total: number; delivery: number; creditGrade: string; debtRatio: string; history: number };
type AwardData = { vendor: string; price: number; awardDate: string; confirmed: boolean };

// ── Mock SRM 데이터 (공고중 이상 모든 카드)
const MOCK_SRM_DATA: Record<string, SrmData> = {
  'PL-001': {
    announcement: '광명공장 LED 조명교체 사업 경쟁입찰 공고. 대상: 광명공장 생산동·사무동 전체 조명 설비 300세트 교체.',
    items: [{ name: 'LED 조명교체', unit: '세트', qty: 300, unitPrice: 600000 }],
    announceDate: '2025-03-01', deadline: '2025-05-30', webhookAt: '2025-03-01 09:12:04',
  },
  'PL-002': {
    announcement: '인천물류센터 ESS 설치 제한경쟁 입찰 공고. 대상: 리튬이온 배터리 ESS 500kWh 1식 설치 및 시운전.',
    items: [
      { name: 'ESS 본체 (500kWh)', unit: '식', qty: 1, unitPrice: 280000000 },
      { name: 'BMS 제어시스템', unit: '식', qty: 1, unitPrice: 40000000 },
    ],
    announceDate: '2025-03-15', deadline: '2025-06-15', webhookAt: '2025-03-15 14:05:22',
  },
  'PL-003': {
    announcement: '대전공장 HVAC 최적화 경쟁입찰 공고. 대상: 냉각탑 2대·AHU 3대 교체 및 인버터 제어 최적화.',
    items: [
      { name: '냉각탑 교체', unit: '대', qty: 2, unitPrice: 45000000 },
      { name: 'AHU 교체', unit: '대', qty: 3, unitPrice: 30000000 },
      { name: '인버터 제어반', unit: '식', qty: 1, unitPrice: 25000000 },
    ],
    announceDate: '2025-02-20', deadline: '2025-05-20', webhookAt: '2025-04-18 10:32:14',
  },
  'PL-004': {
    announcement: '수원사업장 옥상 태양광 설치 2단계 입찰 공고. 대상: 250kW급 태양광 발전 시스템 설계·공급·설치.',
    items: [
      { name: '태양광 패널 (250kW)', unit: '식', qty: 1, unitPrice: 380000000 },
      { name: '인버터 및 전력 변환 장치', unit: '식', qty: 1, unitPrice: 80000000 },
      { name: '구조물·배선 공사', unit: '식', qty: 1, unitPrice: 40000000 },
    ],
    announceDate: '2025-04-01', deadline: '2025-07-01', webhookAt: '2025-05-20 16:48:33',
  },
  'PL-006': {
    announcement: '창원공장 인버터 교체 제한경쟁 공고. 대상: 생산라인 모터 인버터 32대 교체 및 에너지 모니터링 시스템 구축.',
    items: [
      { name: '산업용 인버터 (75kW)', unit: '대', qty: 20, unitPrice: 8500000 },
      { name: '산업용 인버터 (45kW)', unit: '대', qty: 12, unitPrice: 5500000 },
      { name: 'EMS 소프트웨어', unit: '식', qty: 1, unitPrice: 40000000 },
    ],
    announceDate: '2025-03-10', deadline: '2025-06-01', webhookAt: '2025-04-25 11:20:05',
  },
  'PL-007': {
    announcement: '포항제철 폐열회수 설비 경쟁입찰 공고. 대상: 고로 폐열 ORC 발전 시스템 2,400kW급 1식 설계·공급·시운전.',
    items: [
      { name: 'ORC 발전 모듈 (1,200kW)', unit: '식', qty: 2, unitPrice: 1100000000 },
      { name: '열교환기 시스템', unit: '식', qty: 1, unitPrice: 150000000 },
      { name: '전기 공사 및 계통 연계', unit: '식', qty: 1, unitPrice: 50000000 },
    ],
    announceDate: '2025-04-15', deadline: '2025-07-10', webhookAt: '2025-04-15 09:00:00',
  },
  'PL-008': {
    announcement: '세종시청 옥상 태양광 발전소 적격심사 공고. 대상: 시청 본관·별관 옥상 합산 180kW 태양광 시스템.',
    items: [
      { name: '태양광 패널 (180kW)', unit: '식', qty: 1, unitPrice: 720000000 },
      { name: '계통 연계 공사', unit: '식', qty: 1, unitPrice: 60000000 },
    ],
    announceDate: '2025-03-20', deadline: '2025-06-20', webhookAt: '2025-03-20 10:00:00',
  },
  'PL-011': {
    announcement: '여수산단 압축공기 최적화 경쟁입찰 공고. 대상: 컴프레서 3대 인버터화 및 에어 모니터링 시스템 구축.',
    items: [
      { name: '인버터 컴프레서 (22kW)', unit: '대', qty: 3, unitPrice: 85000000 },
      { name: '공기압 모니터링 시스템', unit: '식', qty: 1, unitPrice: 25000000 },
      { name: '배관 개선 공사', unit: '식', qty: 1, unitPrice: 25000000 },
    ],
    announceDate: '2025-03-05', deadline: '2025-05-10', webhookAt: '2025-04-28 14:15:40',
  },
  'PL-012': {
    announcement: '안산공단 공조 에너지 절감 경쟁입찰 공고. 대상: 멀티형 에어컨 시스템 교체 및 스마트 제어 도입.',
    items: [
      { name: '멀티형 에어컨 (10HP)', unit: '대', qty: 8, unitPrice: 12000000 },
      { name: '스마트 제어 시스템', unit: '식', qty: 1, unitPrice: 19000000 },
    ],
    announceDate: '2025-03-25', deadline: '2025-05-25', webhookAt: '2025-04-22 09:44:11',
  },
  'PL-013': {
    announcement: 'KT 데이터센터 냉각 최적화 제한경쟁 공고. 대상: 1,000RT 칠러 시스템 2대 교체 및 AI 제어 최적화.',
    items: [
      { name: '고효율 칠러 (1,000RT)', unit: '대', qty: 2, unitPrice: 820000000 },
      { name: 'AI 냉각 제어 시스템', unit: '식', qty: 1, unitPrice: 120000000 },
      { name: '배관·전기 공사', unit: '식', qty: 1, unitPrice: 90000000 },
    ],
    announceDate: '2025-02-10', deadline: '2025-06-30', webhookAt: '2025-05-22 17:03:27',
  },
  'PL-014': {
    announcement: '롯데마트 냉동설비 절감 수의계약. 대상: 냉동 쇼케이스 인버터 제어 및 폐열 회수 시스템.',
    items: [
      { name: '인버터 냉동 제어 시스템', unit: '식', qty: 1, unitPrice: 380000000 },
      { name: '폐열 회수 유닛', unit: '식', qty: 1, unitPrice: 140000000 },
    ],
    announceDate: '2025-01-10', deadline: '2025-04-15', webhookAt: '2025-04-10 13:22:55',
  },
};

// ── Mock 참여업체 제안 데이터 (기술평가 이상 카드)
const MOCK_PROPOSALS: Record<string, Vendor[]> = {
  'PL-003': [
    { vendor: '(주)한빛전기',    total: 222000000, delivery: 90,  creditGrade: 'A-',  debtRatio: '68%',  history: 2 },
    { vendor: '에너지솔루션(주)', total: 205000000, delivery: 80,  creditGrade: 'BB+', debtRatio: '85%',  history: 3 },
    { vendor: '(주)그린테크',    total: 238000000, delivery: 100, creditGrade: 'A',   debtRatio: '55%',  history: 1 },
  ],
  'PL-006': [
    { vendor: '창원전력(주)',     total: 416000000, delivery: 75,  creditGrade: 'BBB', debtRatio: '72%',  history: 0 },
    { vendor: '(주)한빛전기',    total: 428000000, delivery: 60,  creditGrade: 'A-',  debtRatio: '68%',  history: 4 },
    { vendor: '스마트이에스(주)', total: 398000000, delivery: 85,  creditGrade: 'BB',  debtRatio: '91%',  history: 1 },
  ],
  'PL-011': [
    { vendor: '에너지솔루션(주)', total: 352000000, delivery: 70,  creditGrade: 'BB+', debtRatio: '85%',  history: 3 },
    { vendor: '(주)대한컴프레서', total: 345000000, delivery: 65,  creditGrade: 'BBB', debtRatio: '60%',  history: 2 },
  ],
  'PL-012': [
    { vendor: '(주)한빛전기',    total: 190000000, delivery: 50,  creditGrade: 'A-',  debtRatio: '68%',  history: 2 },
    { vendor: '(주)그린테크',    total: 185000000, delivery: 60,  creditGrade: 'A',   debtRatio: '55%',  history: 3 },
    { vendor: '에너지솔루션(주)', total: 198000000, delivery: 45,  creditGrade: 'BB+', debtRatio: '85%',  history: 1 },
  ],
  'PL-004': [
    { vendor: '스마트이에스(주)', total: 480000000, delivery: 120, creditGrade: 'BB',  debtRatio: '91%',  history: 1 },
    { vendor: '(주)솔라파워',    total: 510000000, delivery: 110, creditGrade: 'A-',  debtRatio: '62%',  history: 0 },
  ],
  'PL-013': [
    { vendor: '(주)그린테크',    total: 1790000000, delivery: 150, creditGrade: 'A',   debtRatio: '55%',  history: 1 },
    { vendor: '에너지솔루션(주)', total: 1850000000, delivery: 140, creditGrade: 'BB+', debtRatio: '85%',  history: 2 },
    { vendor: '쿨링테크(주)',     total: 1820000000, delivery: 160, creditGrade: 'BBB', debtRatio: '70%',  history: 0 },
  ],
  'PL-014': [
    { vendor: '에너지솔루션(주)', total: 510000000, delivery: 90,  creditGrade: 'BB+', debtRatio: '85%',  history: 3 },
  ],
};

// ── Mock 낙찰 결과
const MOCK_AWARD: Record<string, AwardData> = {
  'PL-004': { vendor: '스마트이에스(주)', price: 480000000, awardDate: '2025-05-28', confirmed: true },
  'PL-013': { vendor: '(주)그린테크',    price: 1790000000, awardDate: '2025-05-22', confirmed: false },
  'PL-014': { vendor: '에너지솔루션(주)', price: 510000000, awardDate: '2025-04-10', confirmed: true },
};

type DrawerTab = 'reception' | 'srm' | 'proposal' | 'award' | 'action';
type ViewMode = 'list' | 'kanban';

export default function PipelinePage() {
  const router = useRouter();

  // 뷰 모드
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // 단계 필터 (목록 뷰 카운트 카드 클릭)
  const [activeStage, setActiveStage] = useState<PipelineStage | null>(null);

  // 필터
  const [filterName, setFilterName] = useState('');
  const [filterManager, setFilterManager] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ name: '', manager: '', method: '' });

  // Drawer
  const [selectedCard, setSelectedCard] = useState<PipelineCard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('reception');

  // ── 업체 확정 상태 (카드 ID → 확정 업체명, null=미확정)
  // 초기값: MOCK_AWARD에서 confirmed=true인 카드(PL-004, PL-014)만 세팅
  const [confirmedVendors, setConfirmedVendors] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    Object.entries(MOCK_AWARD).forEach(([id, a]) => {
      if (a.confirmed) init[id] = a.vendor;
    });
    return init;
  });

  // 업체 확정 Modal
  const [vendorConfirmModalOpen, setVendorConfirmModalOpen] = useState(false);
  const [vendorToConfirm, setVendorToConfirm] = useState<string | null>(null);

  // 계약 체결 확인 Modal
  const [contractModalOpen, setContractModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  const handleSearch = () => {
    setAppliedFilter({ name: filterName, manager: filterManager, method: filterMethod });
  };

  const handleReset = () => {
    setFilterName(''); setFilterManager(''); setFilterMethod(''); setFilterFrom(''); setFilterTo('');
    setAppliedFilter({ name: '', manager: '', method: '' });
    setActiveStage(null);
  };

  const filteredCards = useMemo(() => {
    return mockPipelineCards.filter((c) => {
      if (appliedFilter.name && !c.name.includes(appliedFilter.name)) return false;
      if (appliedFilter.manager && !c.manager.includes(appliedFilter.manager)) return false;
      if (appliedFilter.method && c.procurementMethod !== appliedFilter.method) return false;
      return true;
    });
  }, [appliedFilter]);

  // 목록 뷰용: 단계 카드 클릭 필터 추가 적용
  const listViewCards = useMemo(() => {
    if (!activeStage) return filteredCards;
    return filteredCards.filter((c) => c.stage === activeStage);
  }, [filteredCards, activeStage]);

  // 단계별 카운트
  const stageCounts = useMemo(() => {
    return STAGES.map((stage) => ({
      stage,
      count: filteredCards.filter((c) => c.stage === stage).length,
    }));
  }, [filteredCards]);

  const columns = STAGES.map((stage) => {
    const cards = filteredCards
      .filter((c) => c.stage === stage)
      .map((c) => {
        const dday = calcDday(c.deadline);
        const ddayBadge = dday <= 7
          ? <span style={{ background: '#f8d7da', color: '#721c24', fontSize: '10px', padding: '1px 5px', borderRadius: '10px', fontWeight: '700' }}>D-{dday}</span>
          : dday <= 30
          ? <span style={{ background: '#fff3cd', color: '#856404', fontSize: '10px', padding: '1px 5px', borderRadius: '10px', fontWeight: '700' }}>D-{dday}</span>
          : null;

        return {
          id: c.id,
          title: c.name,
          badge: (
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <StatusBadge
                type="custom"
                value={c.type}
                customLabel={c.type}
                customBg={c.type === '3자간' ? '#cfe2ff' : '#d1e7dd'}
                customText={c.type === '3자간' ? '#084298' : '#0a3622'}
              />
              {ddayBadge}
            </div>
          ),
          meta: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.375rem' }}>
              <span style={{ fontSize: '11px', color: '#555' }}>{c.procurementMethod}</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#00a7ea' }}>{formatAmountShort(c.expectedAmount)}</span>
            </div>
          ),
        };
      });

    return {
      id: stage,
      label: stage,
      cards,
      isCompleted: stage === '계약체결',
    };
  });

  const handleCardClick = (card: { id: string }) => {
    const found = mockPipelineCards.find((c) => c.id === card.id);
    if (found) {
      setSelectedCard(found);
      setDrawerTab('reception');
      setDrawerOpen(true);
    }
  };

  const isAwardedOrLater = selectedCard
    ? STAGE_INDEX[selectedCard.stage] >= STAGE_INDEX['낙찰']
    : false;

  const srm = selectedCard ? MOCK_SRM_DATA[selectedCard.id] : null;
  const proposals = selectedCard ? MOCK_PROPOSALS[selectedCard.id] : null;
  const award = selectedCard ? MOCK_AWARD[selectedCard.id] : null;

  // 현재 선택된 카드의 확정 업체명 (useState 기반)
  const currentConfirmedVendor = selectedCard ? (confirmedVendors[selectedCard.id] ?? null) : null;

  // 업체 확정 처리 핸들러
  const handleOpenVendorConfirmModal = (vendorName: string) => {
    setVendorToConfirm(vendorName);
    setVendorConfirmModalOpen(true);
  };

  const handleConfirmVendor = () => {
    if (selectedCard && vendorToConfirm) {
      setConfirmedVendors((prev) => ({ ...prev, [selectedCard.id]: vendorToConfirm }));
      setToast({ message: `업체 확정 완료 — ${vendorToConfirm}`, visible: true });
    }
    setVendorConfirmModalOpen(false);
    setVendorToConfirm(null);
  };

  const drawerTabs: { key: DrawerTab; label: string }[] = [
    { key: 'reception', label: '(a) 접수정보' },
    { key: 'srm', label: '(b) SRM 입찰' },
    { key: 'proposal', label: '(c) 제안비교' },
    { key: 'award', label: '(d) 낙찰결과' },
    { key: 'action', label: '(e) 액션' },
  ];

  return (
    <div>
      {/* Toast 알림 */}
      {toast.visible && (
        <div style={{
          position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 9999,
          background: '#198754', color: '#fff', borderRadius: '0.375rem',
          padding: '0.75rem 1.25rem', fontSize: '13px', fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          <span>✓</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="breadcrumb-container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">홈</li>
          <li className="breadcrumb-item">사업 기회관리</li>
          <li className="breadcrumb-item active">Pipeline 현황</li>
        </ol>
      </div>
      <div className="content-title-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>접수현황 — Pipeline 현황</h2>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            className={`btn${viewMode === 'list' ? '' : ' type-02'}`}
            onClick={() => setViewMode('list')}
            style={{ fontSize: '12px', padding: '0 0.75rem' }}
          >
            목록 보기
          </button>
          <button
            className={`btn${viewMode === 'kanban' ? '' : ' type-02'}`}
            onClick={() => setViewMode('kanban')}
            style={{ fontSize: '12px', padding: '0 0.75rem' }}
          >
            Kanban 보기
          </button>
        </div>
      </div>

      <div className="content-wrap">

        {/* 목록 뷰 — 단계 카운트 카드 */}
        {viewMode === 'list' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {stageCounts.map(({ stage, count }) => {
              const isActive = activeStage === stage;
              const isCompleted = stage === '계약체결';
              return (
                <div
                  key={stage}
                  onClick={() => setActiveStage(isActive ? null : stage)}
                  style={{
                    flex: 1,
                    border: `1px solid ${isActive ? '#00a7ea' : '#dee2e6'}`,
                    borderRadius: '0.375rem',
                    background: isCompleted ? '#e8f4e8' : isActive ? '#e8f4fb' : '#f8f9fa',
                    padding: '0.625rem 0.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stage}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: isActive ? '#00a7ea' : '#343a40', lineHeight: 1 }}>{count}</div>
                  <div style={{ fontSize: '10px', color: '#adb5bd', marginTop: '0.125rem' }}>건</div>
                </div>
              );
            })}
          </div>
        )}

        {/* 공통 필터 */}
        <div className="content-box-wrap">
          <div className="filter-row">
            <div className="filter-item">
              <label className="filter-label">사업명</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="사업명"
                style={{ width: 140 }}
              />
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
              <label className="filter-label">조달방식</label>
              <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} style={{ width: 110 }}>
                <option value="">전체</option>
                <option value="경쟁입찰">경쟁입찰</option>
                <option value="수의계약">수의계약</option>
                <option value="제한경쟁">제한경쟁</option>
                <option value="2단계입찰">2단계입찰</option>
                <option value="적격심사">적격심사</option>
              </select>
            </div>
            <div className="filter-item">
              <label className="filter-label">발주요청일</label>
              <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={{ width: 120 }} />
              <span style={{ padding: '0 0.375rem', color: '#6c757d' }}>~</span>
              <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={{ width: 120 }} />
            </div>
            <div className="filter-actions">
              <button className="btn" onClick={handleSearch}>조회</button>
              <button className="btn type-02" onClick={handleReset}>초기화</button>
            </div>
          </div>
        </div>

        {/* 목록 뷰 — 테이블 */}
        {viewMode === 'list' && (
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>Pipeline 목록{activeStage && <span style={{ fontSize: '11px', color: '#00a7ea', marginLeft: '0.5rem', fontWeight: 400 }}>({activeStage} 필터 적용)</span>}</h3>
              <div className="button-wrap">
                <button className="btn type-04" style={{ width: 84 }}>엑셀 다운로드</button>
              </div>
            </div>
            <div className="table-wrap type-03">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>No</th>
                    <th style={{ textAlign: 'left' }}>사업명</th>
                    <th style={{ width: 70 }}>유형</th>
                    <th style={{ width: 90 }}>조달방식</th>
                    <th style={{ width: 100 }}>단계</th>
                    <th style={{ width: 100, textAlign: 'right' }}>예상계약금액</th>
                    <th style={{ width: 70, textAlign: 'left' }}>담당자</th>
                    <th style={{ width: 65 }}>D-day</th>
                  </tr>
                </thead>
                <tbody>
                  {listViewCards.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>조회된 데이터가 없습니다.</td>
                    </tr>
                  ) : listViewCards.map((card, idx) => {
                    const dday = calcDday(card.deadline);
                    const ddayColor = dday <= 7 ? '#721c24' : dday <= 30 ? '#856404' : '#383d41';
                    const ddayBg = dday <= 7 ? '#f8d7da' : dday <= 30 ? '#fff3cd' : '#e2e3e5';
                    return (
                      <tr
                        key={card.id}
                        onClick={() => handleCardClick({ id: card.id })}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="text-center">{idx + 1}</td>
                        <td className="text-left" style={{ fontWeight: '600', color: '#0d6efd' }}>{card.name}</td>
                        <td className="text-center">
                          <StatusBadge
                            type="custom"
                            value={card.type}
                            customLabel={card.type}
                            customBg={card.type === '3자간' ? '#cfe2ff' : '#d1e7dd'}
                            customText={card.type === '3자간' ? '#084298' : '#0a3622'}
                          />
                        </td>
                        <td className="text-center" style={{ fontSize: '11px' }}>{card.procurementMethod}</td>
                        <td className="text-center">
                          <span style={{
                            fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                            background: card.stage === '계약체결' ? '#d1e7dd' : '#cfe2ff',
                            color: card.stage === '계약체결' ? '#0a3622' : '#084298',
                          }}>
                            {card.stage}
                          </span>
                        </td>
                        <td className="text-right">{formatAmountShort(card.expectedAmount)}</td>
                        <td className="text-left">{card.manager}</td>
                        <td className="text-center">
                          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '10px', background: ddayBg, color: ddayColor, fontWeight: '700' }}>
                            D-{dday}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="count-wrap">총 {listViewCards.length}건</div>
          </div>
        )}

        {/* Kanban 뷰 */}
        {viewMode === 'kanban' && (
          <div className="content-box-wrap type-02" style={{ padding: 0, overflow: 'hidden' }}>
            <KanbanBoard columns={columns} onCardClick={handleCardClick} />
          </div>
        )}
      </div>

      {/* Drawer */}
      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Pipeline 상세${selectedCard ? ` — ${selectedCard.name}` : ''}`}
        width={640}
      >
        {selectedCard && (
          <div>
            {/* 탭 */}
            <div className="tab-list" style={{ marginBottom: '1rem' }}>
              {drawerTabs.map((t) => (
                <button
                  key={t.key}
                  className={`tab-btn ${drawerTab === t.key ? 'active' : ''}`}
                  onClick={() => setDrawerTab(t.key)}
                  style={{ fontSize: '11px', padding: '0.5rem 0.75rem' }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* (a) 접수정보 */}
            {drawerTab === 'reception' && (
              <div>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['사업명', selectedCard.name],
                      ['사업유형', selectedCard.type],
                      ['조달방식', selectedCard.procurementMethod],
                      ['담당자', selectedCard.manager],
                      ['예상계약금액', formatAmount(selectedCard.expectedAmount)],
                      ['입찰마감일', formatDate(selectedCard.deadline)],
                      ['EPC사', selectedCard.epcCompany || '-'],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ color: '#6c757d', padding: '0.375rem 0', width: 130, fontWeight: '600' }}>{label}</td>
                        <td style={{ padding: '0.375rem 0' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{
                  background: '#e8f4fd', borderRadius: '0.25rem', padding: '0.75rem', marginTop: '1rem',
                  fontSize: '11px', color: '#084298',
                }}>
                  수주계약은 Stage 1(기회 승인 후)에서 이미 체결됨. PROJECT도 Stage 1에서 생성 완료.
                </div>
              </div>
            )}

            {/* (b) SRM 입찰 데이터 */}
            {drawerTab === 'srm' && (
              <div>
                {srm ? (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '0.375rem' }}>공고 내용</div>
                      <div style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: '0.25rem', fontSize: '12px', lineHeight: 1.6 }}>
                        {srm.announcement}
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '0.375rem' }}>예상 품목</div>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left' }}>품목명</th>
                            <th>단위</th>
                            <th>수량</th>
                            <th style={{ textAlign: 'right' }}>단가</th>
                          </tr>
                        </thead>
                        <tbody>
                          {srm.items.map((item, i) => (
                            <tr key={i}>
                              <td className="text-left">{item.name}</td>
                              <td className="text-center">{item.unit}</td>
                              <td className="text-center">{item.qty.toLocaleString('ko-KR')}</td>
                              <td className="text-right">{item.unitPrice.toLocaleString('ko-KR')}원</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem' }}>
                        <div><span style={{ color: '#6c757d' }}>공고일: </span><strong>{srm.announceDate}</strong></div>
                        <div><span style={{ color: '#6c757d' }}>마감일: </span><strong>{srm.deadline}</strong></div>
                      </div>
                      <div style={{ color: '#6c757d' }}>
                        마지막 Webhook 수신: <strong style={{ color: '#343a40' }}>{srm.webhookAt}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>SRM 데이터가 없습니다.</div>
                )}
              </div>
            )}

            {/* (c) 제안비교 & 업체 확정 */}
            {drawerTab === 'proposal' && (
              <div>
                {proposals ? (() => {
                  const minTotal = Math.min(...proposals.map((p) => p.total));
                  const awardData = selectedCard ? MOCK_AWARD[selectedCard.id] : null;
                  // confirmedVendor는 useState 기반 (클릭 시 실제 상태 반영)
                  const confirmedVendor = currentConfirmedVendor;

                  return (
                    <>
                      {/* 확정 안내 배너 */}
                      {confirmedVendor && (
                        <div style={{
                          background: '#d1e7dd', border: '1px solid #a3cfbb', borderRadius: '0.375rem',
                          padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                          <span style={{ fontSize: '16px' }}>✅</span>
                          <div style={{ fontSize: '12px' }}>
                            <strong style={{ color: '#0a3622' }}>{confirmedVendor}</strong>
                            <span style={{ color: '#0a3622' }}>으로 업체 확정 완료</span>
                          </div>
                        </div>
                      )}

                      {/* 비교 테이블 */}
                      <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '0.5rem', color: '#343a40' }}>
                        참여업체 제안 비교
                        <span style={{ fontWeight: '400', color: '#6c757d', marginLeft: '0.5rem', fontSize: '11px' }}>
                          ({proposals.length}개 업체 참여)
                        </span>
                      </div>
                      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', minWidth: 130 }}>업체명</th>
                              <th style={{ textAlign: 'right', minWidth: 120 }}>제안금액</th>
                              <th style={{ minWidth: 60 }}>납기</th>
                              <th style={{ minWidth: 60 }}>신용등급</th>
                              <th style={{ minWidth: 70 }}>부채비율</th>
                              <th style={{ minWidth: 60 }}>실적</th>
                              <th style={{ minWidth: 80 }}>업체 확정</th>
                            </tr>
                          </thead>
                          <tbody>
                            {proposals.map((p, i) => {
                              const isLowest = p.total === minTotal;
                              const isConfirmed = confirmedVendor === p.vendor;
                              const rowBg = isConfirmed ? '#d1e7dd' : isLowest ? '#f0fdf4' : undefined;
                              return (
                                <tr key={i} style={{ background: rowBg }}>
                                  <td className="text-left">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                                      <span style={{ fontWeight: isConfirmed ? '700' : undefined }}>{p.vendor}</span>
                                      {isLowest && !isConfirmed && (
                                        <span style={{ fontSize: '10px', background: '#cfe2ff', color: '#084298', padding: '1px 5px', borderRadius: '8px' }}>최저가</span>
                                      )}
                                      {isConfirmed && (
                                        <span style={{ fontSize: '10px', background: '#0a3622', color: '#fff', padding: '1px 6px', borderRadius: '8px' }}>✓ 확정</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-right" style={{ fontWeight: isLowest ? '700' : undefined, color: isLowest ? '#0a3622' : undefined }}>
                                    {formatAmount(p.total)}
                                  </td>
                                  <td className="text-center">{p.delivery}일</td>
                                  <td className="text-center">
                                    <span style={{
                                      fontSize: '11px', padding: '1px 6px', borderRadius: '8px',
                                      background: p.creditGrade.startsWith('A') ? '#d1e7dd' : p.creditGrade.startsWith('BB') ? '#fff3cd' : '#f8d7da',
                                      color: p.creditGrade.startsWith('A') ? '#0a3622' : p.creditGrade.startsWith('BB') ? '#856404' : '#721c24',
                                    }}>
                                      {p.creditGrade}
                                    </span>
                                  </td>
                                  <td className="text-center" style={{ fontSize: '11px' }}>{p.debtRatio}</td>
                                  <td className="text-center" style={{ fontSize: '11px' }}>{p.history}건</td>
                                  <td className="text-center">
                                    {isConfirmed ? (
                                      <span style={{ fontSize: '11px', color: '#0a3622', fontWeight: '700' }}>확정완료</span>
                                    ) : confirmedVendor ? (
                                      <span style={{ fontSize: '11px', color: '#adb5bd' }}>—</span>
                                    ) : isAwardedOrLater ? (
                                      <button
                                        className="btn type-03"
                                        style={{ fontSize: '11px', height: '22px', padding: '0 0.5rem', whiteSpace: 'nowrap' }}
                                        onClick={() => handleOpenVendorConfirmModal(p.vendor)}
                                      >
                                        이 업체로
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: '11px', color: '#adb5bd' }}>낙찰 후 가능</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* 낙찰 결과 요약 (낙찰 단계 이상) */}
                      {isAwardedOrLater && awardData && (
                        <div style={{
                          border: `2px solid ${confirmedVendor ? '#a3cfbb' : '#00a7ea'}`,
                          borderRadius: '0.375rem', padding: '0.875rem 1rem', background: confirmedVendor ? '#f0fdf4' : '#e8f4fb',
                        }}>
                          <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '0.5rem', color: confirmedVendor ? '#0a3622' : '#084298' }}>
                            {confirmedVendor ? '✅ 낙찰 확정 완료' : '🏆 SRM 낙찰 결과'}
                          </div>
                          <div style={{ display: 'flex', gap: '2rem', fontSize: '12px' }}>
                            <div><span style={{ color: '#6c757d' }}>낙찰업체: </span><strong>{awardData.vendor}</strong></div>
                            <div><span style={{ color: '#6c757d' }}>낙찰가: </span><strong>{formatAmount(awardData.price)}</strong></div>
                            <div><span style={{ color: '#6c757d' }}>낙찰일: </span><strong>{awardData.awardDate}</strong></div>
                          </div>
                          {!confirmedVendor && (
                            <div style={{ marginTop: '0.75rem' }}>
                              <button
                                className="btn type-03"
                                style={{ fontSize: '12px', padding: '0 1rem' }}
                                onClick={() => handleOpenVendorConfirmModal(awardData.vendor)}
                              >
                                {awardData.vendor} 업체 확정
                              </button>
                              <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '0.75rem' }}>확정 후 계약 체결이 가능합니다</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })() : (
                  <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#6c757d' }}>
                    <div style={{ fontSize: '32px', marginBottom: '0.75rem' }}>📋</div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>제안서 접수 대기 중</div>
                    <div style={{ fontSize: '11px' }}>제안서 접수 단계 이후 업체별 비교 데이터가 표시됩니다.</div>
                  </div>
                )}
              </div>
            )}

            {/* (d) 낙찰결과 */}
            {drawerTab === 'award' && (
              <div>
                {isAwardedOrLater && award ? (
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '0.875rem' }}>낙찰 결과</div>
                    {/* 상태 배너 — currentConfirmedVendor 기준 */}
                    <div style={{
                      background: currentConfirmedVendor ? '#d1e7dd' : '#fff3cd',
                      border: `1px solid ${currentConfirmedVendor ? '#a3cfbb' : '#ffc107'}`,
                      borderRadius: '0.375rem', padding: '0.75rem 1rem', marginBottom: '1rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                      <span style={{ fontSize: '18px' }}>{currentConfirmedVendor ? '✅' : '🏆'}</span>
                      <div style={{ fontSize: '12px' }}>
                        <div style={{ fontWeight: '700', color: currentConfirmedVendor ? '#0a3622' : '#856404' }}>
                          {currentConfirmedVendor ? '업체 확정 완료' : 'SRM 낙찰 — 업체 확정 필요'}
                        </div>
                        <div style={{ color: '#6c757d', fontSize: '11px', marginTop: '2px' }}>
                          {currentConfirmedVendor ? '계약 체결 진행 가능합니다.' : '[업체 확정] 버튼을 클릭하여 낙찰 업체를 확정하세요.'}
                        </div>
                      </div>
                    </div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <tbody>
                        {[
                          ['낙찰업체', award.vendor],
                          ['낙찰가', formatAmount(award.price)],
                          ['SRM 낙찰 확정일', award.awardDate],
                          ['확정상태', currentConfirmedVendor ? '확정 완료' : '미확정 (업체 확정 필요)'],
                        ].map(([label, value]) => (
                          <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ color: '#6c757d', padding: '0.5rem 0', width: 130, fontWeight: '600' }}>{label}</td>
                            <td style={{ padding: '0.5rem 0', fontWeight: label === '낙찰업체' ? '700' : undefined,
                              color: label === '확정상태' ? (currentConfirmedVendor ? '#0a3622' : '#856404') : undefined }}>
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!currentConfirmedVendor && (
                      <div style={{ marginTop: '1rem' }}>
                        <button className="btn type-03" style={{ padding: '0 1.25rem' }} onClick={() => handleOpenVendorConfirmModal(award.vendor)}>
                          {award.vendor} 업체 확정
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#6c757d' }}>
                    <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>🏆</div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>낙찰 단계 이후 표시</div>
                    <div style={{ fontSize: '11px' }}>SRM에서 낙찰 결과가 수신되면 표시됩니다.</div>
                  </div>
                )}
              </div>
            )}

            {/* (e) 액션 */}
            {drawerTab === 'action' && (() => {
              const awardData = selectedCard ? MOCK_AWARD[selectedCard.id] : null;
              // vendorConfirmed는 useState 기반 currentConfirmedVendor로 판단
              const vendorConfirmed = currentConfirmedVendor !== null;
              const canContract = isAwardedOrLater && vendorConfirmed;
              return (
                <div>
                  <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '1rem' }}>Pipeline 액션</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* 업체 확정 */}
                    <div style={{ border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <div style={{ fontWeight: '600', fontSize: '12px' }}>① 업체 확정</div>
                        {vendorConfirmed && (
                          <span style={{ fontSize: '11px', background: '#d1e7dd', color: '#0a3622', padding: '1px 8px', borderRadius: '8px' }}>완료</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '0.625rem' }}>
                        SRM 낙찰 결과를 바탕으로 최종 업체를 확정합니다. 낙찰 단계에서만 가능합니다.
                      </div>
                      {vendorConfirmed ? (
                        <div style={{ fontSize: '12px', color: '#0a3622', fontWeight: '600' }}>
                          ✅ {currentConfirmedVendor} 확정 완료
                        </div>
                      ) : (
                        <button
                          className={`btn type-03${!isAwardedOrLater ? ' disabled' : ''}`}
                          disabled={!isAwardedOrLater}
                          style={{ padding: '0 1rem' }}
                          onClick={() => isAwardedOrLater && awardData && handleOpenVendorConfirmModal(awardData.vendor)}
                        >
                          업체 확정
                        </button>
                      )}
                    </div>

                    {/* 계약 체결 */}
                    <div style={{ border: `1px solid ${canContract ? '#a3cfbb' : '#dee2e6'}`, borderRadius: '0.375rem', padding: '0.875rem 1rem',
                      background: canContract ? '#f0fdf4' : undefined }}>
                      <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '0.375rem' }}>② 계약 체결</div>
                      <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '0.625rem' }}>
                        업체 확정 후 ORDER_CONTRACT를 생성합니다. CP(0차)가 없으면 자동 생성됩니다.
                      </div>
                      <button
                        className={`btn type-03${!canContract ? ' disabled' : ''}`}
                        disabled={!canContract}
                        style={{ padding: '0 1rem' }}
                        onClick={() => canContract && setContractModalOpen(true)}
                        title={!isAwardedOrLater ? '낙찰 단계 이후에만 가능합니다' : !vendorConfirmed ? '업체 확정 후 진행 가능' : undefined}
                      >
                        계약 체결
                      </button>
                      {!isAwardedOrLater && (
                        <span style={{ fontSize: '11px', color: '#adb5bd', marginLeft: '0.75rem' }}>낙찰 단계 이후 활성화</span>
                      )}
                      {isAwardedOrLater && !vendorConfirmed && (
                        <span style={{ fontSize: '11px', color: '#856404', marginLeft: '0.75rem' }}>① 업체 확정 후 진행 가능</span>
                      )}
                    </div>

                    {/* 입찰 종료 */}
                    <div style={{ border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '0.375rem' }}>입찰 종료 (유찰)</div>
                      <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '0.625rem' }}>
                        낙찰 결과 없이 입찰을 종료합니다. 카드가 아카이브됩니다.
                      </div>
                      <button className="btn type-02" style={{ padding: '0 1rem' }}>입찰 종료</button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </DrawerPanel>

      {/* 업체 확정 Modal (설계서 흐름: 업체 확정 → 별도 Modal → 확인 시 상태 변경) */}
      <ModalDialog
        isOpen={vendorConfirmModalOpen}
        onClose={() => { setVendorConfirmModalOpen(false); setVendorToConfirm(null); }}
        title="업체 확정 확인"
        size="sm"
        footer={
          <>
            <button className="btn type-02" onClick={() => { setVendorConfirmModalOpen(false); setVendorToConfirm(null); }}>취소</button>
            <button className="btn type-03" onClick={handleConfirmVendor}>확정</button>
          </>
        }
      >
        <p style={{ fontSize: '12px', lineHeight: 1.8 }}>
          <strong>{vendorToConfirm}</strong>으로 낙찰 확정하시겠습니까?<br />
          <span style={{ color: '#6c757d', fontSize: '11px' }}>확정 후 계약 체결 버튼이 활성화됩니다.</span>
        </p>
      </ModalDialog>

      {/* 계약 체결 확인 Modal */}
      <ModalDialog
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        title="계약 체결 확인"
        size="sm"
        footer={
          <>
            <button className="btn type-02" onClick={() => setContractModalOpen(false)}>취소</button>
            <button
              className="btn type-03"
              onClick={() => { setContractModalOpen(false); setDrawerOpen(false); router.push('/cp/CP-2024-001'); }}
            >
              확인
            </button>
          </>
        }
      >
        <p style={{ fontSize: '12px', lineHeight: 1.8 }}>
          ORDER_CONTRACT를 생성합니다.<br />
          (CP가 없으면 CP(0차)도 함께 생성됩니다.)<br />
          PROJECT는 이미 생성되어 있습니다.<br />
          <br />
          계속하시겠습니까?
        </p>
      </ModalDialog>
    </div>
  );
}
