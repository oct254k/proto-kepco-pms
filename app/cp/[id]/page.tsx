import { mockCpInvestments } from '@/lib/mock-data/cp';
import CpInvestmentDetailClient from './CpInvestmentDetailClient';

export function generateStaticParams() {
  return mockCpInvestments.map(cp => ({ id: cp.id }));
}

export default function CpInvestmentDetailPage() {
  return <CpInvestmentDetailClient />;
}
