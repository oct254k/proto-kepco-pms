'use client';

interface KanbanCard {
  id: string;
  title: string;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
}

interface KanbanColumn {
  id: string;
  label: string;
  cards: KanbanCard[];
  isCompleted?: boolean;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardClick?: (card: KanbanCard, columnId: string) => void;
}

export default function KanbanBoard({ columns, onCardClick }: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {columns.map((col) => (
        <div key={col.id} className={`kanban-column ${col.isCompleted ? 'completed' : ''}`}>
          <div className="kanban-column-header">
            <span>{col.label}</span>
            <span style={{
              background: '#00a7ea', color: '#fff', borderRadius: '10px',
              padding: '1px 8px', fontSize: '11px',
            }}>{col.cards.length}</span>
          </div>
          <div className="kanban-column-body">
            {col.cards.map((card) => (
              <div key={card.id} className="kanban-card" onClick={() => onCardClick?.(card, col.id)}>
                <div className="kanban-card-title">{card.title}</div>
                {card.badge}
                {card.meta && <div className="kanban-card-meta">{card.meta}</div>}
              </div>
            ))}
            {col.cards.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#aaa', fontSize: '11px' }}>카드 없음</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
