'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart,
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

const YEARS  = [2022, 2023, 2024, 2025, 2026, 2027];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [selectedYear,  setSelectedYear]  = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [activeTab,     setActiveTab]     = useState<TabKey>('all');

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
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    style={{ height: 24, padding: '0 6px', fontSize: 12 }}
                  >
                    {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    style={{ height: 24, padding: '0 6px', fontSize: 12 }}
                  >
                    {MONTHS.map((m) => <option key={m} value={m}>{m}월</option>)}
                  </select>
                </div>
              </div>

              {/* 2열: progress bars(좌) + KPI 수치(우) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', marginBottom: '1rem' }}>
                {/* 상태 progress bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {statusBars.map((bar) => (
                    <div key={bar.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: '#555', fontWeight: 600 }}>{bar.label}</span>
                        <span style={{ color: '#333' }}>{bar.count} &nbsp; {bar.amount}</span>
                      </div>
                      <div className="progress-bar" style={{ height: 8 }}>
                        <div
                          className="progress-fill"
                          style={{ width: `${bar.pct}%`, background: bar.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* KPI 수치 3개 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {projectKpiStats.map((stat) => (
                    <div key={stat.label} style={{
                      background: '#f8faff',
                      border: '1px solid #e2eaf5',
                      borderRadius: 8,
                      padding: '6px 10px',
                    }}>
                      <div style={{ fontSize: 10, color: '#6c757d', marginBottom: 2 }}>{stat.label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{stat.value}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: stat.dir === 'up' ? '#16a34a' : '#ef4444',
                        }}>
                          {stat.dir === 'up' ? '▲' : '▼'} {stat.sub}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2열: 달력(좌) + 탭테이블(우) */}
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem' }}>
                {/* 미니 달력 */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1a56db', marginBottom: 6, textAlign: 'center' }}>
                    {selectedYear}년 {selectedMonth}월
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                    {calendarDow.map((d) => (
                      <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#6c757d', paddingBottom: 3 }}>
                        {d}
                      </div>
                    ))}
                    {calendarCells.map((day, i) => (
                      <div key={i} style={{ textAlign: 'center', fontSize: 11, lineHeight: '22px', position: 'relative' }}>
                        {day !== null && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 22, height: 22,
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
                </div>

                {/* 탭 테이블 */}
                <div style={{ minWidth: 0 }}>
                  {/* 탭 버튼 */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                          height: 22,
                          padding: '0 8px',
                          fontSize: 11,
                          border: '1px solid',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          background:    activeTab === tab.key ? '#1a56db' : '#fff',
                          color:         activeTab === tab.key ? '#fff'    : '#555',
                          borderColor:   activeTab === tab.key ? '#1a56db' : '#dee2e6',
                          fontWeight:    activeTab === tab.key ? 700       : 400,
                        }}
                      >
                        {tab.label} {tab.count}
                      </button>
                    ))}
                  </div>

                  {/* 테이블 */}
                  <table className="data-table" style={{ fontSize: 11 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', width: 60 }}>상태</th>
                        <th style={{ textAlign: 'left' }}>프로젝트명</th>
                        <th style={{ textAlign: 'right', width: 90 }}>금액</th>
                        <th style={{ width: 55 }}>회차</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, i) => (
                        <tr key={i}>
                          <td><span style={statusBadgeStyle(row.status)}>{row.status}</span></td>
                          <td className="text-left" style={{ color: '#1a1a1a', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.name}
                          </td>
                          <td className="text-right">{row.amount}</td>
                          <td className="text-center">{row.round}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 범례 */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 10, color: '#555', flexWrap: 'wrap' }}>
                    {[
                      { label: '상환완료', color: '#1a56db' },
                      { label: '상환예정', color: '#f97316' },
                      { label: '미상환',   color: '#ef4444' },
                      { label: '입찰',     color: '#6c757d' },
                    ].map((l) => (
                      <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── KPI 목표 카드 3개 ───────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {kpiGoals.map((g) => (
                <div key={g.label} className="content-box-wrap type-02">
                  <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 4 }}>{g.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 2 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{g.value}</span>
                    <span style={{ fontSize: 12, color: '#555' }}>{g.unit}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 6 }}>
                    목표 {g.target} &nbsp; 달성률 {g.pct}%
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── 혼합 차트 ────────────────────────────────────────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>월별 사업비 · 투자비 추이</h3>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyPerformanceData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left"  tick={{ fontSize: 11 }} unit="억" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(value, name) => name === '달성률' ? `${value}%` : `${value}억`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar  yAxisId="left"  dataKey="사업비" fill="#3b82f6" opacity={0.85} />
                    <Bar  yAxisId="left"  dataKey="투자비" fill="#f97316" opacity={0.85} />
                    <Line yAxisId="right" type="monotone" dataKey="달성률" stroke="#1a56db" strokeWidth={2} dot={false} />
                  </ComposedChart>
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
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                {[
                  { label: '접수',    count: 7,  color: '#1a56db' },
                  { label: '입찰평가', count: 28, color: '#16a34a' },
                  { label: '검수',    count: 3,  color: '#d97706' },
                  { label: '상환',    count: 3,  color: '#6c757d' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: item.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 14,
                    }}>
                      {item.count}
                    </div>
                    <span style={{ fontSize: 11, color: '#555' }}>{item.label}</span>
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
                    onClick={() => router.push(href)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 4, padding: '0.625rem 0.25rem',
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
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button className="btn type-02" style={{ fontSize: 11, height: 24, minWidth: 60 }}>더보기</button>
              </div>
            </div>

            {/* ── 진행중 입찰공고 ───────────────────────────────────────── */}
            <div className="content-box-wrap type-02">
              <div className="title-row-wrap">
                <h3>진행중 입찰공고</h3>
              </div>
              {/* funnel 단계 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, overflowX: 'auto' }}>
                {bidFunnel.map((step, i) => (
                  <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', minWidth: 44 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a56db' }}>{step.count}</div>
                      <div style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap' }}>{step.label}</div>
                    </div>
                    {i < bidFunnel.length - 1 && (
                      <span style={{ color: '#ccc', fontSize: 12, padding: '0 3px' }}>›</span>
                    )}
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
