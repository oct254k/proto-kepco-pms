'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, LineChart,
} from 'recharts';
import KpiCard from '@/components/common/KpiCard';
import StatusBadge from '@/components/common/StatusBadge';
import { mockDashboardKpi, mockTodayRepayments, mockUncollected, mockNotices } from '@/lib/mock-data/dashboard';
import { mockRepayments } from '@/lib/mock-data/repayments';
import { mockProjects } from '@/lib/mock-data/projects';
import { formatAmountShort, formatDate } from '@/lib/utils';

// 12개월 혼합 차트용 데이터
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

const YEARS = [2022, 2023, 2024, 2025, 2026, 2027];

// mockRepayments에서 PLANNED/INVOICED 건을 최대 5건 추출 (오늘 상환 예정 위젯 보완용)
const plannedRepayments = mockRepayments
  .filter((r) => r.status === 'PLANNED' || r.status === 'INVOICED')
  .slice(0, 5);

// mockTodayRepayments를 기준으로 실제 repayment status를 조회하고,
// mockTodayRepayments에서 status를 찾지 못하면 plannedRepayments로 보완
function buildTodayRepaymentList() {
  const todayList = mockTodayRepayments.map((r) => {
    const repayment = mockRepayments.find(
      (rep) => rep.projectId === r.projectId && rep.round === r.round
    );
    const status = repayment?.status ?? 'PLANNED';
    return { ...r, status };
  });

  if (todayList.length > 0) return todayList.slice(0, 5);

  // mockTodayRepayments가 비어 있으면 PLANNED/INVOICED 건으로 대체
  return plannedRepayments.map((r) => {
    const project = mockProjects.find((p) => p.id === r.projectId);
    return {
      projectId: r.projectId,
      projectName: project?.name ?? r.projectId,
      round: r.round,
      amount: r.billingAmount,
      status: r.status,
    };
  });
}

const todayRepaymentList = buildTodayRepaymentList();

