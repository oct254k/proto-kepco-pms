'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
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

/** 1뎁스 그룹 아이콘 (Lucide) */
const GROUP_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  reception: Briefcase,
  'project-mgmt': FolderKanban,
  contracts: FileText,
  funds: Wallet,
  settlement: PiggyBank,
  mypage: UserCircle,
  admin: Settings2,
};

/** href에서 pathname 부분만 추출 (쿼리스트링 제거) */
const hrefPath = (href: string) => href.split('?')[0];

/** href에서 쿼리 파라미터 객체 추출 */
const hrefQuery = (href: string): Record<string, string> => {
  const idx = href.indexOf('?');
  if (idx === -1) return {};
  const pairs = href.slice(idx + 1).split('&');
  const result: Record<string, string> = {};
  for (const pair of pairs) {
    const [k, v] = pair.split('=');
    if (k) result[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return result;
};

function LNBInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const findActiveGroupId = (path: string) =>
    menuTree.find((g) =>
      g.children?.some((c) => {
        const h = hrefPath(c.href || '');
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

  /**
   * 메뉴 항목이 현재 페이지와 일치하는지 판단.
   * - href에 쿼리가 있으면: pathname 일치 AND 해당 쿼리 파라미터 일치
   * - href에 쿼리가 없으면: pathname 일치 (startsWith 포함)
   */
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

  const activeHref = useMemo(() => {
    if (pathname === '/' || pathname === '/dashboard') return '/dashboard';
    const allHrefs =
      menuTree.flatMap((g) => g.children?.map((c) => c.href).filter((h): h is string => Boolean(h)) ?? []);
    return allHrefs.find((h) => isActive(h));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

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
              filteredItems.map((item) => {
                const active = isActive(item.href || '');
                return (
                  <Link
                    key={`${item.id}-${item.href}`}
                    href={item.href || '#'}
                    className={`sidebar-menu2 ${active ? 'active' : ''}`}
                    {...(active ? { 'aria-current': 'page' as const } : {})}
                  >
                    <span className="sidebar-menu2-meta">{item.groupLabel}</span>
                    <span className="sidebar-menu2-label">{item.label}</span>
                  </Link>
                );
              })
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
                </button>
                {isOpen && (
                  <div className="sidebar-group-items">
                    {group.children?.map((item) => {
                      const active = isActive(item.href || '');
                      return (
                        <Link
                          key={item.id}
                          href={item.href || '#'}
                          className={`sidebar-menu2 ${active ? 'active' : ''}`}
                          {...(active ? { 'aria-current': 'page' as const } : {})}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
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
  );
}

export default function LNB() {
  return (
    <Suspense fallback={<nav className="sidebar" />}>
      <LNBInner />
    </Suspense>
  );
}
