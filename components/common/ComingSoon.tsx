'use client';

import { Clock } from 'lucide-react';

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="content-wrap">
      <div className="content-title-wrap">
        <h2>{title}</h2>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '320px',
          gap: '1rem',
          color: '#9ca3af',
        }}
      >
        <Clock size={48} strokeWidth={1.5} />
        <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>준비 중입니다</p>
        <p style={{ fontSize: '13px', margin: 0 }}>해당 기능은 현재 개발 중입니다.</p>
      </div>
    </div>
  );
}
