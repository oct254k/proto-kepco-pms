import type { Metadata } from 'next';
import GNB from '@/components/layout/GNB';
import LNB from '@/components/layout/LNB';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'KEPCO ES PMS',
  description: '켑코이에스 사업관리시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <GNB />
        <div className="pms-container" style={{ paddingTop: '48px' }}>
          <LNB />
          <main className="content-area">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
