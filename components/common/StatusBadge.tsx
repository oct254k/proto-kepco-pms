import { PROJECT_STATUS, REPAYMENT_STATUS, OPPORTUNITY_STATUS, CP_INVESTMENT_REVISION_STATUS, ALERT_LEVEL } from '@/lib/constants/status';

interface StatusBadgeProps {
  type: 'project' | 'repayment' | 'opportunity' | 'cpInvestmentRevision' | 'alert' | 'custom';
  value: string;
  customLabel?: string;
  customBg?: string;
  customText?: string;
}

export default function StatusBadge({ type, value, customLabel, customBg, customText }: StatusBadgeProps) {
  let bg = '#e2e3e5', text = '#383d41', label = value;

  if (type === 'project') {
    const s = PROJECT_STATUS[value as keyof typeof PROJECT_STATUS];
    if (s) { bg = s.bg; text = s.text; label = s.label; }
  } else if (type === 'repayment') {
    const s = REPAYMENT_STATUS[value as keyof typeof REPAYMENT_STATUS];
    if (s) { bg = s.bg; text = s.text; label = s.label; }
  } else if (type === 'opportunity') {
    const s = OPPORTUNITY_STATUS[value as keyof typeof OPPORTUNITY_STATUS];
    if (s) { bg = s.bg; text = s.text; label = s.label; }
  } else if (type === 'cpInvestmentRevision') {
    const s = CP_INVESTMENT_REVISION_STATUS[value as keyof typeof CP_INVESTMENT_REVISION_STATUS];
    if (s) { bg = s.bg; text = s.text; label = s.label; }
  } else if (type === 'alert') {
    const s = ALERT_LEVEL[value as keyof typeof ALERT_LEVEL];
    if (s) { bg = s.bg; text = s.text; label = s.label; }
  } else if (type === 'custom') {
    bg = customBg || bg;
    text = customText || text;
    label = customLabel || label;
  }

  return (
    <span className="status-badge" style={{ backgroundColor: bg, color: text }}>
      {label}
    </span>
  );
}
