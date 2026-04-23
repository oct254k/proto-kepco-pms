'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import DrawerPanel from '@/components/common/DrawerPanel';
import StatusBadge from '@/components/common/StatusBadge';
import { mockProjects } from '@/lib/mock-data/projects';
import { Project } from '@/types';
import { formatDate, formatAmount } from '@/lib/utils';

// Mock IRR 데이터
const IRR_DATA: Record<string, { plannedIrr: number; actualIrr: number; settlementStatus: '결산완료' | '미완료'; settlementDate?: string; totalInvestment: number; totalRepayment: number; period: string }> = {
  'PRJ-2024-001': { plannedIrr: 8.2, actualIrr: 7.8, settlementStatus: '미완료', totalInvestment: 200000000, totalRepayment: 0, period: '36개월' },
  'PRJ-2024-003': { plannedIrr: 9.1, actualIrr: 8.5, settlementStatus: '미완료', totalInvestment: 1200000000, totalRepayment: 0, period: '84개월' },
  'PRJ-2023-001': { plannedIrr: 7.5, actualIrr: 7.5, settlementStatus: '결산완료', settlementDate: '2025-12-31', totalInvestment: 500000000, totalRepayment: 620000000, period: '36개월' },
  'PRJ-2023-002': { plannedIrr: 8.8, actualIrr: 8.3, settlementStatus: '미완료', totalInvestment: 1800000000, totalRepayment: 0, period: '60개월' },
  'PRJ-2024-005': { plannedIrr: 8.0, actualIrr: 7.6, settlementStatus: '미완료', totalInvestment: 420000000, totalRepayment: 0, period: '60개월' },
};

// 결산 대상 상태
const TARGET_STATUSES = ['REPAYMENT', 'COMPLETED', 'LUMP_SUM'];

const settlementProjects = mockProjects.filter(p => TARGET_STATUSES.includes(p.status) && IRR_DATA[p.id]);

