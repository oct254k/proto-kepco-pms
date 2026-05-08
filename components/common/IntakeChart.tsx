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
    <div className="agg-row">
      {steps.map((step) => (
        <div
          key={step.key}
          className={`agg-card clickable${activeKey === step.key ? ' active' : ''}`}
          onClick={() => onStepClick?.(step.key)}
        >
          <div className="agg-label">{step.label}</div>
          <div className="agg-value-row">
            <span className="agg-value">{step.count}</span>
            <span className="agg-unit">건</span>
          </div>
        </div>
      ))}
    </div>
  );
}
