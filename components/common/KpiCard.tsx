import { calcAchievementRate } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  target: number;
  actual: number;
  unit?: string;
  formatFn?: (n: number) => string;
}

export default function KpiCard({ label, target, actual, unit = '', formatFn }: KpiCardProps) {
  const rate = calcAchievementRate(actual, target);
  const fmt = formatFn || ((n: number) => n.toLocaleString('ko-KR') + unit);

  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: '#00a7ea' }}>{fmt(actual)}</div>
      <div className="kpi-sub">
        목표: {fmt(target)} &nbsp;|&nbsp;
        달성률: <strong style={{ color: rate >= 100 ? '#198754' : rate >= 80 ? '#fd7e14' : '#dc3545' }}>{rate}%</strong>
      </div>
      <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
        <div className="progress-fill" style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
    </div>
  );
}
