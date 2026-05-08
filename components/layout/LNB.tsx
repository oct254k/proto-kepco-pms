'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { menuTree } from '@/lib/constants/menus';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings2,
  UserCircle,
  Wallet,
} from 'lucide-react';

/** 1뎁스 그룹 아이콘 (Lucide) */
const GROUP_ICONS: Record<string, LucideIcon> = {
  business: LayoutDashboard,
  opportunity: Briefcase,
  'cp-project': FolderKanban,
  finance: Wallet,
  personal: UserCircle,
  admin: Settings2,
};

export default function LNB() {
  const pathname = usePathname();
  const findActiveGroupId = (path: string) =>
    menuTree.find((g) =>
      g.children?.some((c) => {
        const h = c.href || '';
        return h && (path === h || path.startsWith(h + '/'));
      })
    )?.id ?? null;

  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    const id = findActiveGroupId(pathname);
    return id ? [id] : [];
  });

  const [menuQuery, setMenuQuery] = useState('');

  // 페이지 이동 시 해당 그룹 자동 오픈 (아코디언)
  useEffect(() => {
    const id = findActiveGroupId(pathname);
    if (id) setOpenGroups([id]);
  }, [pathname]);

  // 아코디언: 하나만 열림
  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => (prev.includes(id) ? [] : [id]));
  };

  const activeHref = useMemo(() => {
    if (pathname === '/' || pathname === '/dashboard') return '/dashboard';
    const allHrefs =
      menuTree.flatMap((g) => g.children?.map((c) => c.href).filter((h): h is string => Boolean(h)) ?? []);
    return allHrefs
      .filter((h) => pathname === h || pathname.startsWith(h + '/'))
      .sort((a, b) => b.length - a.length)[0];
  }, [pathname]);

  const isActive = (href: string) => href === activeHref;

  const flatItems = useMemo(
    () =>
      menuTree.flatMap((g) =>
        (g.children ?? []).map((c) => ({
          ...c,
          groupLabel: g.label,
        }))
      ),
    []
  );

  const q = menuQuery.trim().toLowerCase();
  const filteredItems = q
    ? flatItems.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.groupLabel.toLowerCase().includes(q)
      )
    : null;

  return (
    <nav className="sidebar">
      <div className="sidebar-search">
        <input
          type="search"
          autoComplete="off"
          placeholder="메뉴를 검색하세요."
          value={menuQuery}
          onChange={(e) => setMenuQuery(e.target.value)}
          aria-label="메뉴 검색"
        />
        <Search size={16} className="sidebar-search-icon" strokeWidth={2} aria-hidden />
      </div>

      <div className="sidebar-scroll">
        {filteredItems ? (
          <div className="sidebar-flat">
            {filteredItems.length === 0 ? (
              <div className="sidebar-empty">검색 결과가 없습니다.</div>
            ) : (
              filteredItems.map((item) => (
                <Link
                  key={`${item.id}-${item.href}`}
                  href={item.href || '#'}
                  className={`sidebar-menu2 ${isActive(item.href || '') ? 'active' : ''}`}
                  {...(isActive(item.href || '') ? { 'aria-current': 'page' as const } : {})}
                >
                  <span className="sidebar-menu2-meta">{item.groupLabel}</span>
                  <span className="sidebar-menu2-label">{item.label}</span>
                </Link>
              ))
            )}
          </div>
        ) : (
          menuTree.map((group, gi) => {
            const GroupIcon = GROUP_ICONS[group.id] ?? LayoutDashboard;
            const isOpen = openGroups.includes(group.id);
            const isCurrentSection = (group.children ?? []).some((c) =>
              isActive(c.href || '')
            );
            return (
              <div key={group.id} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-menu1 ${isCurrentSection ? 'sidebar-menu1-current' : ''}`}
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                >
                  <span className="sidebar-menu1-icon" aria-hidden>
                    <GroupIcon size={22} strokeWidth={2} />
                  </span>
                  <span className="sidebar-menu1-text">{group.label}</span>
                  <span className="sidebar-menu1-chevron" aria-hidden>
                    {isOpen ? (
                      <ChevronDown size={14} strokeWidth={2} />
                    ) : (
                      <ChevronRight size={14} strokeWidth={2} />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="sidebar-group-items">
                    {group.children?.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href || '#'}
                        className={`sidebar-menu2 ${isActive(item.href || '') ? 'active' : ''}`}
                        {...(isActive(item.href || '') ? { 'aria-current': 'page' as const } : {})}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
                {(() => { const next = menuTree[gi + 1]; return next && (next.id === 'personal' || next.id === 'admin') ? <div className="sidebar-divider" /> : null; })()}
              </div>
            );
          })
        )}
      </div>
    </nav>
  );
}
