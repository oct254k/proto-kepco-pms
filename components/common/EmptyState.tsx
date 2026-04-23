interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ message = '데이터가 없습니다.', icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div style={{ marginBottom: '0.5rem' }}>{icon}</div>}
      <p style={{ fontSize: '12px', color: '#6c757d' }}>{message}</p>
    </div>
  );
}
