'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ModalDialog from '@/components/common/ModalDialog';
import StatusBadge from '@/components/common/StatusBadge';
import { mockProjects } from '@/lib/mock-data/projects';
import { formatDate, formatAmountShort } from '@/lib/utils';

// Mock 현재 사용자
const MOCK_USER = {
  name: '김민준',
  department: 'EERS사업팀',
  phone: '010-1234-5678',
  email: 'kimmin@kepco.com',
  role: '과장',
  lastLogin: '2026-04-20',
};

// Mock 수정 요청 목록
const MOCK_REQUESTS = [
  { id: 'REQ-001', projectId: 'PRJ-2024-001', projectName: '광명전기 LED 교체', content: '6회차 상환금액 수정 요청', status: 'COMPLETED' as const, createdAt: '2025-03-10' },
  { id: 'REQ-002', projectId: 'PRJ-2024-003', projectName: '인천항 냉동창고 절감', content: '계약금액 단위 오류 수정', status: 'PENDING' as const, createdAt: '2025-04-01' },
  { id: 'REQ-003', projectId: 'PRJ-2024-002', projectName: '한국철강 ESS 설치', content: '착공일 변경 요청', status: 'PENDING' as const, createdAt: '2025-04-15' },
];

export default function MyPage() {
  const router = useRouter();

  // 섹션 접힘/펼침
  const [section1Open, setSection1Open] = useState(true);
  const [section2Open, setSection2Open] = useState(false);
  const [section3Open, setSection3Open] = useState(false);

  // 나의 프로젝트 필터
  const [filterProjectName, setFilterProjectName] = useState('');

  // 사용자 정보
  const [editPhone, setEditPhone] = useState(MOCK_USER.phone);
  const [editEmail, setEditEmail] = useState(MOCK_USER.email);
  const [savedMsg, setSavedMsg] = useState('');

  // 수정 요청 목록
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  // 신규 요청 Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqProject, setReqProject] = useState('');
  const [reqContent, setReqContent] = useState('');
  const [reqError, setReqError] = useState('');

  // 나의 담당 프로젝트 (Mock 현재 사용자 = '김민준')
  const myProjects = useMemo(() => {
    return mockProjects.filter(p => p.manager === MOCK_USER.name);
  }, []);

  const filteredProjects = useMemo(() => {
    return myProjects.filter(p => !filterProjectName || p.name.includes(filterProjectName));
  }, [myProjects, filterProjectName]);

  // 사용자 정보 저장
  const handleSave = () => {
    setSavedMsg('저장되었습니다.');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  // 수정 요청 제출
  const handleRequestSubmit = () => {
    if (!reqProject) { setReqError('프로젝트를 선택하세요.'); return; }
    if (!reqContent.trim()) { setReqError('수정내용을 입력하세요.'); return; }
    const proj = mockProjects.find(p => p.id === reqProject);
    const newReq = {
      id: `REQ-${String(requests.length + 4).padStart(3, '0')}`,
      projectId: reqProject,
      projectName: proj?.name ?? '',
      content: reqContent,
      status: 'PENDING' as const,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRequests(prev => [newReq, ...prev]);
    setReqProject('');
    setReqContent('');
    setReqError('');
    setIsRequestModalOpen(false);
  };

  const getRequestStatusBadge = (status: 'PENDING' | 'COMPLETED' | 'REJECTED') => {
    const map = {
      PENDING: { label: '처리중', bg: '#fff3cd', text: '#856404' },
      COMPLETED: { label: '완료', bg: '#d1e7dd', text: '#0a3622' },
      REJECTED: { label: '반려', bg: '#f8d7da', text: '#721c24' },
    };
    const s = map[status];
    return <StatusBadge type="custom" value={status} customLabel={s.label} customBg={s.bg} customText={s.text} />;
  };

  return (
    <div className="content-wrap">
      <div className="content-title-wrap">
        <h2>마이페이지</h2>
      </div>

      {/* 섹션1: 나의 사업현황 */}
      <div className="content-box-wrap type-02">
        <button
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
          onClick={() => setSection1Open(v => !v)}
        >
          <div className="title-row-wrap" style={{ marginBottom: section1Open ? '0.75rem' : 0 }}>
            <h3>{section1Open ? '▼' : '▶'} 나의 사업현황</h3>
            <span style={{ fontSize: '12px', color: '#6c757d' }}>담당 프로젝트 {myProjects.length}건</span>
          </div>
        </button>

        {section1Open && (
          <div>
            {/* 상태별 카드 */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { label: '접수', key: 'RECEPTION', color: '#084298', bg: '#cfe2ff' },
                { label: '공사', key: 'CONSTRUCTION', color: '#856404', bg: '#fff3cd' },
                { label: '상환중', key: 'REPAYMENT', color: '#0a3622', bg: '#d1e7dd' },
                { label: '사업종료', key: 'COMPLETED', color: '#383d41', bg: '#e2e3e5' },
              ].map(s => {
                const count = myProjects.filter(p => p.status === s.key).length;
                return (
                  <div
                    key={s.key}
                    style={{
                      border: `1px solid ${s.bg}`,
                      background: s.bg,
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      minWidth: '80px',
                    }}
                    onClick={() => setFilterProjectName('')}
                  >
                    <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{count}</div>
                    <div style={{ fontSize: '11px', color: s.color }}>{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* 검색 필터 */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                value={filterProjectName}
                onChange={e => setFilterProjectName(e.target.value)}
                placeholder="프로젝트명 검색"
                style={{ width: '200px' }}
              />
              <button className="btn type-03" onClick={() => {}}>조회</button>
            </div>

            {/* 프로젝트 목록 */}
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>프로젝트명</th>
                    <th>유형</th>
                    <th style={{ textAlign: 'left' }}>에너지사용자</th>
                    <th>상태</th>
                    <th>착공일</th>
                    <th>준공일</th>
                    <th style={{ textAlign: 'right' }}>사업비</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                        담당 사업이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map(p => (
                      <tr key={p.id} onClick={() => router.push('/projects/' + p.id)}>
                        <td className="text-left">{p.name}</td>
                        <td className="text-center">{p.type}</td>
                        <td className="text-left">{p.energyUser}</td>
                        <td className="text-center">
                          <StatusBadge type="project" value={p.status} />
                        </td>
                        <td className="text-center">{p.startDate ? formatDate(p.startDate) : '-'}</td>
                        <td className="text-center">{p.endDate ? formatDate(p.endDate) : '-'}</td>
                        <td className="text-right">{formatAmountShort(p.projectCost)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 섹션2: 사용자정보 변경 */}
      <div className="content-box-wrap type-02">
        <button
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
          onClick={() => setSection2Open(v => !v)}
        >
          <div className="title-row-wrap" style={{ marginBottom: section2Open ? '0.75rem' : 0 }}>
            <h3>{section2Open ? '▼' : '▶'} 사용자정보 변경</h3>
          </div>
        </button>

        {section2Open && (
          <div>
            {/* 그룹웨어 연동 안내 */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#e8f4fd', border: '1px solid #b8daff', borderRadius: '4px',
              padding: '4px 10px', marginBottom: '0.75rem', fontSize: '11px', color: '#084298',
            }}>
              ℹ 일부 정보는 그룹웨어에서 자동 동기화됩니다
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* 읽기 전용 정보 */}
              <div className="content-box-wrap" style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '0.5rem', color: '#6c757d' }}>그룹웨어 동기화 정보 (읽기 전용)</div>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      { label: '이름', value: MOCK_USER.name },
                      { label: '부서', value: MOCK_USER.department },
                      { label: '직위', value: MOCK_USER.role },
                      { label: '마지막 로그인', value: MOCK_USER.lastLogin },
                    ].map(row => (
                      <tr key={row.label}>
                        <td style={{ color: '#6c757d', padding: '4px 0', width: '90px' }}>{row.label}</td>
                        <td>
                          <input type="text" value={row.value} readOnly className="display" style={{ width: '100%', background: '#f8f9fa' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 변경 가능 항목 */}
              <div className="content-box-wrap type-02" style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '0.5rem' }}>변경 가능 항목</div>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#555', padding: '4px 0', width: '70px' }}>연락처</td>
                      <td>
                        <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ width: '100%' }} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: '#555', padding: '4px 0' }}>이메일</td>
                      <td>
                        <input type="text" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ width: '100%' }} />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn" onClick={handleSave}>저장</button>
                  {savedMsg && <span style={{ fontSize: '11px', color: '#28a745' }}>{savedMsg}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 섹션3: 데이터 수정 요청 */}
      <div className="content-box-wrap type-02">
        <button
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
          onClick={() => setSection3Open(v => !v)}
        >
          <div className="title-row-wrap" style={{ marginBottom: section3Open ? '0.75rem' : 0 }}>
            <h3>{section3Open ? '▼' : '▶'} 데이터 수정 요청</h3>
          </div>
        </button>

        {section3Open && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <button className="btn" onClick={() => setIsRequestModalOpen(true)}>신규 요청 등록</button>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>요청번호</th>
                    <th style={{ textAlign: 'left' }}>프로젝트명</th>
                    <th style={{ textAlign: 'left' }}>요청내용</th>
                    <th>상태</th>
                    <th>요청일</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td className="text-center">{req.id}</td>
                      <td className="text-left">{req.projectName}</td>
                      <td className="text-left">{req.content}</td>
                      <td className="text-center">{getRequestStatusBadge(req.status)}</td>
                      <td className="text-center">{formatDate(req.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 신규 요청 등록 Modal */}
      <ModalDialog
        isOpen={isRequestModalOpen}
        onClose={() => { setIsRequestModalOpen(false); setReqProject(''); setReqContent(''); setReqError(''); }}
        title="데이터 수정 요청 등록"
        size="md"
        footer={
          <div className="button-wrap">
            <button className="btn type-02" onClick={() => setIsRequestModalOpen(false)}>취소</button>
            <button className="btn" onClick={handleRequestSubmit}>제출</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-grid" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <label className="form-label required">프로젝트</label>
            <select value={reqProject} onChange={e => setReqProject(e.target.value)} style={{ width: '100%' }}>
              <option value="">프로젝트 선택</option>
              {mockProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <label className="form-label required">수정내용</label>
            <textarea
              value={reqContent}
              onChange={e => setReqContent(e.target.value)}
              placeholder="수정 요청 내용을 상세히 입력하세요"
              style={{ width: '100%', height: '100px' }}
            />
          </div>
          {reqError && <div style={{ color: '#dc3545', fontSize: '11px' }}>{reqError}</div>}
        </div>
      </ModalDialog>
    </div>
  );
}
