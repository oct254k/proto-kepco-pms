'use client';

interface IntakeStep {
  label: string;
  count: number;
  key: string;
}

interface IntakeChartProps {
  steps: IntakeStep[];
  activeKey?: string;
  onStepClick?: (key: string) => void;
}

export default function IntakeChart({ steps, activeKey, onStepClick }: IntakeChartProps) {
  return (
    <div className="intake-bar">
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div
            className={`intake-step ${activeKey === step.key ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => onStepClick?.(step.key)}
          >
            <div className="intake-step-count">{step.count}</div>
            <div className="intake-step-label">{step.label}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ color: '#00a7ea', fontSize: '18px', padding: '0 4px', flexShrink: 0 }}>▶</div>
          )}
        </div>
      ))}
    </div>
  );
}
