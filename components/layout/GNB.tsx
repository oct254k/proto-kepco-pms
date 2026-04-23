'use client';

import { Bell, User, Settings } from 'lucide-react';

export default function GNB() {
  return (
    <header className="gnb">
      <div className="gnb-logo">
        <img src="/logo.png" alt="KEPCO ES" style={{ height: 28, objectFit: 'contain', marginRight: 8 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>사업관리</span>
      </div>
      <div className="gnb-spacer" />
      <div className="gnb-actions">
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', position: 'relative' }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#dc3545', color: '#fff', borderRadius: '50%',
            width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>3</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <User size={16} style={{ color: '#666' }} />
          <span className="gnb-user">김민준 (사업개발팀)</span>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
