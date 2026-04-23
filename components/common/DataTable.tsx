interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  keyField?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns, data, onRowClick, loading, emptyMessage = '조회된 데이터가 없습니다.', keyField = 'id',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr>{columns.map(c => <th key={c.key}>{c.header}</th>)}</tr></thead>
          <tbody><tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>데이터를 불러오는 중...</td></tr></tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrap type-03">
      <table className="data-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>{emptyMessage}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={String(row[keyField] ?? i)} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? 'pointer' : undefined }}>
                {columns.map(c => (
                  <td key={c.key} className={`text-${c.align || 'center'}`}>
                    {c.render ? c.render(row, i) : String(row[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {data.length > 0 && <div className="count-wrap">총 {data.length}건</div>}
    </div>
  );
}
