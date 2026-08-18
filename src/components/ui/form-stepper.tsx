import { Fragment } from 'react';
import { cn } from '@/lib/utils';

export type FormStepperStep = {
  title: string;
  description?: string;
};

type FormStepperProps = {
  steps: FormStepperStep[];
  activeStep: number;
};

export function FormStepper({ steps, activeStep }: FormStepperProps) {
  if (steps.length === 0) {
    return null;
  }

  const clampedStep = Math.min(Math.max(activeStep, 1), steps.length);

  return (
    <nav aria-label="Form steps" className="w-full">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < clampedStep;
          const isActive = stepNumber === clampedStep;

          return (
            <Fragment key={`${step.title}-${index}`}>
              <div className="flex flex-col items-center gap-1 text-center min-w-[110px]">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition',
                    {
                      'border-primary bg-primary text-primary-foreground': isActive,
                      'border-primary bg-primary/10 text-primary': isCompleted,
                      'border-border bg-muted text-muted-foreground':
                        !isActive && !isCompleted,
                    },
                  )}
                >
                  {stepNumber}
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {step.title}
                </span>
                {step.description ? (
                  <span className="text-[11px] text-muted-foreground">
                    {step.description}
                  </span>
                ) : null}
              </div>
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    'm-0.5 h-px flex-1 rounded-full transition',
                    {
                      'bg-primary': isCompleted,
                      'bg-border': !isCompleted,
                    },
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
