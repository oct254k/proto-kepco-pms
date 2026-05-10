'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, LineChart,
} from 'recharts';
import {
  FileText, Briefcase, DollarSign, FolderKanban,
  Calculator, User, LayoutGrid,
} from 'lucide-react';
import { mockDashboardKpi, mockNotices } from '@/lib/mock-data/dashboard';

// ── 월별 차트 데이터 ──────────────────────────────────────────────────────────
const monthlyPerformanceData = [
  { month: '1월',  사업비: 4.2, 투자비: 3.1, 달성률: 72 },
  { month: '2월',  사업비: 5.1, 투자비: 3.8, 달성률: 75 },
  { month: '3월',  사업비: 6.8, 투자비: 4.9, 달성률: 78 },
  { month: '4월',  사업비: 5.5, 투자비: 4.1, 달성률: 80 },
  { month: '5월',  사업비: 7.2, 투자비: 5.3, 달성률: 82 },
  { month: '6월',  사업비: 8.1, 투자비: 6.0, 달성률: 83 },
  { month: '7월',  사업비: 7.5, 투자비: 5.6, 달성률: 84 },
  { month: '8월',  사업비: 6.9, 투자비: 5.1, 달성률: 83 },
  { month: '9월',  사업비: 6.2, 투자비: 4.7, 달성률: 82 },
  { month: '10월', 사업비: 5.8, 투자비: 4.3, 달성률: 81 },
  { month: '11월', 사업비: 5.1, 투자비: 3.8, 달성률: 83 },
  { month: '12월', 사업비: 4.5, 투자비: 3.3, 달성률: 84 },
];

// ── TOP KPI BAR 데이터 ────────────────────────────────────────────────────────
const topKpiItems = [
  { label: '신규사업',     value: '3건',    sub: '심의대기 12' },
  { label: '수주 계약',   value: '218건',  sub: '투자 205  물약·공사 120' },
  { label: '공고평가',    value: '7건',    sub: '공고 7  평가 2' },
  { label: '발주 계약',   value: '17건',   sub: '' },
  { label: '상환 완료율', value: '87.1%',  sub: '전월대비 5.5% ↑ / 4.6 억원' },
  { label: '미상환',      value: '3건',    sub: '' },
  { label: '가상계좌 연결', value: '75.2%', sub: '미연결 12' },
  { label: '세금계산서',  value: '104건',  sub: '오늘발행 26건 납부' },
];

// ── 사업 현황 progress bar 데이터 ────────────────────────────────────────────
const statusBars = [
  { label: '상환완료', count: '14건', amount: '19.8억', pct: 70, color: '#1a56db' },
  { label: '상환예정', count: '18건', amount: '11.8억', pct: 26, color: '#f97316' },
  { label: '미상환',   count:  '2건', amount:  '2.1억', pct:  4, color: '#ef4444' },
];

// ── 사업 현황 우측 KPI 수치 ──────────────────────────────────────────────────
const projectKpiStats = [
  { label: '사업비 실적',    value: '908억',      sub: '달성률 97.5%',  dir: 'up'   },
  { label: '에너지 절감량', value: '1,302 toe',  sub: '전월대비 2.4%', dir: 'down' },
  { label: 'EERS 절감량',   value: '2,092 MWh', sub: '전월대비 4.7%', dir: 'up'   },
];

// ── 달력 (2024년 5월 기준 고정 mock – 사양서 그대로) ─────────────────────────
// 일~토 기준, 앞에 빈 셀 3개 (첫 날이 수요일이므로 일/월/화 = 3칸 blank)
const calendarCells: (number | null)[] = [
  null, null, null,
  1, 2, 3, 4,
  5, 6, 7, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30,
];
const calendarDow = ['일', '월', '화', '수', '목', '금', '토'];
const CALENDAR_TODAY = 20;