export default function SettlementPage() {
  const router = useRouter();

  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('전체');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return settlementProjects.filter(p => {
      const nameOk = !filterName || p.name.includes(filterName);
      const irr = IRR_DATA[p.id];
      const statusOk = filterStatus === '전체'
        || (filterStatus === '결산완료' && irr?.settlementStatus === '결산완료')
        || (filterStatus === '미완료' && irr?.settlementStatus === '미완료');
      return nameOk && statusOk;
    });
  }, [filterName, filterStatus]);

  const handleRowClick = (project: Project) => {
    setSelectedProject(project);
    setIsDrawerOpen(true);
  };

  const handleReset = () => {
    setFilterName('');
    setFilterStatus('전체');
  };

  const selectedIrr = selectedProject ? IRR_DATA[selectedProject.id] : null;
  const irrDiff = selectedIrr ? (selectedIrr.actualIrr - selectedIrr.plannedIrr) : 0;

  const irrChartData = selectedIrr
    ? [{ name: 'IRR 비교', '계획IRR': selectedIrr.plannedIrr, '실적IRR': selectedIrr.actualIrr }]
    : [];

  return (
    <div className="content-wrap">
      <div className="content-title-wrap">
        <h2>사업결산·IRR</h2>
      </div>

      {/* 검색 조건 */}
      <div className="content-box-wrap">
        <div className="form-grid" style={{ gridTemplateColumns: 'auto 1fr auto 1fr' }}>
          <label className="form-label">프로젝트명</label>
          <input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="프로젝트명 검색" style={{ width: '100%' }} />
          <label className="form-label">결산상태</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%' }}>
            <option>전체</option>
            <option>결산완료</option>
            <option>미완료</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn type-03" onClick={() => {}}>조회</button>
          <button className="btn type-02" onClick={handleReset}>초기화</button>
        </div>
      </div>

      {/* 목록 */}
      <div className="content-box-wrap type-02">
        <div className="title-row-wrap">
          <h3>사업결산 목록</h3>
          <span style={{ fontSize: '12px', color: '#6c757d' }}>총 {filtered.length}건</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th style={{ textAlign: 'left' }}>프로젝트명</th>
                <th style={{ textAlign: 'left' }}>에너지사용자</th>
                <th style={{ textAlign: 'right' }}>계획IRR</th>
                <th style={{ textAlign: 'right' }}>실적IRR</th>
                <th>결산상태</th>
                <th>결산일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                    조건에 맞는 결산 건이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((project, idx) => {
                  const irr = IRR_DATA[project.id];
                  const diff = irr.actualIrr - irr.plannedIrr;
                  return (
                    <tr key={project.id} onClick={() => handleRowClick(project)}>
                      <td className="text-center">{idx + 1}</td>
                      <td className="text-left">{project.name}</td>
                      <td className="text-left">{project.energyUser}</td>
                      <td className="text-right">{irr.plannedIrr.toFixed(1)}%</td>
                      <td className="text-right">
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          {irr.actualIrr.toFixed(1)}%
                          <span style={{ fontSize: '11px', color: diff >= 0 ? '#28a745' : '#dc3545' }}>
                            {diff >= 0 ? `▲+${diff.toFixed(1)}%` : `▼${diff.toFixed(1)}%`}
                          </span>
                        </span>
                      </td>
                      <td className="text-center">
                        <StatusBadge
                          type="custom"
                          value={irr.settlementStatus}
                          customLabel={irr.settlementStatus}
                          customBg={irr.settlementStatus === '결산완료' ? '#d1e7dd' : '#e2e3e5'}
                          customText={irr.settlementStatus === '결산완료' ? '#0a3622' : '#383d41'}
                        />
                      </td>
                      <td className="text-center">{irr.settlementDate ? formatDate(irr.settlementDate) : '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <DrawerPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="사업결산 상세"
        width={640}
        footer={
          <div className="button-wrap">
            <button className="btn type-02" onClick={() => { if (selectedProject) router.push('/projects/' + selectedProject.id); }}>
              프로젝트 이동 →
            </button>
          </div>
        }
      >
        {selectedProject && selectedIrr && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '13px' }}>{selectedProject.name}</span>
              <StatusBadge type="project" value={selectedProject.status} />
              <StatusBadge
                type="custom"
                value={selectedIrr.settlementStatus}
                customLabel={selectedIrr.settlementStatus}
                customBg={selectedIrr.settlementStatus === '결산완료' ? '#d1e7dd' : '#e2e3e5'}
                customText={selectedIrr.settlementStatus === '결산완료' ? '#0a3622' : '#383d41'}
              />
            </div>

            {/* 재무 현황 */}
            <div className="content-box-wrap type-02" style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '12px' }}>재무 현황</div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '120px', color: '#555', padding: '3px 0' }}>에너지사용자</td>
                    <td>{selectedProject.energyUser}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '3px 0' }}>총 투자비</td>
                    <td>{formatAmount(selectedIrr.totalInvestment)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '3px 0' }}>총 상환금액</td>
                    <td>{selectedIrr.totalRepayment > 0 ? formatAmount(selectedIrr.totalRepayment) : '상환 진행 중'}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '3px 0' }}>사업기간</td>
                    <td>{selectedIrr.period}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* IRR 비교 섹션 */}
            <div className="content-box-wrap type-02" style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '12px' }}>IRR 비교</div>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>계획 IRR</div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{selectedIrr.plannedIrr.toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>실적 IRR</div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{selectedIrr.actualIrr.toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>IRR 차이</div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: irrDiff >= 0 ? '#28a745' : '#dc3545',
                  }}>
                    {irrDiff >= 0 ? `▲ +${irrDiff.toFixed(1)}%` : `▼ ${irrDiff.toFixed(1)}%`}
                    <span style={{ fontSize: '11px', marginLeft: '4px' }}>
                      {irrDiff >= 0 ? '(목표 달성)' : '(목표 미달)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recharts BarChart */}
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={irrChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, Math.ceil(Math.max(selectedIrr.plannedIrr, selectedIrr.actualIrr) + 1)]} />
                    <Tooltip formatter={(v) => typeof v === 'number' ? `${v.toFixed(1)}%` : v} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="계획IRR" fill="#adb5bd" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="실적IRR" fill={irrDiff >= 0 ? '#28a745' : '#dc3545'} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* IRR 계산 근거 테이블 */}
            <div className="content-box-wrap" style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '12px' }}>IRR 계산 근거</div>
              <table className="data-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>항목</th>
                    <th style={{ textAlign: 'right' }}>값</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-left">투자비</td>
                    <td className="text-right">{formatAmount(selectedIrr.totalInvestment)}</td>
                  </tr>
                  <tr>
                    <td className="text-left">총상환금액</td>
                    <td className="text-right">{selectedIrr.totalRepayment > 0 ? formatAmount(selectedIrr.totalRepayment) : '-'}</td>
                  </tr>
                  <tr>
                    <td className="text-left">사업기간</td>
                    <td className="text-right">{selectedIrr.period}</td>
                  </tr>
                  <tr>
                    <td className="text-left">계획IRR</td>
                    <td className="text-right">{selectedIrr.plannedIrr.toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="text-left">실적IRR</td>
                    <td className="text-right">{selectedIrr.actualIrr.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DrawerPanel>
    </div>
  );
}
