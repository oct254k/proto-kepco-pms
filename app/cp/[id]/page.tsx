import { mockCPs } from '@/lib/mock-data/cp';
import CPDetailClient from './CPDetailClient';

export function generateStaticParams() {
  return mockCPs.map(cp => ({ id: cp.id }));
}

export default function CPDetailPage() {
  return <CPDetailClient />;
}
