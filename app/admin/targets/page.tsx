'use client';

import { useState, useRef } from 'react';

// 목표 항목 타입
interface TargetItem {
  key: string;
  label: string;
  unit: string;
  value: number;
  lastModifiedAt: string;
  lastModifiedBy: string;
}

// 연도별 데이터 생성
const createTargetData = (year: number): TargetItem[] => {
  if (year === 2024) {
    return [
      { key: 'projectCost',    label: '사업비 목표',         unit: '원',  value: 7500000000, lastModifiedAt: '2024-01-10', lastModifiedBy: '오미래' },
      { key: 'investmentCost', label: '투자비 목표',         unit: '원',  value: 5500000000, lastModifiedAt: '2024-01-10', lastModifiedBy: '오미래' },
      { key: 'eers',           label: 'EERS 절감량 목표',    unit: 'TOE', value: 100,        lastModifiedAt: '2024-01-10', lastModifiedBy: '오미래' },
      { key: 'repaymentRate',  label: '자금회수율 목표',     unit: '%',   value: 85.0,       lastModifiedAt: '2024-01-10', lastModifiedBy: '오미래' },
      { key: 'irr',            label: 'IRR 목표',            unit: '%',   value: 8.0,        lastModifiedAt: '2024-02-01', lastModifiedBy: '한승우' },
      { key: 'newProjects',    label: '신규 프로젝트 수 목표', unit: '건',  value: 6,          lastModifiedAt: '2024-01-10', lastModifiedBy: '오미래' },
    ];
  }
  if (year === 2025) {
    return [
      { key: 'projectCost',    label: '사업비 목표',         unit: '원',  value: 8000000000, lastModifiedAt: '2025-01-10', lastModifiedBy: '오미래' },
      { key: 'investmentCost', label: '투자비 목표',         unit: '원',  value: 5800000000, lastModifiedAt: '2025-01-10', lastModifiedBy: '오미래' },
      { key: 'eers',           label: 'EERS 절감량 목표',    unit: 'TOE', value: 110,        lastModifiedAt: '2025-01-10', lastModifiedBy: '오미래' },
      { key: 'repaymentRate',  label: '자금회수율 목표',     unit: '%',   value: 87.0,       lastModifiedAt: '2025-01-10', lastModifiedBy: '오미래' },
      { key: 'irr',            label: 'IRR 목표',            unit: '%',   value: 8.2,        lastModifiedAt: '2025-02-01', lastModifiedBy: '한승우' },
      { key: 'newProjects',    label: '신규 프로젝트 수 목표', unit: '건',  value: 7,          lastModifiedAt: '2025-01-10', lastModifiedBy: '오미래' },
    ];
  }
  // 2026
  return [
    { key: 'projectCost',    label: '사업비 목표',         unit: '원',  value: 8500000000, lastModifiedAt: '2026-01-15', lastModifiedBy: '오미래' },
    { key: 'investmentCost', label: '투자비 목표',         unit: '원',  value: 6200000000, lastModifiedAt: '2026-01-15', lastModifiedBy: '오미래' },
    { key: 'eers',           label: 'EERS 절감량 목표',    unit: 'TOE', value: 120,        lastModifiedAt: '2026-01-15', lastModifiedBy: '오미래' },
    { key: 'repaymentRate',  label: '자금회수율 목표',     unit: '%',   value: 88.0,       lastModifiedAt: '2026-01-15', lastModifiedBy: '오미래' },
    { key: 'irr',            label: 'IRR 목표',            unit: '%',   value: 8.5,        lastModifiedAt: '2026-02-01', lastModifiedBy: '한승우' },
    { key: 'newProjects',    label: '신규 프로젝트 수 목표', unit: '건',  value: 8,          lastModifiedAt: '2026-01-15', lastModifiedBy: '오미래' },
  ];
};

const YEARS = [2024, 2025, 2026];

// 숫자 포맷
function formatValue(key: string, value: number): string {
  if (key === 'projectCost' || key === 'investmentCost') {
    return value.toLocaleString('ko-KR');
  }
  if (key === 'repaymentRate' || key === 'irr') {
    return value.toFixed(1);
  }
  return value.toString();
}

