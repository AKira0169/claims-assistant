'use client';

import { WizardStep } from '../types';

const steps = [
  { num: 1, label: 'Type & Description' },
  { num: 2, label: 'Claimant Info' },
  { num: 3, label: 'Incident Details' },
  { num: 4, label: 'Documents' },
  { num: 5, label: 'Review & Submit' },
] as const;

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="flex items-center justify-between mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center flex-1">
          <button
            onClick={() => onStepClick(s.num as WizardStep)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              s.num === currentStep
                ? 'text-blue-700'
                : s.num < currentStep
                  ? 'text-green-600 cursor-pointer'
                  : 'text-gray-400'
            }`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                s.num === currentStep
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : s.num < currentStep
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 text-gray-400'
              }`}
            >
              {s.num < currentStep ? '\u2713' : s.num}
            </span>
            <span className="hidden md:inline">{s.label}</span>
          </button>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 ${
                s.num < currentStep ? 'bg-green-400' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
