'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: 480 | 640;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function DrawerPanel({ isOpen, onClose, title, width = 480, children, footer }: DrawerPanelProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={onClose} />}
      <div className={`drawer-panel w-${width} ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>{title}</h3>
          <button className="btn type-02 type-05" onClick={onClose} style={{ minWidth: 28, padding: 0, width: 28 }}>
            <X size={14} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </>
  );
}
