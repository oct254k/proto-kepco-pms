'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DrawerPanel from '@/components/common/DrawerPanel';
import StatusBadge from '@/components/common/StatusBadge';
import DocumentViewer from '@/components/common/DocumentViewer';
import { mockContracts } from '@/lib/mock-data/contracts';
import { Contract } from '@/types';
import { formatDate, formatAmount, formatAmountShort } from '@/lib/utils';

const STATUS_OPTIONS = ['전체', '계약체결', '변경', '해지'];

export default function ContractsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'AWARD' | 'ORDER'>('AWARD');

  // 수주계약 검색 필터
  const [awardFilterName, setAwardFilterName] = useState('');
  const [awardFilterEU, setAwardFilterEU] = useState('');
  const [awardFilterStatus, setAwardFilterStatus] = useState('전체');
  const [awardFilterFrom, setAwardFilterFrom] = useState('');
  const [awardFilterTo, setAwardFilterTo] = useState('');

  // 발주계약 검색 필터
  const [orderFilterName, setOrderFilterName] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('전체');
  const [orderFilterFrom, setOrderFilterFrom] = useState('');
  const [orderFilterTo, setOrderFilterTo] = useState('');

  // Drawer 상태
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // DocumentViewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState({ name: '', url: '' });

  // 수주계약 필터
  const awardContracts = useMemo(() => {
    return mockContracts
      .filter(c => c.type === 'AWARD')
      .filter(c => !awardFilterName || c.name.includes(awardFilterName))
      .filter(c => !awardFilterEU || c.counterparty.includes(awardFilterEU))
      .filter(c => awardFilterStatus === '전체' || c.status === awardFilterStatus)
      .filter(c => !awardFilterFrom || c.date >= awardFilterFrom)
      .filter(c => !awardFilterTo || c.date <= awardFilterTo);
  }, [awardFilterName, awardFilterEU, awardFilterStatus, awardFilterFrom, awardFilterTo]);

  // 발주계약 필터
  const orderContracts = useMemo(() => {
    return mockContracts
      .filter(c => c.type === 'ORDER')
      .filter(c => !orderFilterName || c.name.includes(orderFilterName))
      .filter(c => orderFilterStatus === '전체' || c.status === orderFilterStatus)
      .filter(c => !orderFilterFrom || c.date >= orderFilterFrom)
      .filter(c => !orderFilterTo || c.date <= orderFilterTo);
  }, [orderFilterName, orderFilterStatus, orderFilterFrom, orderFilterTo]);

  const handleRowClick = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDrawerOpen(true);
  };

  const handleAwardReset = () => {
    setAwardFilterName(''); setAwardFilterEU(''); setAwardFilterStatus('전체');
    setAwardFilterFrom(''); setAwardFilterTo('');
  };

  const handleOrderReset = () => {
    setOrderFilterName(''); setOrderFilterStatus('전체');
    setOrderFilterFrom(''); setOrderFilterTo('');
  };

  const awardTotal = awardContracts.reduce((s, c) => s + c.amount, 0);
  const orderTotal = orderContracts.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="content-wrap">
      <div className="content-title-wrap">
        <h2>계약 통합조회</h2>
      </div>

      {/* 탭 */}
      <div className="content-box-wrap type-02">
        <div className="tab-list">
          <button className={`tab-btn ${activeTab === 'AWARD' ? 'active' : ''}`} onClick={() => { setActiveTab('AWARD'); setIsDrawerOpen(false); }}>수주계약</button>
          <button className={`tab-btn ${activeTab === 'ORDER' ? 'active' : ''}`} onClick={() => { setActiveTab('ORDER'); setIsDrawerOpen(false); }}>발주계약</button>
        </div>

        {/* 수주계약 탭 */}
        {activeTab === 'AWARD' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 검색 조건 */}
            <div className="content-box-wrap">
              <div className="form-grid" style={{ gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr' }}>
                <label className="form-label">계약명</label>
                <input type="text" value={awardFilterName} onChange={e => setAwardFilterName(e.target.value)} placeholder="계약명 검색" style={{ width: '100%' }} />
                <label className="form-label">에너지사용자</label>
                <input type="text" value={awardFilterEU} onChange={e => setAwardFilterEU(e.target.value)} placeholder="업체명 검색" style={{ width: '100%' }} />
                <label className="form-label">상태</label>
                <select value={awardFilterStatus} onChange={e => setAwardFilterStatus(e.target.value)} style={{ width: '100%' }}>
                  {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                <label className="form-label">계약일(시작)</label>
                <input type="date" value={awardFilterFrom} onChange={e => setAwardFilterFrom(e.target.value)} style={{ width: '100%' }} />
                <label className="form-label">계약일(종료)</label>
                <input type="date" value={awardFilterTo} onChange={e => setAwardFilterTo(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn type-03" onClick={() => {}}>조회</button>
                <button className="btn type-02" onClick={handleAwardReset}>초기화</button>
              </div>
            </div>

            {/* 목록 */}
            <div>
              <div className="title-row-wrap">
                <h3>수주계약 목록</h3>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>총 {awardContracts.length}건</span>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>계약명</th>
                      <th style={{ textAlign: 'left' }}>에너지사용자</th>
                      <th style={{ textAlign: 'right' }}>계약금액</th>
                      <th>계약일</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {awardContracts.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                          해당 조건의 수주계약이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      awardContracts.map(c => (
                        <tr key={c.id} onClick={() => handleRowClick(c)}>
                          <td className="text-left">{c.name}</td>
                          <td className="text-left">{c.counterparty}</td>
                          <td className="text-right">{formatAmount(c.amount)}</td>
                          <td className="text-center">{formatDate(c.date)}</td>
                          <td className="text-center">
                            <StatusBadge
                              type="custom"
                              value={c.status}
                              customLabel={c.status}
                              customBg="#d1e7dd"
                              customText="#0a3622"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* 집계 */}
              <div className="content-box-wrap" style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', display: 'flex', gap: '2rem', fontSize: '12px' }}>
                <span>조회건수: <strong>{awardContracts.length}건</strong></span>
                <span>수주계약금액 합계: <strong>{formatAmountShort(awardTotal)}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* 발주계약 탭 */}
        {activeTab === 'ORDER' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 검색 조건 */}
            <div className="content-box-wrap">
              <div className="form-grid" style={{ gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr' }}>
                <label className="form-label">EPC사명</label>
                <input type="text" value={orderFilterName} onChange={e => setOrderFilterName(e.target.value)} placeholder="업체명/계약명 검색" style={{ width: '100%' }} />
                <label className="form-label">상태</label>
                <select value={orderFilterStatus} onChange={e => setOrderFilterStatus(e.target.value)} style={{ width: '100%' }}>
                  {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                <label className="form-label">계약일(시작)</label>
                <input type="date" value={orderFilterFrom} onChange={e => setOrderFilterFrom(e.target.value)} style={{ width: '100%' }} />
                <label className="form-label" style={{ gridColumn: '1' }}>계약일(종료)</label>
                <input type="date" value={orderFilterTo} onChange={e => setOrderFilterTo(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn type-03" onClick={() => {}}>조회</button>
                <button className="btn type-02" onClick={handleOrderReset}>초기화</button>
              </div>
            </div>

            {/* 목록 */}
            <div>
              <div className="title-row-wrap">
                <h3>발주계약 목록</h3>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>총 {orderContracts.length}건</span>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>계약명</th>
                      <th style={{ textAlign: 'left' }}>EPC사</th>
                      <th style={{ textAlign: 'right' }}>계약금액</th>
                      <th>계약일</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderContracts.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                          해당 조건의 발주계약이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      orderContracts.map(c => (
                        <tr key={c.id} onClick={() => handleRowClick(c)}>
                          <td className="text-left">{c.name}</td>
                          <td className="text-left">{c.counterparty}</td>
                          <td className="text-right">{formatAmount(c.amount)}</td>
                          <td className="text-center">{formatDate(c.date)}</td>
                          <td className="text-center">
                            <StatusBadge
                              type="custom"
                              value={c.status}
                              customLabel={c.status}
                              customBg="#d1e7dd"
                              customText="#0a3622"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* 집계 */}
              <div className="content-box-wrap" style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', display: 'flex', gap: '2rem', fontSize: '12px' }}>
                <span>조회건수: <strong>{orderContracts.length}건</strong></span>
                <span>계약금액 합계: <strong>{formatAmountShort(orderTotal)}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <DrawerPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={activeTab === 'AWARD' ? '수주계약 상세' : '발주계약 상세'}
        width={480}
        footer={
          <div className="button-wrap">
            <button className="btn type-02" onClick={() => { if (selectedContract) router.push('/projects/' + selectedContract.projectId); }}>
              프로젝트 이동 →
            </button>
          </div>
        }
      >
        {selectedContract && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 상태 배지 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '12px', color: '#6c757d' }}>{selectedContract.id}</span>
              <StatusBadge type="custom" value={selectedContract.status} customLabel={selectedContract.status} customBg="#d1e7dd" customText="#0a3622" />
            </div>

            {/* 기본 정보 */}
            <div className="content-box-wrap type-02" style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '12px' }}>기본정보</div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '90px', color: '#555', padding: '3px 0' }}>계약명</td>
                    <td>{selectedContract.name}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '3px 0' }}>{activeTab === 'AWARD' ? '에너지사용자' : 'EPC사'}</td>
                    <td>{selectedContract.counterparty}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '3px 0' }}>계약금액</td>
                    <td>{formatAmount(selectedContract.amount)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '3px 0' }}>계약일</td>
                    <td>{formatDate(selectedContract.date)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#555', padding: '3px 0' }}>상태</td>
                    <td>{selectedContract.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 첨부파일 */}
            <div className="content-box-wrap" style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '12px' }}>첨부파일</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 0' }}>
                <span style={{ flex: 1, fontSize: '12px' }}>📄 contract-sample.pdf</span>
                <button
                  className="btn type-05"
                  onClick={() => {
                    setViewerFile({ name: 'contract-sample.pdf', url: '/sample-docs/contract-sample.pdf' });
                    setViewerOpen(true);
                  }}
                >
                  보기
                </button>
              </div>
            </div>

            {/* 조회시점 */}
            <div className="content-box-wrap" style={{ padding: '0.75rem', fontSize: '12px' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>조회시점</div>
              <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} style={{ width: '100%' }} />
              <div style={{ marginTop: '4px', fontSize: '11px', color: '#6c757d' }}>※ Mock 표시 — 선택한 날짜 기준 계약 현황 조회</div>
            </div>
          </div>
        )}
      </DrawerPanel>

      {/* DocumentViewer */}
      <DocumentViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileName={viewerFile.name}
        fileUrl={viewerFile.url}
        attachType="CONTRACT"
      />
    </div>
  );
}
