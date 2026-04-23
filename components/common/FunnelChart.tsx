'use client';

interface FunnelStep {
  label: string;
  count: number;
  key: string;
}

interface FunnelChartProps {
  steps: FunnelStep[];
  activeKey?: string;
  onStepClick?: (key: string) => void;
}

export default function FunnelChart({ steps, activeKey, onStepClick }: FunnelChartProps) {
  return (
    <div className="funnel-bar">
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div
            className={`funnel-step ${activeKey === step.key ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => onStepClick?.(step.key)}
          >
            <div className="funnel-step-count">{step.count}</div>
            <div className="funnel-step-label">{step.label}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ color: '#00a7ea', fontSize: '18px', padding: '0 4px', flexShrink: 0 }}>▶</div>
          )}
        </div>
      ))}
    </div>
  );
}
