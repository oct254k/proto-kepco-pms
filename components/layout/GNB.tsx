'use client';

import { Bell, Menu, User, Settings } from 'lucide-react';

export default function GNB() {
  return (
    <header className="gnb">
      <div className="gnb-logo">
        <img
          src="/logo.svg"
          alt="KEPCO ES"
          style={{
            height: 'var(--gnb-logo-height)',
            maxWidth: 'var(--gnb-logo-max-width)',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <button
          type="button"
          aria-label="메뉴"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('pms:toggle-sidebar'));
            }
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2c4a73', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <Menu size={16} strokeWidth={2.2} />
        </button>
      </div>
      <div className="gnb-spacer" />
      <div className="gnb-actions">
        <button aria-label="알림" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', position: 'relative' }}>
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
        <button aria-label="설정" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