export default function AdminTargetsPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [allData, setAllData] = useState<Record<number, TargetItem[]>>({
    2024: createTargetData(2024),
    2025: createTargetData(2025),
    2026: createTargetData(2026),
  });

  // 편집 상태: key -> 임시 값
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const currentData = allData[selectedYear] || [];

  // 연도 탭 변경
  const handleYearChange = (year: number) => {
    if (Object.keys(pendingChanges).length > 0) {
      const ok = window.confirm('저장하지 않은 변경사항이 있습니다. 이동하시겠습니까?');
      if (!ok) return;
      setPendingChanges({});
    }
    setSelectedYear(year);
    setEditingKey(null);
  };

  // 셀 클릭 → 편집 모드
  const handleCellClick = (key: string) => {
    setEditingKey(key);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // 편집 값 변경
  const handleInputChange = (key: string, raw: string) => {
    const num = parseFloat(raw.replace(/,/g, ''));
    if (!isNaN(num)) {
      setPendingChanges(prev => ({ ...prev, [key]: num }));
    }
  };

  // Enter/Tab: 다음 셀로
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: string) => {
    if (e.key === 'Escape') {
      setEditingKey(null);
      const next = { ...pendingChanges };
      delete next[key];
      setPendingChanges(next);
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      setEditingKey(null);
      // 다음 셀로 이동
      const keys = currentData.map(d => d.key);
      const idx = keys.indexOf(key);
      if (idx < keys.length - 1) {
        const nextKey = keys[idx + 1];
        setEditingKey(nextKey);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  };

  // 전체 저장
  const handleSave = () => {
    if (Object.keys(pendingChanges).length === 0) return;
    const today = new Date().toISOString().substring(0, 10);
    const updated = currentData.map(item => {
      if (pendingChanges[item.key] !== undefined) {
        return { ...item, value: pendingChanges[item.key], lastModifiedAt: today, lastModifiedBy: '관리자' };
      }
      return item;
    });
    setAllData(prev => ({ ...prev, [selectedYear]: updated }));
    setPendingChanges({});
    setEditingKey(null);
    alert('저장되었습니다.');
  };

  // 취소 (원래 값 복귀)
  const handleCancel = () => {
    setPendingChanges({});
    setEditingKey(null);
  };

  const hasPending = Object.keys(pendingChanges).length > 0;

  return (
    <div className="content-wrap">
      <div className="content-title-wrap">
        <h2>경영실적목표</h2>
      </div>

      {/* 연도 탭 */}
      <div className="tab-list">
        {YEARS.map(year => (
          <button
            key={year}
            className={`tab-btn ${selectedYear === year ? 'active' : ''}`}
            onClick={() => handleYearChange(year)}
          >
            {year}
          </button>
        ))}
      </div>

      {/* 목표 그리드 */}
      <div className="content-box-wrap type-02">
        <div className="title-row-wrap">
          <h3>{selectedYear}년 경영실적 목표</h3>
          <div className="button-wrap">
            <button
              className={`btn type-03 ${!hasPending ? 'disabled' : ''}`}
              onClick={handleSave}
              disabled={!hasPending}
            >
              전체 저장
            </button>
            <button className="btn type-02" onClick={handleCancel}>취소</button>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#6c757d', marginBottom: '0.75rem' }}>
          목표값 셀을 클릭하면 편집할 수 있습니다.
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '28%' }}>항목명</th>
                <th style={{ textAlign: 'right', width: '28%' }}>목표값</th>
                <th style={{ textAlign: 'center', width: '10%' }}>단위</th>
                <th style={{ textAlign: 'center', width: '18%' }}>최종수정일</th>
                <th style={{ textAlign: 'center', width: '16%' }}>수정자</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => {
                const displayValue = pendingChanges[item.key] !== undefined
                  ? pendingChanges[item.key]
                  : item.value;
                const isEditing = editingKey === item.key;
                const isPending = pendingChanges[item.key] !== undefined;

                return (
                  <tr key={item.key}>
                    <td className="text-left" style={{ fontWeight: 600 }}>{item.label}</td>
                    <td
                      className="text-right"
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isPending ? '#fff8e6' : undefined,
                        border: isEditing ? '2px solid #00a9e0' : undefined,
                        padding: isEditing ? '0' : undefined,
                      }}
                      onClick={() => !isEditing && handleCellClick(item.key)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="number"
                          step={item.key === 'repaymentRate' || item.key === 'irr' ? '0.1' : '1'}
                          defaultValue={displayValue}
                          onChange={e => handleInputChange(item.key, e.target.value)}
                          onKeyDown={e => handleKeyDown(e, item.key)}
                          onBlur={() => setEditingKey(null)}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            outline: 'none',
                            textAlign: 'right',
                            padding: '0.5rem 0.75rem',
                            background: 'transparent',
                            fontSize: 12,
                          }}
                        />
                      ) : (
                        <span style={{ display: 'block', padding: '0.5rem 0.75rem' }}>
                          {formatValue(item.key, displayValue)}
                        </span>
                      )}
                    </td>
                    <td className="text-center">{item.unit}</td>
                    <td className="text-center" style={{ color: isPending ? '#856404' : undefined }}>
                      {isPending ? '(미저장)' : item.lastModifiedAt}
                    </td>
                    <td className="text-center">{item.lastModifiedBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 하단 버튼 */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
          <button
            className={`btn type-03 ${!hasPending ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={!hasPending}
          >
            전체 저장
          </button>
          <button className="btn type-02" onClick={handleCancel}>취소</button>
        </div>
      </div>

      {/* 안내 */}
      <div style={{ fontSize: 11, color: '#6c757d', padding: '0 0.25rem' }}>
        ※ 셀을 클릭하면 편집 가능합니다. Enter/Tab으로 다음 셀 이동, ESC로 취소합니다.
        미저장 항목은 배경색으로 강조 표시됩니다.
      </div>
    </div>
  );
}