export default function DashboardPage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [alertFilter, setAlertFilter] = useState<string | null>(null);

  const kpi = mockDashboardKpi;

  const filteredUncollected = alertFilter
    ? mockUncollected.filter((u) => u.alertLevel === alertFilter)
    : mockUncollected;

  const recoveryChartData = kpi.monthlyTrend.map((m) => ({
    ...m,
    청구금액: Math.round(m.billed / 10000000) / 10,
    회수금액: Math.round(m.recovered / 10000000) / 10,
    미수금액: Math.round((m.billed - m.recovered) / 10000000) / 10,
  }));

  return (
    <div>
      {/* 브레드크럼 */}
      <div className="breadcrumb-container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">홈</li>
          <li className="breadcrumb-item active">대시보드</li>
        </ol>
      </div>

      {/* 제목 + 연도 선택 */}
      <div className="content-title-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>대시보드</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px' }}>
          <label>조회연도</label>
          <select
            style={{ height: 28, padding: '0 8px' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <span style={{ color: '#6c757d' }}>기준: 2026-04-23 02:00</span>
        </div>
      </div>

      <div className="content-wrap">

        {/* 상단 2열 레이아웃 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>

          {/* 좌: Widget-1 경영실적 */}
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>경영실적 KPI</h3>
            </div>
            {/* KPI 카드 3개 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <KpiCard
                label="사업비 (억원)"
                target={kpi.projectCost.target}
                actual={kpi.projectCost.actual}
                formatFn={formatAmountShort}
              />
              <KpiCard
                label="투자비 (억원)"
                target={kpi.investmentCost.target}
                actual={kpi.investmentCost.actual}
                formatFn={formatAmountShort}
              />
              <KpiCard
                label="EERS 절감량 (TOE)"
                target={kpi.eersSaving.target}
                actual={kpi.eersSaving.actual}
                unit="TOE"
                formatFn={(n) => n.toLocaleString('ko-KR') + 'TOE'}
              />
            </div>

            {/* 혼합 차트 */}
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyPerformanceData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit="억" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(value, name) => name === '달성률' ? `${value}%` : `${value}억`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="사업비" fill="#00a7ea" opacity={0.8} />
                  <Bar yAxisId="left" dataKey="투자비" fill="#4bc6e8" opacity={0.8} />
                  <Line yAxisId="right" type="monotone" dataKey="달성률" stroke="#ff6b35" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 우: Widget-3 오늘의 상환 */}
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>오늘의 상환 예정</h3>
            </div>
            {todayRepaymentList.length === 0 ? (
              <p style={{ color: '#6c757d', textAlign: 'center', padding: '1rem' }}>오늘 예정된 상환이 없습니다.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>프로젝트명</th>
                    <th>회차</th>
                    <th style={{ textAlign: 'right' }}>금액</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {todayRepaymentList.map((r) => (
                    <tr
                      key={r.projectId + r.round}
                      onClick={() => router.push('/projects/' + r.projectId + '?tab=repayment')}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="text-left" style={{ color: '#00a7ea' }}>{r.projectName}</td>
                      <td className="text-center">{r.round}회</td>
                      <td className="text-right">{r.amount.toLocaleString('ko-KR')}원</td>
                      <td className="text-center"><StatusBadge type="repayment" value={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 하단 2열 레이아웃 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>

          {/* 좌: Widget-2 자금회수율 */}
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>자금회수율 현황</h3>
            </div>
            {/* 회수율 KPI */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6c757d' }}>자금회수율</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#00a7ea' }}>{kpi.fundRecovery.rate}%</div>
              </div>
              <div style={{ borderLeft: '1px solid #dee2e6', paddingLeft: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '0.25rem 1rem', fontSize: '11px' }}>
                  <span style={{ color: '#6c757d' }}>총 청구:</span>
                  <span style={{ fontWeight: '700' }}>{formatAmountShort(kpi.fundRecovery.billed)}</span>
                  <span style={{ color: '#6c757d' }}>회수금액:</span>
                  <span style={{ fontWeight: '700', color: '#198754' }}>{formatAmountShort(kpi.fundRecovery.recovered)}</span>
                  <span style={{ color: '#6c757d' }}>미수금:</span>
                  <span style={{ fontWeight: '700', color: '#dc3545' }}>{formatAmountShort(kpi.fundRecovery.uncollected)}</span>
                </div>
              </div>
              {/* IRR 비교 */}
              <div style={{ borderLeft: '1px solid #dee2e6', paddingLeft: '1.5rem' }}>
                <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '0.25rem' }}>IRR 비교</div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#6c757d' }}>계획: </span>
                    <span style={{ fontWeight: '700' }}>{kpi.irr.planned}%</span>
                  </div>
                  <div>
                    <span style={{ color: '#6c757d' }}>실적: </span>
                    <span style={{ fontWeight: '700', color: kpi.irr.actual >= kpi.irr.planned ? '#198754' : '#dc3545' }}>
                      {kpi.irr.actual}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* 월별 라인차트 */}
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recoveryChartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="억" />
                  <Tooltip formatter={(value) => `${value}억`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="청구금액" stroke="#00a7ea" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="회수금액" stroke="#198754" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="미수금액" stroke="#dc3545" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 우: Widget-4 미회수 경보 */}
          <div className="content-box-wrap type-02">
            <div className="title-row-wrap">
              <h3>미회수 경보 현황</h3>
            </div>
            {/* 경보 배지 */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn"
                style={{
                  background: alertFilter === 'RED' ? '#dc3545' : '#f8d7da',
                  color: alertFilter === 'RED' ? '#fff' : '#721c24',
                  minWidth: 'auto', height: 24, fontSize: 11,
                }}
                onClick={() => setAlertFilter(alertFilter === 'RED' ? null : 'RED')}
              >
                RED {kpi.uncollectedAlerts.red}건
              </button>
              <button
                className="btn"
                style={{
                  background: alertFilter === 'ORANGE' ? '#fd7e14' : '#fff3cd',
                  color: alertFilter === 'ORANGE' ? '#fff' : '#856404',
                  minWidth: 'auto', height: 24, fontSize: 11,
                }}
                onClick={() => setAlertFilter(alertFilter === 'ORANGE' ? null : 'ORANGE')}
              >
                ORANGE {kpi.uncollectedAlerts.orange}건
              </button>
              <button
                className="btn"
                style={{
                  background: alertFilter === 'YELLOW' ? '#ffc107' : '#fff9c4',
                  color: alertFilter === 'YELLOW' ? '#fff' : '#856404',
                  minWidth: 'auto', height: 24, fontSize: 11,
                }}
                onClick={() => setAlertFilter(alertFilter === 'YELLOW' ? null : 'YELLOW')}
              >
                YELLOW {kpi.uncollectedAlerts.yellow}건
              </button>
            </div>
            <table className="data-table" style={{ fontSize: '11px' }}>
              <thead>
                <tr>
                  <th>프로젝트명</th>
                  <th>회차</th>
                  <th style={{ textAlign: 'right' }}>금액</th>
                  <th>경과</th>
                  <th>경보</th>
                </tr>
              </thead>
              <tbody>
                {filteredUncollected.map((u) => (
                  <tr key={u.projectId + u.round} onClick={() => router.push('/projects/' + u.projectId)}>
                    <td className="text-left" style={{ color: '#00a7ea' }}>{u.projectName}</td>
                    <td className="text-center">{u.round}회</td>
                    <td className="text-right">{formatAmountShort(u.amount)}</td>
                    <td className="text-center" style={{ color: '#dc3545', fontWeight: '700' }}>D+{u.elapsedDays}</td>
                    <td className="text-center">
                      <StatusBadge type="alert" value={u.alertLevel} />
                    </td>
                  </tr>
                ))}
                {filteredUncollected.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#6c757d', padding: '1rem' }}>현재 미회수 현황이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget-5 공지사항 */}
        <div className="content-box-wrap type-02">
          <div className="title-row-wrap">
            <h3>공지사항</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>No</th>
                <th style={{ textAlign: 'left' }}>제목</th>
                <th style={{ width: 100 }}>날짜</th>
              </tr>
            </thead>
            <tbody>
              {mockNotices.map((n, i) => (
                <tr key={n.id}>
                  <td className="text-center">{i + 1}</td>
                  <td className="text-left">
                    {n.isNew && (
                      <span style={{
                        background: '#dc3545', color: '#fff', fontSize: '10px',
                        padding: '1px 5px', borderRadius: '10px', marginRight: '0.5rem',
                      }}>NEW</span>
                    )}
                    {n.title}
                  </td>
                  <td className="text-center" style={{ color: '#6c757d' }}>{formatDate(n.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
