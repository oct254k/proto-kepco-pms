'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
  attachType?: string; // 'CONTRACT' → 워터마크 활성
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export default function DocumentViewer({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  attachType,
}: DocumentViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [libLoaded, setLibLoaded] = useState(false);

  const isContract = attachType === 'CONTRACT';
  const now = new Date().toLocaleString('ko-KR');

  // PDF.js 라이브러리 동적 로드
  useEffect(() => {
    if (!isOpen) return;
    if (window.pdfjsLib) { setLibLoaded(true); return; }

    const script = document.createElement('script');
    script.src = PDFJS_CDN;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      setLibLoaded(true);
    };
    script.onerror = () => setError('PDF.js 라이브러리를 불러오지 못했습니다.');
    document.head.appendChild(script);
  }, [isOpen]);

  // PDF 문서 로드
  useEffect(() => {
    if (!libLoaded || !isOpen) return;
    setLoading(true);
    setError('');
    setCurrentPage(1);

    window.pdfjsLib.getDocument(fileUrl).promise
      .then((doc: any) => {
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      })
      .catch(() => {
        setError('PDF를 불러올 수 없습니다. 파일을 확인하세요.');
        setLoading(false);
      });
  }, [libLoaded, isOpen, fileUrl]);

  // 페이지 렌더링
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // ── 워터마크 레이어 ────────────────────────────────────────────────────
      if (isContract) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.font = `bold ${Math.round(viewport.width / 12)}px Arial`;
        ctx.fillStyle = '#c00000';
        ctx.translate(viewport.width / 2, viewport.height / 2);
        ctx.rotate(-Math.PI / 5);
        ctx.textAlign = 'center';
        ctx.fillText('KEPCO ES CONFIDENTIAL', 0, 0);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.font = `bold ${Math.round(viewport.width / 14)}px Arial`;
        ctx.fillStyle = '#343e4d';
        ctx.translate(viewport.width / 2, viewport.height / 2);
        ctx.rotate(-Math.PI / 5);
        ctx.textAlign = 'center';
        ctx.fillText('KEPCO ES', 0, 0);
        ctx.restore();
      }

      // ── 타임스탬프 푸터 ───────────────────────────────────────────────────
      ctx.save();
      const footerH = Math.round(viewport.height * 0.03);
      ctx.fillStyle = 'rgba(52,62,77,0.85)';
      ctx.fillRect(0, viewport.height - footerH, viewport.width, footerH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(footerH * 0.5)}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText(
        `KEPCO ES  |  열람일시: ${now}  |  Page ${pageNum}/${totalPages}`,
        8,
        viewport.height - Math.round(footerH * 0.2)
      );
      ctx.restore();
    },
    [pdfDoc, scale, isContract, now, totalPages]
  );

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [pdfDoc, currentPage, scale, renderPage]);

  // 닫기 시 초기화
  useEffect(() => {
    if (!isOpen) {
      setPdfDoc(null);
      setTotalPages(0);
      setCurrentPage(1);
      setError('');
    }
  }, [isOpen]);

  // ESC 키
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={containerRef}
        className="flex flex-col bg-white rounded shadow-2xl"
        style={{ width: '900px', maxWidth: '96vw', height: '92vh' }}
      >
        {/* ── 툴바 ────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-t select-none"
          style={{
            background: 'var(--sidebar-bg, #343e4d)',
            color: '#fff',
            fontSize: '12px',
          }}
        >
          {/* 파일명 */}
          <span className="flex-1 font-bold truncate" style={{ fontSize: '13px' }}>
            📄 {fileName}
          </span>

          {isContract && (
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: '#c00000', color: '#fff' }}
            >
              기밀문서
            </span>
          )}

          {/* 페이지 네비게이션 */}
          {totalPages > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2 py-1 rounded text-xs disabled:opacity-40"
                style={{ background: '#697e8d' }}
              >
                ◀
              </button>
              <span style={{ fontSize: '11px', minWidth: '72px', textAlign: 'center' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-2 py-1 rounded text-xs disabled:opacity-40"
                style={{ background: '#697e8d' }}
              >
                ▶
              </button>
            </div>
          )}

          {/* 배율 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)))}
              className="px-2 py-1 rounded text-xs"
              style={{ background: '#697e8d' }}
            >
              −
            </button>
            <span style={{ fontSize: '11px', minWidth: '38px', textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(3.0, +(s + 0.2).toFixed(1)))}
              className="px-2 py-1 rounded text-xs"
              style={{ background: '#697e8d' }}
            >
              +
            </button>
          </div>

          {/* 다운로드 */}
          <a
            href={fileUrl}
            download={fileName}
            className="px-3 py-1 rounded text-xs font-bold"
            style={{ background: '#7cadbe', color: '#fff', textDecoration: 'none' }}
          >
            다운로드
          </a>

          {/* 닫기 */}
          <button
            onClick={onClose}
            className="px-3 py-1 rounded text-xs font-bold"
            style={{ background: '#697e8d' }}
          >
            ✕ 닫기
          </button>
        </div>

        {/* ── 메타 정보 바 ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-4 px-4 py-1 text-xs"
          style={{
            background: isContract ? '#fff5f5' : '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            color: '#697e8d',
          }}
        >
          <span>열람일시: {now}</span>
          <span>|</span>
          <span>SFR-003 문서뷰어 (프로토타입: PDF.js)</span>
          {isContract && (
            <>
              <span>|</span>
              <span style={{ color: '#c00000', fontWeight: 'bold' }}>
                ⚠ 계약서 — 보안 열람 (워터마크 적용)
              </span>
            </>
          )}
        </div>

        {/* ── 뷰어 본문 ────────────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-auto flex justify-center"
          style={{ background: '#525659', padding: '16px' }}
        >
          {loading && (
            <div className="flex items-center justify-center w-full text-white text-sm">
              PDF를 불러오는 중...
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center w-full text-red-300 text-sm">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              <canvas ref={canvasRef} />
            </div>
          )}
        </div>

        {/* ── 하단 페이지 바 ─────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div
            className="flex justify-center gap-1 py-2"
            style={{ background: '#f8f9fa', borderTop: '1px solid #dee2e6' }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className="w-7 h-7 rounded text-xs font-bold"
                style={{
                  background: p === currentPage ? 'var(--color-primary, #00a7ea)' : '#dee2e6',
                  color: p === currentPage ? '#fff' : '#343e4d',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