// ── 탭 테이블 mock ────────────────────────────────────────────────────────────
type TabKey = 'all' | 'completed' | 'planned' | 'unpaid';
const tabTableData = [
  { status: '상환완료', name: '송암시스콤 LED',                     amount: '138,904,030', round: '45회차' },
  { status: '상환완료', name: '가양 ENT 보일러',                   amount:     '346,000', round: '98회차' },
  { status: '상환완료', name: '마스턴172 성수 오피스 연료전지 구매', amount:   '8,904,030', round:  '5회차' },
  { status: '상환완료', name: '송암시스콤 LED',                     amount:   '8,904,030', round: '18회차' },
  { status: '상환예정', name: '에너지엑스 빌딩 정보통신공사',       amount:  '56,904,543', round: '28회차' },
  { status: '상환완료', name: '송암시스콤 LED',                     amount:  '338,346,65', round: '45회차' },
];
const tabs: { key: TabKey; label: string; count: number }[] = [
  { key: 'all',       label: '전체',   count: 98 },
  { key: 'completed', label: '상환완료', count:  7 },
  { key: 'planned',   label: '상환예정', count: 55 },
  { key: 'unpaid',    label: '미상환',   count: 12 },
];

// ── KPI 목표 카드 (mockDashboardKpi 재사용) ───────────────────────────────────
const kpiGoals = [
  {
    label:  '사업비 (억원)',
    value:  '72.0',
    unit:   '억',
    target: '85.0억',
    pct:     85,
    color:  '#1a56db',
  },
  {
    label:  '투자비 (억원)',
    value:  '58.0',
    unit:   '억',
    target: '62.0억',
    pct:     94,
    color:  '#1a56db',
  },
  {
    label:  'EEPS 절감량 (TOE)',
    value:  '98',
    unit:   'TOE',
    target: '120TOE',
    pct:     50,
    color:  '#1a56db',
  },
];

// ── 자금회수율 현황 (mock) ───────────────────────────────────────────────────
const recoverySummary = {
  ratePct: 88.4,
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
  { label: '사업접수',    href: '/opportunity/new', Icon: FileText },
  { label: '계약',        href: '/contracts',        Icon: Briefcase },
  { label: '자금관리',   href: '/funds/investment', Icon: DollarSign },
  { label: '프로젝트관리', href: '/projects',       Icon: FolderKanban },
  { label: '사업결산',   href: '/settlement',       Icon: Calculator },
  { label: '마이페이지', href: '/mypage',           Icon: User },
];

// ── 진행중 입찰공고 funnel ──────────────────────────────────────────────────
const bidFunnel = [
  { label: '공고중',   count: 4 },
  { label: '투찰접수', count: 18 },
  { label: '평가중',   count: 2 },
  { label: '낙찰',     count: 8 },
  { label: '검수',     count: 1 },
];
const bidItems = [
  { badge: '마감D-2', name: '가양 ENT 보일러',             amount: '138,909,003원', date: '2026.05.12 오후 4:00',    badgeColor: '#ef4444' },
  { badge: '잔기자일', name: '에너지엑스 빌딩 정보통신공사', amount:  '76,909,003원', date: '우수점 2029.05.06',       badgeColor: '#6c757d' },
];

// ── 미상환 현황 ──────────────────────────────────────────────────────────────
const unpaidItems = [
  { badge: '마이에일', name: '가양 ENT 보일러',             amount: '138,909,003원', sub: '이상환 3회', badgeColor: '#ef4444' },
  { badge: '인계',     name: '에너지엑스 빌딩 정보통신공사', amount:  '76,909,003원', sub: '이상환 1회', badgeColor: '#1a56db' },
  { badge: '보증서',   name: '에너지엑스 빌딩 정보통신공사', amount: '',              sub: '이행보증',   badgeColor: '#f59e0b' },
];

