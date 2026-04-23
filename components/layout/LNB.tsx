'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { menuTree } from '@/lib/constants/menus';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function LNB() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(['business', 'opportunity', 'cp-project', 'finance', 'personal', 'admin']);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sidebar">
      {menuTree.map((group) => (
        <div key={group.id}>
          <div className="sidebar-menu1" onClick={() => toggleGroup(group.id)}>
            {openGroups.includes(group.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {group.label}
          </div>
          {openGroups.includes(group.id) && group.children?.map((item) => (
            <Link
              key={item.id}
              href={item.href || '#'}
              className={`sidebar-menu2 ${isActive(item.href || '') ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          <div className="sidebar-divider" />
        </div>
      ))}
    </nav>
  );
}
