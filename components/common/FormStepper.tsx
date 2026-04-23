import { Check } from 'lucide-react';

interface Step {
  label: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
}

export default function FormStepper({ steps, currentStep }: FormStepperProps) {
  return (
    <div className="stepper">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={i} className="stepper-step">
            <div className={`stepper-circle ${isDone ? 'done' : isActive ? 'active' : ''}`}>
              {isDone ? <Check size={12} /> : i + 1}
            </div>
            <span className={`stepper-label ${isDone ? 'done' : isActive ? 'active' : ''}`}>{step.label}</span>
            {i < steps.length - 1 && <div className={`stepper-line ${isDone ? 'done' : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}