// ── 상태배지 색상 헬퍼 ────────────────────────────────────────────────────────
const statusBadgeStyle = (status: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    '상환완료': { bg: '#dbeafe', color: '#1d4ed8' },
    '상환예정': { bg: '#ffedd5', color: '#c2410c' },
    '미상환':   { bg: '#fee2e2', color: '#b91c1c' },
    '전체예정': { bg: '#f3f4f6', color: '#374151' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#374151' };
  return {
    display: 'inline-flex', alignItems: 'center',
    padding: '1px 6px', borderRadius: 10,
    fontSize: 11, fontWeight: 600,
    background: s.bg, color: s.color,
    whiteSpace: 'nowrap',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [selectedYear,  setSelectedYear]  = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [activeTab,     setActiveTab]     = useState<TabKey>('all');
  const [chartWidth, setChartWidth] = useState(700);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chartContainerRef.current;
    if (el && el.offsetWidth > 0) setChartWidth(el.offsetWidth);
  }, []);

  const kpi = mockDashboardKpi;

  // 탭별 테이블 필터
  const filteredRows = activeTab === 'all'
    ? tabTableData
    : tabTableData.filter((r) => {
        if (activeTab === 'completed') return r.status === '상환완료';
        if (activeTab === 'planned')   return r.status === '상환예정';
        if (activeTab === 'unpaid')    return r.status === '미상환';
        return true;
      });

  return (
    <div>
      {/* ── TOP KPI BAR ──────────────────────────────────────────────────── */}
      <div style={{
        background: '#0F2044',
        margin: '-1px -28px 1rem',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'stretch',
      }}>
        {topKpiItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft: idx === 0 ? 0 : '1rem',
              paddingRight: idx === topKpiItems.length - 1 ? 0 : '1rem',
              borderRight: idx < topKpiItems.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2, whiteSpace: 'nowrap' }}>
              {item.label}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              {item.value}
            </div>
            {item.sub && (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── 페이지 제목 ─────────────────────────────────────────────────── */}
      <div className="content-title-wrap">
        <h2>경영실적</h2>
      </div>

      {/* ── 참고 스크린샷 ───────────────────────────────────────────────── */}
      <div className="content-box-wrap type-02" style={{ marginBottom: '1rem' }}>
        <div className="title-row-wrap">
          <h3>디자인 참고</h3>
        </div>
        <img
          src="/dashboard/design-reference.png"
          alt="KEPCO ES 경영 대시보드 화면 참고용 스크린샷"
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 4 }}
        />
      </div>

      {/* ── 메인 2열 레이아웃 ─────────────────────────────────────────── */}
      <div className="content-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem', alignItems: 'start' }}>

          {/* ═══ 좌 패널 ═══════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* ── 사업 현황 카드 ─────────────────────────────────────── */}
            <div className="content-box-wrap type-02">
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

              {/* 가로 그래프(축소) + KPI 3열 한 줄(각 상단 라인) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 36%) 1fr', gap: '1rem', marginBottom: '1rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {statusBars.map((bar) => (
                    <div key={bar.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                        <span style={{ color: '#555', fontWeight: 600 }}>{bar.label}</span>
                        <span style={{ color: '#333' }}>{bar.count} {bar.amount}</span>
                      </div>
                      <div style={{ height: 5, background: '#e9ecef', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{ height: '100%', width: `${bar.pct}%`, background: bar.color, borderRadius: 3, transition: 'width 0.3s ease' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', minWidth: 0 }}>
                  {projectKpiStats.map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        borderTop: '2px solid #1a56db',
                        paddingTop: 8,
                        minWidth: 0,
                      }}
                    >
                      <div style={{ fontSize: 10, color: '#6c757d', marginBottom: 4 }}>{stat.label}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{stat.value}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: stat.dir === 'up' ? '#16a34a' : '#ef4444',
                        }}>
                          {stat.dir === 'up' ? '▲' : '▼'} {stat.sub}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 달력(50%) + 탭·그리드(계약 등과 동일 패턴) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 50%) minmax(0, 1fr)', gap: '1rem', alignItems: 'start' }}>
                {/* 미니 달력 + 범례 */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a56db', marginBottom: 8, textAlign: 'center' }}>
                    {selectedYear}년 {selectedMonth}월
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                    {calendarDow.map((d) => (
                      <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#6c757d', paddingBottom: 4 }}>
                        {d}
                      </div>
                    ))}
                    {calendarCells.map((day, i) => (
                      <div key={i} style={{ textAlign: 'center', fontSize: 11, lineHeight: '26px' }}>
                        {day !== null && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 26, height: 26,
                            borderRadius: '50%',
                            background: day === CALENDAR_TODAY ? '#1a56db' : 'transparent',
                            color: day === CALENDAR_TODAY ? '#fff' : '#333',
                            fontWeight: day === CALENDAR_TODAY ? 700 : 400,
                          }}>
                            {day}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 10, color: '#555', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[
                      { label: '상환완료', color: '#1a56db' },
                      { label: '상환예정', color: '#f97316' },
                      { label: '미상환',   color: '#ef4444' },
                      { label: '입찰',     color: '#6c757d' },
                    ].map((l) => (
                      <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>

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
                  <div className="table-wrap">
                    <table className="data-table" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', width: 72 }}>상태</th>
                          <th style={{ textAlign: 'left' }}>프로젝트명</th>
                          <th style={{ textAlign: 'right', width: 100 }}>금액</th>
                          <th style={{ width: 56 }}>회차</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row, i) => (
                          <tr key={i}>
                            <td><span style={statusBadgeStyle(row.status)}>{row.status}</span></td>
                            <td className="text-left" style={{ color: '#1a1a1a', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

            {/* ── 사업비·투자비 목표 + 월별 추이 (단일 카드) ───────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>월별 사업비 · 투자비 추이</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                {kpiGoals.map((g) => (
                  <div
                    key={g.label}
                    style={{
                      border: '1px solid var(--card-border, #e6ebf0)',
                      borderRadius: 8,
                      padding: '0.75rem 0.875rem',
                      background: 'var(--bg-page, #f4f7f9)',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 4 }}>{g.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 2 }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{g.value}</span>
                      <span style={{ fontSize: 12, color: '#555' }}>{g.unit}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 6 }}>
                      목표 {g.target} &nbsp; 달성률 {g.pct}%
                    </div>
                    <div style={{ height: 8, background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${g.pct}%`, background: g.color, borderRadius: 4, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div ref={chartContainerRef} style={{ height: 220, width: '100%', overflow: 'hidden' }}>
                <ComposedChart
                  width={chartWidth}
                  height={220}
                  data={monthlyPerformanceData}
                  margin={{ top: 4, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 11 }} unit="억" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(value: number, name: string) => (name === '달성률' ? `${value}%` : `${value}억`)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar  yAxisId="left"  dataKey="사업비" fill="#3b82f6" opacity={0.85} />
                  <Bar  yAxisId="left"  dataKey="투자비" fill="#f97316" opacity={0.85} />
                  <Line yAxisId="right" type="monotone" dataKey="달성률" stroke="#1a56db" strokeWidth={2} dot={false} />
                </ComposedChart>
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
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                gap: '0.75rem 1.25rem',
                marginBottom: '1rem',
              }}>
                <div style={{ marginRight: 'auto' }}>
                  <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 4 }}>회수율</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1a56db', lineHeight: 1.1 }}>
                    {recoverySummary.ratePct}%
                  </div>
                </div>
                <div style={{ flex: '1 1 120px', minWidth: 100 }}>
                  <div style={{ fontSize: 10, color: '#6c757d', marginBottom: 2 }}>총 투자·대출</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{recoverySummary.total}</div>
                </div>
                <div style={{ flex: '1 1 120px', minWidth: 100 }}>
                  <div style={{ fontSize: 10, color: '#6c757d', marginBottom: 2 }}>회수 완료</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{recoverySummary.recovered}</div>
                </div>
                <div style={{ flex: '1 1 120px', minWidth: 100 }}>
                  <div style={{ fontSize: 10, color: '#6c757d', marginBottom: 2 }}>미회수</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#c2410c' }}>{recoverySummary.outstanding}</div>
                </div>
              </div>
              <div style={{ height: 200, width: '100%' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={recoveryTrendData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[75, 95]} unit="%" />
                    <Tooltip formatter={(v: number) => [`${v}%`, '회수율']} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="회수율" stroke="#1a56db" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ═══ 우 패널 ═══════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* ── 내 업무 ─────────────────────────────────────────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>내 업무</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {[
                  { label: '접수',    count: 7,  color: '#1a56db' },
                  { label: '입찰평가', count: 28, color: '#16a34a' },
                  { label: '검수',    count: 3,  color: '#d97706' },
                  { label: '상환',    count: 3,  color: '#6c757d' },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '0.75rem 0.5rem',
                      background: '#fff',
                      border: '1px solid #e2eaf5',
                      borderRadius: 8,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: item.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 14,
                    }}>
                      {item.count}
                    </div>
                    <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 바로가기 ─────────────────────────────────────────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>바로가기</h3>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: 2 }}
                  title="더보기"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {shortcuts.map(({ label, href, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => router.push(href)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 6, padding: '0.75rem 0.5rem', minHeight: 72,
                      background: '#f8faff', border: '1px solid #e2eaf5',
                      borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <Icon size={18} color="#1a56db" />
                    <span style={{ fontSize: 11, color: '#333', fontWeight: 500 }}>{label}</span>
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
                {[
                  { isNew: true,  title: 'PMS·SRM 통합시스템 오픈 안내 인내트됩니다.',          date: '26.05.02' },
                  { isNew: true,  title: '2026년 1분기 경영실적 보고서 제출안내드립니다.',       date: '26.05.02' },
                  { isNew: false, title: 'EERS 제도 변경 사항 공유 (산업부 고시)',              date: '26.04.30' },
                  { isNew: false, title: '협력업체 신용평가 갱신 요청 (3월 만료 업체)',          date: '26.04.30' },
                ].map((n, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 6,
                    padding: '6px 0',
                    borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none',
                  }}>
                    {n.isNew && (
                      <span style={{
                        flexShrink: 0, background: '#ef4444', color: '#fff',
                        fontSize: 9, fontWeight: 700,
                        padding: '1px 4px', borderRadius: 4, lineHeight: '14px',
                        marginTop: 1,
                      }}>N</span>
                    )}
                    {!n.isNew && <span style={{ width: 16, flexShrink: 0 }} />}
                    <span style={{ flex: 1, fontSize: 11, color: '#333', lineHeight: 1.4 }}>{n.title}</span>
                    <span style={{ flexShrink: 0, fontSize: 10, color: '#6c757d', whiteSpace: 'nowrap' }}>{n.date}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <button type="button" className="btn type-03" style={{ width: '100%', height: 36, fontSize: 12, fontWeight: 600 }}>
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
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a56db' }}>{step.count}</div>
                    <div style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
              {/* 항목 */}
              {bidItems.map((item, i) => (
                <div key={i} style={{
                  padding: '7px 0',
                  borderBottom: i < bidItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{
                      background: item.badgeColor, color: '#fff',
                      fontSize: 10, fontWeight: 600,
                      padding: '1px 5px', borderRadius: 4, whiteSpace: 'nowrap',
                    }}>{item.badge}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#1a1a1a' }}>{item.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#1a56db', whiteSpace: 'nowrap' }}>{item.amount}</span>
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
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 0',
                  borderBottom: i < unpaidItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}>
                  <span style={{
                    background: item.badgeColor, color: '#fff',
                    fontSize: 10, fontWeight: 600,
                    padding: '1px 5px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0,
                  }}>{item.badge}</span>
                  <span style={{ flex: 1, fontSize: 11, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                  {item.amount && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#333', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.amount}</span>
                  )}
                  <span style={{ fontSize: 10, color: '#6c757d', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.sub}</span>
                </div>
              ))}
            </div>

          </div>{/* end 우 패널 */}
        </div>
      </div>
    </div>
  );
}
