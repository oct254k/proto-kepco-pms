'use client';

import { useMemo, useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { menuTree } from '@/lib/constants/menus';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings2,
  UserCircle,
  Wallet,
  PiggyBank,
  FileText,
} from 'lucide-react';

const GROUP_ICONS: Record<string, LucideIcon> = {
  dashboard:      LayoutDashboard,
  reception:      Briefcase,
  'project-mgmt': FolderKanban,
  contracts:      FileText,
  funds:          Wallet,
  settlement:     PiggyBank,
  mypage:         UserCircle,
  admin:          Settings2,
};

const hrefPath = (href: string) => href.split('?')[0];

const hrefQuery = (href: string): Record<string, string> => {
  const idx = href.indexOf('?');
  if (idx === -1) return {};
  const result: Record<string, string> = {};
  for (const pair of href.slice(idx + 1).split('&')) {
    const [k, v] = pair.split('=');
    if (k) result[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return result;
};

function LNBInner() {
  const pathname   = usePathname();
  const searchParams = useSearchParams();
  const [menuQuery, setMenuQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const onToggle = () => setIsMobileOpen((prev) => !prev);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('pms:toggle-sidebar', onToggle as EventListener);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('pms:toggle-sidebar', onToggle as EventListener);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const isActive = (href: string): boolean => {
    const p = hrefPath(href);
    const q = hrefQuery(href);
    const hasQuery = Object.keys(q).length > 0;
    if (hasQuery) {
      if (pathname !== p) return false;
      return Object.entries(q).every(([k, v]) => searchParams.get(k) === v);
    }
    return pathname === p || pathname.startsWith(p + '/');
  };

  const isCurrentSection = (group: typeof menuTree[number]) =>
    (group.children ?? []).some((c) => isActive(c.href || ''));

  const flatItems = useMemo(
    () => menuTree.flatMap((g) => (g.children ?? []).map((c) => ({ ...c, groupLabel: g.label }))),
    []
  );

  const q = menuQuery.trim().toLowerCase();
  const filteredItems = q
    ? flatItems.filter((i) =>
        i.label.toLowerCase().includes(q) || i.groupLabel.toLowerCase().includes(q)
      )
    : null;

  return (
    <>
      <button
        type="button"
        className={`sidebar-overlay ${isMobileOpen ? 'is-visible' : ''}`}
        aria-label="사이드바 닫기"
        onClick={() => setIsMobileOpen(false)}
      />
      <nav className={`sidebar ${isMobileOpen ? 'is-mobile-open' : ''}`}>
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
            return (
              <div key={group.id} className="sidebar-group">
                {/* 1depth: 클릭 불필요 → div로 표시 */}
                <div className={`sidebar-menu1 ${isCurrentSection(group) ? 'sidebar-menu1-current' : ''}`}>
                  <span className="sidebar-menu1-icon" aria-hidden>
                    <GroupIcon size={22} strokeWidth={2} />
                  </span>
                  <span className="sidebar-menu1-text">{group.label}</span>
                </div>

                {isCurrentSection(group) ? (
                  <div className="sidebar-group-items">
                    {group.children?.map((item) => {
                      const active = isActive(item.href || '');
                      return (
                        <Link
                          key={item.id}
                          href={item.href || '#'}
                          className={`sidebar-menu2 ${active ? 'active' : ''}`}
                          {...(active ? { 'aria-current': 'page' as const } : {})}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}

                {(() => {
                  const next = menuTree[gi + 1];
                  return next && (next.id === 'mypage' || next.id === 'admin')
                    ? <div className="sidebar-divider" />
                    : null;
                })()}
              </div>
            );
          })
        )}
      </div>
      </nav>
    </>
  );
}

export default function LNB() {
  return (
    <Suspense fallback={<nav className="sidebar" />}>
      <LNBInner />
    </Suspense>
  );
}
