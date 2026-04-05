'use client';

import { WizardStep } from '../types';

const steps = [
  { num: 1, label: 'Type', color: 'bg-brutal-yellow' },
  { num: 2, label: 'Claimant', color: 'bg-brutal-pink' },
  { num: 3, label: 'Details', color: 'bg-brutal-blue' },
  { num: 4, label: 'Docs', color: 'bg-brutal-lavender' },
  { num: 5, label: 'Submit', color: 'bg-brutal-lime' },
] as const;

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="flex items-stretch gap-2 mb-8">
      {steps.map((s, i) => {
        const isActive = s.num === currentStep;
        const isDone = s.num < currentStep;
        const isFuture = s.num > currentStep;

        return (
          <div key={s.num} className="flex items-center flex-1 gap-2">
            <button
              onClick={() => onStepClick(s.num as WizardStep)}
              className={`
                flex items-center gap-2 px-3 py-2 border-[3px] border-brutal-black font-mono text-xs font-bold uppercase transition-all flex-1
                ${isActive
                  ? `${s.color} shadow-brutal-sm -translate-x-[1px] -translate-y-[1px]`
                  : isDone
                    ? 'bg-brutal-black text-white hover:-translate-y-[1px] hover:shadow-brutal-sm'
                    : 'bg-white text-brutal-black/30 cursor-default'
                }
              `}
              disabled={isFuture}
            >
              <span className={`
                w-6 h-6 flex items-center justify-center text-[10px] font-bold border-2
                ${isActive
                  ? 'border-brutal-black bg-white text-brutal-black'
                  : isDone
                    ? 'border-white bg-transparent text-white'
                    : 'border-brutal-black/20 text-brutal-black/30'
                }
              `}>
                {isDone ? '\u2713' : s.num}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-4 h-[3px] flex-shrink-0 ${isDone ? 'bg-brutal-black' : 'bg-brutal-black/15'}`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
