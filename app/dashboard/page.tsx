'use client';

import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  LineChart,
} from 'recharts';
import {
  FileText,
  Briefcase,
  DollarSign,
  FolderKanban,
  Calculator,
  User,
  LayoutGrid,
  Inbox,
  ClipboardList,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { mockDashboardKpi, mockNotices } from '@/lib/mock-data/dashboard';

/** 월별 사업비·투자비 추이 카드 내부 패널과 동일 (다른 카드도 이 톤에 맞춤) */
const trendCardInnerPanel: CSSProperties = {
  border: '1px solid #E5EBF3',
  borderRadius: 12,
  padding: '0.875rem 1rem',
  background: '#FFFFFF',
};
const businessStatusSectionPanel: CSSProperties = {
  background: '#F1F6FB',
  border: '1px solid #E6EEF7',
  borderRadius: 18,
  padding: '1.5rem',
};
const businessStatusSummaryPanel: CSSProperties = {
  border: '1px solid #DDE6F0',
  borderRadius: 12,
  padding: '1.25rem 1.5rem',
  background: '#E8EEF5',
};

const businessStatusBodyPanel: CSSProperties = {
  borderRadius: 12,
  padding: '0.5rem 0',
  background: 'transparent',
};

/** 일~토 그리드용: 해당 월의 앞빈칸(null) + 1..말일 */
function getCalendarCells(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function formatNoticeShortDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

// ── 월별 차트 데이터 ──────────────────────────────────────────────────────────
const monthlyPerformanceData = [
  { month: '1월', 사업비: 4.2, 투자비: 3.1, 달성률: 72 },
  { month: '2월', 사업비: 5.1, 투자비: 3.8, 달성률: 75 },
  { month: '3월', 사업비: 6.8, 투자비: 4.9, 달성률: 78 },
  { month: '4월', 사업비: 5.5, 투자비: 4.1, 달성률: 80 },
  { month: '5월', 사업비: 7.2, 투자비: 5.3, 달성률: 82 },
  { month: '6월', 사업비: 8.1, 투자비: 6.0, 달성률: 83 },
  { month: '7월', 사업비: 7.5, 투자비: 5.6, 달성률: 84 },
  { month: '8월', 사업비: 6.9, 투자비: 5.1, 달성률: 83 },
  { month: '9월', 사업비: 6.2, 투자비: 4.7, 달성률: 82 },
  { month: '10월', 사업비: 5.8, 투자비: 4.3, 달성률: 81 },
  { month: '11월', 사업비: 5.1, 투자비: 3.8, 달성률: 83 },
  { month: '12월', 사업비: 4.5, 투자비: 3.3, 달성률: 84 },
];

// ── TOP KPI BAR 데이터 ────────────────────────────────────────────────────────
type TopKpiTrend = 'up' | 'down';
type TopKpiSubSegment = { text: string; tone?: 'muted' | 'accent' | 'danger'; trend?: TopKpiTrend };
type TopKpiItem = {
  label: string;
  value: string;
  sub?: TopKpiSubSegment[];
};

const topKpiItems: TopKpiItem[] = [
  { label: '신규사업', value: '3건', sub: [{ text: '심의대기 ' }, { text: '12', tone: 'accent' }] },
  {
    label: '수주 계약',
    value: '218건',
    sub: [
      { text: '투자 ' },
      { text: '205', tone: 'accent' },
      { text: '  용역·공사 ' },
      { text: '120', tone: 'accent' },
    ],
  },
  {
    label: '공고평가',
    value: '7건',
    sub: [
      { text: '공고 ' },
      { text: '7', tone: 'accent' },
      { text: '  평가 ' },
      { text: '2', tone: 'accent' },
    ],
  },
  { label: '발주 계약', value: '17건' },
  {
    label: '상환 완료율',
    value: '87.1%',
    sub: [{ text: '전월대비 ' }, { text: '5.5%', tone: 'accent', trend: 'up' }],
  },
  { label: '미상환', value: '3건', sub: [{ text: '4.6 억원', tone: 'danger' }] },
  {
    label: '가상계좌 연결',
    value: '75.2%',
    sub: [{ text: '미연결 ' }, { text: '12', tone: 'accent' }],
  },
  {
    label: '세금계산서',
    value: '104건',
    sub: [{ text: '오늘발행 ' }, { text: '25', tone: 'accent' }, { text: '일 납부' }],
  },
];

function TopKpiSub({ segments }: { segments?: TopKpiSubSegment[] }) {
  if (!segments?.length) return null;

  return (
    <div className="top-kpi-sub">
      {segments.map((segment, i) => (
        <span
          key={`${segment.text}-${i}`}
          className={segment.tone ? `top-kpi-sub-${segment.tone}` : undefined}
        >
          {segment.text}
          {segment.trend && (
            <span className={`top-kpi-trend top-kpi-trend-${segment.trend}`} aria-hidden>
              {segment.trend === 'up' ? '▲' : '▼'}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

// ── 사업 현황 progress bar 데이터 ────────────────────────────────────────────
const statusBars = [
  { label: '상환완료', count: '14건', amount: '19.8억', pct: 70, color: '#1a56db' },
  { label: '상환예정', count: '18건', amount: '11.8억', pct: 26, color: '#f97316' },
  { label: '미상환', count: '2건', amount: '2.1억', pct: 4, color: '#ef4444' },
];

// ── 사업 현황 우측 KPI 수치 ──────────────────────────────────────────────────
const projectKpiStats = [
  { label: '사업비 실적', value: '908억', sub: '달성률 97.5%', dir: 'up' },
  { label: '에너지 절감량', value: '1,302 toe', sub: '전월대비 2.4%', dir: 'down' },
  { label: 'EERS 절감량', value: '2,092 MWh', sub: '전월대비 4.7%', dir: 'up' },
];

const calendarDow = ['일', '월', '화', '수', '목', '금', '토'];

type CalendarCaption = 'completed' | 'planned' | 'unpaid' | 'bid';
const CALENDAR_DOT_PALETTE: Record<CalendarCaption, string> = {
  completed: '#1a56db',
  planned: '#f97316',
  unpaid: '#ef4444',
  bid: '#6c757d',
};

/** 조회 연월·일에 표시할 캡션 점 (데모 목업) */
const calendarCaptionByMonth: Record<string, Partial<Record<number, CalendarCaption[]>>> = {
  '2026-5': {
    2: ['completed'],
    7: ['planned'],
    10: ['completed', 'bid'],
    12: ['unpaid'],
    18: ['planned', 'unpaid'],
    22: ['bid'],
    25: ['completed'],
    28: ['planned', 'bid'],
  },
};

function getCalendarCaptions(year: number, month: number, day: number): CalendarCaption[] {
  const key = `${year}-${month}`;
  return calendarCaptionByMonth[key]?.[day] ?? [];
}

// ── 탭 테이블 mock ────────────────────────────────────────────────────────────
type TabKey = 'all' | 'completed' | 'planned' | 'unpaid';
const tabTableData = [
  {
    id: 'dd-1',
    status: '상환완료' as const,
    name: '송암시스콤 LED',
    amount: '138,904,030',
    round: '45회차',
  },
  {
    id: 'dd-2',
    status: '상환완료' as const,
    name: '가양 ENT 보일러',
    amount: '346,000',
    round: '98회차',
  },
  {
    id: 'dd-3',
    status: '상환완료' as const,
    name: '마스턴172 성수 오피스 연료전지 구매',
    amount: '8,904,030',
    round: '5회차',
  },
  {
    id: 'dd-4',
    status: '상환완료' as const,
    name: '송암시스콤 LED',
    amount: '8,904,030',
    round: '18회차',
  },
  {
    id: 'dd-5',
    status: '상환예정' as const,
    name: '에너지엑스 빌딩 정보통신공사',
    amount: '56,904,543',
    round: '28회차',
  },
  {
    id: 'dd-6',
    status: '상환예정' as const,
    name: '광명전기 LED 교체',
    amount: '12,500,000',
    round: '12회차',
  },
  {
    id: 'dd-7',
    status: '미상환' as const,
    name: '인천항 냉동창고 절감',
    amount: '22,000,000',
    round: '3회차',
  },
  {
    id: 'dd-8',
    status: '미상환' as const,
    name: '엘엠에이티(LMAT) LED',
    amount: '38,000,000',
    round: '2회차',
  },
];

const TAB_DEFS: { key: TabKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'completed', label: '상환완료' },
  { key: 'planned', label: '상환예정' },
  { key: 'unpaid', label: '미상환' },
];

// ── 자금회수율 요약(표시 문자열) + mockDashboardKpi와 회수율%만 동기화 ─────────
const recoveryDisplay = {
  total: '1,248억',
  recovered: '1,103억',
  outstanding: '145억',
};
const recoveryTrendData = [
  { month: '1월', 회수율: 82.1 },
  { month: '2월', 회수율: 83.5 },
  { month: '3월', 회수율: 84.0 },
  { month: '4월', 회수율: 85.2 },
  { month: '5월', 회수율: 86.8 },
  { month: '6월', 회수율: 87.5 },
  { month: '7월', 회수율: 87.9 },
  { month: '8월', 회수율: 88.1 },
  { month: '9월', 회수율: 87.6 },
  { month: '10월', 회수율: 88.0 },
  { month: '11월', 회수율: 88.2 },
  { month: '12월', 회수율: 88.4 },
];

// ── 바로가기 버튼 ────────────────────────────────────────────────────────────
const shortcuts = [
  { label: '사업접수', href: '/opportunity/new', Icon: FileText },
  { label: '계약', href: '/contracts', Icon: Briefcase },
  { label: '자금관리', href: '/funds/investment', Icon: DollarSign },
  { label: '프로젝트관리', href: '/projects', Icon: FolderKanban },
  { label: '사업결산', href: '/settlement', Icon: Calculator },
  { label: '마이페이지', href: '/mypage', Icon: User },
];

const myWorkItems = [
  { label: '접수', count: 7, Icon: Inbox, color: '#4967D8', iconBg: '#E7ECFF' },
  { label: '입찰평가', count: 28, Icon: ClipboardList, color: '#F5B817', iconBg: '#FFF3C9' },
  { label: '검수', count: 3, Icon: ShieldCheck, color: '#EF5A2A', iconBg: '#FFE4DA' },
  { label: '상환', count: 3, Icon: Wallet, color: '#4967D8', iconBg: '#E7ECFF' },
] as const;

// ── 진행중 입찰공고 funnel ──────────────────────────────────────────────────
const bidFunnel = [
  { label: '공고중', count: 4 },
  { label: '투찰접수', count: 18 },
  { label: '평가중', count: 2 },
  { label: '낙찰', count: 8 },
  { label: '검수', count: 1 },
];
const bidItems = [
  {
    badge: '마감D-2',
    name: '가양 ENT 보일러',
    amount: '138,909,003원',
    date: '2026.05.12 오후 4:00',
    badgeColor: '#ef4444',
  },
  {
    badge: '잔여일',
    name: '에너지엑스 빌딩 정보통신공사',
    amount: '76,909,003원',
    date: '유효기간 2029.05.06',
    badgeColor: '#6c757d',
  },
];

// ── 미상환 현황 ──────────────────────────────────────────────────────────────
const unpaidItems = [
  {
    badge: '마감일',
    name: '가양 ENT 보일러',
    amount: '138,909,003원',
    sub: '미상환 3회',
    badgeColor: '#ef4444',
  },
  {
    badge: '연체',
    name: '에너지엑스 빌딩 정보통신공사',
    amount: '76,909,003원',
    sub: '미상환 1회',
    badgeColor: '#1a56db',
  },
  {
    badge: '보증서',
    name: '에너지엑스 빌딩 정보통신공사',
    amount: '',
    sub: '이행보증',
    badgeColor: '#f59e0b',
  },
];

// ── 상태배지 색상 헬퍼 ────────────────────────────────────────────────────────
const statusBadgeStyle = (status: string): CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    상환완료: { bg: '#dbeafe', color: '#1d4ed8' },
    상환예정: { bg: '#ffedd5', color: '#c2410c' },
    미상환: { bg: '#fee2e2', color: '#b91c1c' },
    전체예정: { bg: '#f3f4f6', color: '#374151' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#374151' };
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1px 6px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    background: s.bg,
    color: s.color,
    whiteSpace: 'nowrap',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const calendarCells = useMemo(
    () => getCalendarCells(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const today = new Date();
  const calendarHighlightDay =
    today.getFullYear() === selectedYear && today.getMonth() + 1 === selectedMonth
      ? today.getDate()
      : null;

  const tabCounts = useMemo(
    () => ({
      all: tabTableData.length,
      completed: tabTableData.filter((r) => r.status === '상환완료').length,
      planned: tabTableData.filter((r) => r.status === '상환예정').length,
      unpaid: tabTableData.filter((r) => r.status === '미상환').length,
    }),
    []
  );

  const tabs = TAB_DEFS.map((t) => ({ ...t, count: tabCounts[t.key] }));

  const kpiGoals = useMemo(() => {
    const k = mockDashboardKpi;
    const billions = (won: number) => (won / 100_000_000).toFixed(1);
    return [
      {
        label: '사업비 (억원)',
        value: billions(k.projectCost.actual),
        unit: '억',
        target: `${billions(k.projectCost.target)}억`,
        pct: Math.min(100, Math.round((k.projectCost.actual / k.projectCost.target) * 100)),
        color: '#1a56db',
      },
      {
        label: '투자비 (억원)',
        value: billions(k.investmentCost.actual),
        unit: '억',
        target: `${billions(k.investmentCost.target)}억`,
        pct: Math.min(100, Math.round((k.investmentCost.actual / k.investmentCost.target) * 100)),
        color: '#1a56db',
      },
      {
        label: 'EERS 절감량 (TOE)',
        value: String(k.eersSaving.actual),
        unit: 'TOE',
        target: `${k.eersSaving.target}TOE`,
        pct: Math.min(100, Math.round((k.eersSaving.actual / k.eersSaving.target) * 100)),
        color: '#1a56db',
      },
    ];
  }, []);

  const recoverySummary = useMemo(
    () => ({
      ratePct: mockDashboardKpi.fundRecovery.rate,
      ...recoveryDisplay,
    }),
    []
  );

  const noticesForWidget = useMemo(
    () => [...mockNotices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
    []
  );

  // 탭별 테이블 필터
  const filteredRows =
    activeTab === 'all'
      ? tabTableData
      : tabTableData.filter((r) => {
          if (activeTab === 'completed') return r.status === '상환완료';
          if (activeTab === 'planned') return r.status === '상환예정';
          if (activeTab === 'unpaid') return r.status === '미상환';
          return true;
        });

  return (
    <div>
      {/* ── TOP KPI BAR ──────────────────────────────────────────────────── */}
      <div className="top-kpi-bar">
        {topKpiItems.map((item, idx) => (
          <div key={idx} className="top-kpi-item">
            <div className="top-kpi-label">{item.label}</div>
            <div className="top-kpi-value">{item.value}</div>
            <TopKpiSub segments={item.sub} />
          </div>
        ))}
      </div>

      {/* ── 메인 2열 레이아웃 ─────────────────────────────────────────── */}
      <div className="content-wrap">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '1rem',
            alignItems: 'start',
          }}
        >
          {/* ═══ 좌 패널 ═══════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* ── 사업 현황 카드 ─────────────────────────────────────── */}
            <div className="content-box-wrap type-02" style={businessStatusSectionPanel}>
              {/* 헤더 */}
              <div className="title-row-wrap">
                <h3>사업 현황</h3>
                <input
                  type="month"
                  value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    const [y, m] = v.split('-').map(Number);
                    setSelectedYear(y);
                    setSelectedMonth(m);
                  }}
                  aria-label="조회 연월"
                  style={{
                    height: 28,
                    padding: '0 8px',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    border: '1px solid var(--input-border, #ced4da)',
                    borderRadius: 4,
                    background: 'transparent',
                    color: '#333',
                  }}
                />
              </div>

              {/* 가로 바 + KPI — 월별 추이 카드와 동일 내부 패널 */}
              <div
                style={{
                  border: '1px solid #D6E0EC',
                  borderRadius: 12,
                  padding: '1rem',
                  background: '#DDE7F2',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 38%) 1fr',
                    columnGap: '1.5rem',
                    alignItems: 'start',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {statusBars.map((bar, barIdx) => (
                      <div
                        key={bar.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: barIdx < statusBars.length - 1 ? 12 : 0,
                        }}
                      >
                        <span
                          style={{
                            flex: '0 0 auto',
                            minWidth: '2.75rem',
                            fontSize: 10,
                            color: '#555',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {bar.label}
                        </span>
                        <div
                          style={{
                            flex: '1 1 auto',
                            minWidth: 32,
                            height: 5,
                            background: '#e9ecef',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${bar.pct}%`,
                              background: bar.color,
                              borderRadius: 3,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            flex: '0 0 auto',
                            fontSize: 10,
                            color: '#333',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            textAlign: 'right',
                          }}
                        >
                          {bar.count} {bar.amount}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'row', minWidth: 0 }}>
                    {projectKpiStats.map((stat, statIdx) => (
                      <div
                        key={stat.label}
                        style={{
                          flex: '1 1 0',
                          minWidth: 0,
                          marginLeft: statIdx > 0 ? 20 : 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: '#6c757d',
                            marginBottom: 6,
                            lineHeight: 1.3,
                          }}
                        >
                          {stat.label}
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#1a1a1a',
                            marginBottom: 6,
                            lineHeight: 1.2,
                          }}
                        >
                          {stat.value}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            color: stat.dir === 'up' ? '#16a34a' : '#ef4444',
                          }}
                        >
                          {stat.dir === 'up' ? '▲' : '▼'} {stat.sub}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 미니 달력 + 탭·그리드 — 동일 내부 패널 */}

              <div
                style={{
                  borderRadius: 12,
                  padding: '0.5rem 0',
                  background: 'transparent',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(330px, 42%) minmax(0, 58%)',
                    gap: '24px',
                    alignItems: 'start',
                  }}
                >
                  {/* 미니 달력 + 범례 */}
                  <div
                    style={{
                      width: '100%',
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    {/* 달력 헤더 */}
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#1a56db',
                        marginBottom: 12,
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {selectedYear}년 {selectedMonth}월
                    </div>

                    {/* 달력 */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 360,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                        columnGap: 10,
                        rowGap: 8,
                        alignItems: 'start',
                      }}
                    >
                      {/* 요일 */}
                      {calendarDow.map((d) => (
                        <div
                          key={d}
                          style={{
                            textAlign: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#6c757d',
                            paddingBottom: 4,
                            lineHeight: 1,
                          }}
                        >
                          {d}
                        </div>
                      ))}

                      {/* 날짜 */}
                      {calendarCells.map((day, i) => {
                        const captions =
                          day !== null ? getCalendarCaptions(selectedYear, selectedMonth, day) : [];

                        const isActive =
                          calendarHighlightDay !== null && day === calendarHighlightDay;

                        return (
                          <div
                            key={i}
                            style={{
                              minHeight: captions.length > 0 ? 44 : 36,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                            }}
                          >
                            {day !== null && (
                              <>
                                {/* 날짜 */}
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    fontSize: 11,
                                    lineHeight: 1,
                                    background: isActive ? '#1a56db' : 'transparent',
                                    color: isActive ? '#fff' : '#333',
                                    fontWeight: isActive ? 700 : 500,
                                  }}
                                >
                                  {day}
                                </span>

                                {/* 상태 dot */}
                                {captions.length > 0 && (
                                  <div
                                    aria-hidden
                                    style={{
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      justifyContent: 'center',
                                      gap: 3,
                                      maxWidth: 42,
                                      marginTop: 4,
                                      lineHeight: 0,
                                    }}
                                  >
                                    {captions.map((c, j) => (
                                      <span
                                        key={`${c}-${j}`}
                                        style={{
                                          width: 5,
                                          height: 5,
                                          borderRadius: '50%',
                                          background: CALENDAR_DOT_PALETTE[c],
                                          flexShrink: 0,
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* 범례 */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 360,
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '10px 14px',
                        marginTop: 14,
                        fontSize: 10,
                        color: '#555',
                      }}
                    >
                      {[
                        { label: '상환완료', color: '#1a56db' },
                        { label: '상환예정', color: '#f97316' },
                        { label: '미상환', color: '#ef4444' },
                        { label: '입찰', color: '#6c757d' },
                      ].map((l) => (
                        <span
                          key={l.label}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: l.color,
                              flexShrink: 0,
                            }}
                          />
                          {l.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 우측 테이블 */}
                  <div style={{ minWidth: 0 }}>
                    <div className="tab-list" style={{ marginBottom: '0.75rem' }}>
                      {tabs.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                          onClick={() => setActiveTab(tab.key)}
                        >
                          {tab.label} {tab.count}
                        </button>
                      ))}
                    </div>

                    <div
                      className="table-wrap"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                      }}
                    >
                      <table
                        className="data-table"
                        style={{
                          width: '100%',
                          tableLayout: 'fixed',
                          fontSize: 12,
                          background: 'transparent',
                          borderCollapse: 'collapse',
                        }}
                      >
                        <colgroup>
                          <col style={{ width: '17%' }} />
                          <col style={{ width: '46%' }} />
                          <col style={{ width: '24%' }} />
                          <col style={{ width: '16%' }} />
                        </colgroup>

                        <tbody>
                          {filteredRows.map((row) => (
                            <tr
                              key={row.id}
                              style={{
                                background: 'transparent',
                                borderBottom: '1px solid #D5DEE8',
                              }}
                            >
                              <td>
                                <span style={statusBadgeStyle(row.status)}>{row.status}</span>
                              </td>

                              <td
                                className="text-left"
                                style={{
                                  color: '#1a1a1a',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {row.name}
                              </td>

                              <td className="text-right">{row.amount}</td>

                              <td className="text-center">{row.round}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 사업비·투자비 목표 + 월별 추이 (단일 카드) ───────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>월별 사업비 · 투자비 추이</h3>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                {kpiGoals.map((g) => (
                  <div key={g.label} style={trendCardInnerPanel}>
                    <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 4 }}>{g.label}</div>
                    <div
                      style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 2 }}
                    >
                      <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
                        {g.value}
                      </span>
                      <span style={{ fontSize: 12, color: '#555' }}>{g.unit}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 6 }}>
                      목표 {g.target} &nbsp; 달성률 {g.pct}%
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: '#e9ecef',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${g.pct}%`,
                          background: g.color,
                          borderRadius: 4,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart
                    data={monthlyPerformanceData}
                    margin={{ top: 4, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit="억" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (typeof value !== 'number') return [String(value ?? ''), String(name)];
                        return name === '달성률' ? [`${value}%`, name] : [`${value}억`, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="사업비" fill="#3b82f6" opacity={0.85} />
                    <Bar yAxisId="left" dataKey="투자비" fill="#f97316" opacity={0.85} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="달성률"
                      stroke="#1a56db"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── 자금회수율 현황 ───────────────────────────────────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>자금회수율 현황</h3>
                <button
                  type="button"
                  className="btn type-02"
                  style={{ height: 28, fontSize: 11, padding: '0 10px' }}
                  onClick={() => router.push('/cashflow/')}
                >
                  상세
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ ...trendCardInnerPanel, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 4 }}>회수율</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span
                      style={{ fontSize: 22, fontWeight: 700, color: '#1a56db', lineHeight: 1.1 }}
                    >
                      {recoverySummary.ratePct}
                    </span>
                    <span style={{ fontSize: 12, color: '#555' }}>%</span>
                  </div>
                </div>
                <div style={{ ...trendCardInnerPanel, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 4 }}>
                    총 투자·대출
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.2 }}>
                    {recoverySummary.total}
                  </div>
                </div>
                <div style={{ ...trendCardInnerPanel, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 4 }}>회수 완료</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a', lineHeight: 1.2 }}>
                    {recoverySummary.recovered}
                  </div>
                </div>
                <div style={{ ...trendCardInnerPanel, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 4 }}>미회수</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#c2410c', lineHeight: 1.2 }}>
                    {recoverySummary.outstanding}
                  </div>
                </div>
              </div>
              <div style={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={recoveryTrendData}
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[75, 95]} unit="%" />
                    <Tooltip
                      formatter={(value, name) => {
                        if (typeof value !== 'number') return [String(value ?? ''), String(name)];
                        return [`${value}%`, '회수율'];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="회수율"
                      stroke="#1a56db"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ═══ 우 패널 ═══════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* ── 내 업무 (바로가기와 동일 버튼 톤, 1행 4열) ───────────── */}
            <div
              className="content-box-wrap type-02"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8EDF3',
                borderRadius: 16,
                padding: '1.25rem',
              }}
            >
              <div className="title-row-wrap">
                <h3>내 업무</h3>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                }}
              >
                {myWorkItems.map(({ label, count, Icon, color, iconBg }) => (
                  <button
                    key={label}
                    type="button"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '0.65rem 0.35rem',
                      height: 68,
                      background: '#E8EEF5',
                      border: '1px solid #E8EDF3',
                      borderRadius: 10,
                      boxShadow: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all .15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: iconBg,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={15} color={color} aria-hidden />
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#556070',
                        lineHeight: 1,
                      }}
                    >
                      <span>{label}</span>
                      <span
                        style={{
                          color,
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── 바로가기 ─────────────────────────────────────────────── */}
            <div
              className="content-box-wrap type-02"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8EDF3',
                borderRadius: 16,
                padding: '1.25rem',
              }}
            >
              <div className="title-row-wrap">
                <h3>바로가기</h3>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: 2,
                  }}
                  title="더보기"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}
              >
                {shortcuts.map(({ label, href, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => router.push(href)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '0.65rem 0.35rem',
                      height: 68,
                      background: '#E8EEF5',
                      border: '1px solid #E8EDF3',
                      borderRadius: 10,
                      boxShadow: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all .15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: '#EAF1FF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={14} color="#4F6FD8" />
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#556070',
                        lineHeight: 1,
                      }}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── 공지사항 ─────────────────────────────────────────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>공지사항</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {noticesForWidget.map((n, i) => (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 6,
                      padding: '6px 0',
                      borderBottom: i < noticesForWidget.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    {n.isNew && (
                      <span
                        style={{
                          flexShrink: 0,
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: 4,
                          lineHeight: '14px',
                          marginTop: 1,
                        }}
                      >
                        N
                      </span>
                    )}
                    {!n.isNew && <span style={{ width: 16, flexShrink: 0 }} />}
                    <span style={{ flex: 1, fontSize: 11, color: '#333', lineHeight: 1.4 }}>
                      {n.title}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 10,
                        color: '#6c757d',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatNoticeShortDate(n.date)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn type-03"
                  style={{ width: '100%', height: 36, fontSize: 12, fontWeight: 600 }}
                >
                  더보기
                </button>
              </div>
            </div>

            {/* ── 진행중 입찰공고 ───────────────────────────────────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>진행중 입찰공고</h3>
              </div>
              {/* funnel 단계 — 5열 균등 분할 */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'stretch',
                  marginBottom: 12,
                }}
              >
                {bidFunnel.map((step, i) => (
                  <div
                    key={step.label}
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px 2px',
                      borderRight: i < bidFunnel.length - 1 ? '1px solid #e9ecef' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a56db' }}>
                      {step.count}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: '#555',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
              {/* 항목 */}
              {bidItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '7px 0',
                    borderBottom: i < bidItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span
                      style={{
                        background: item.badgeColor,
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.badge}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#1a1a1a' }}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#1a56db',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.amount}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: '#6c757d', paddingLeft: 2 }}>{item.date}</div>
                </div>
              ))}
            </div>

            {/* ── 미상환 현황 ─────────────────────────────────────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>미상환 현황</h3>
              </div>
              {unpaidItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 0',
                    borderBottom: i < unpaidItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  <span
                    style={{
                      background: item.badgeColor,
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '1px 5px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 11,
                      color: '#1a1a1a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </span>
                  {item.amount && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#333',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {item.amount}
                    </span>
                  )}
                  <span
                    style={{ fontSize: 10, color: '#6c757d', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {item.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* end 우 패널 */}
        </div>
      </div>
    </div>
  );
}
