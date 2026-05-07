'use client';

import { useMemo, useState } from 'react';
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

  const activeHref = useMemo(() => {
    if (pathname === '/' || pathname === '/dashboard') return '/dashboard';
    const allHrefs = menuTree
      .flatMap(g => g.children?.map(c => c.href).filter((h): h is string => Boolean(h)) ?? []);
    return allHrefs
      .filter(h => pathname === h || pathname.startsWith(h + '/'))
      .sort((a, b) => b.length - a.length)[0];
  }, [pathname]);

  const isActive = (href: string) => href === activeHref;

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
