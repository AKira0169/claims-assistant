'use client';

import { ClaimType } from '@claims-assistant/shared';
import { WizardFormData } from '../types';

interface Step1Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onExtract: () => void;
  isLoading: boolean;
  aiError: string | null;
  onNext: () => void;
}

const claimTypes = [
  { value: ClaimType.AUTO, label: 'Auto', icon: '//01', color: 'bg-brutal-yellow' },
  { value: ClaimType.PROPERTY, label: 'Property', icon: '//02', color: 'bg-brutal-peach' },
  { value: ClaimType.HEALTH, label: 'Health', icon: '//03', color: 'bg-brutal-mint' },
  { value: ClaimType.OTHER, label: 'Other', icon: '//04', color: 'bg-brutal-lavender' },
];

export function Step1TypeDescription({ formData, onUpdate, onExtract, isLoading, aiError, onNext }: Step1Props) {
  return (
    <div className="space-y-6 brutal-animate-in">
      <h3 className="brutal-heading text-xl flex items-center gap-3">
        <span className="w-8 h-8 bg-brutal-yellow border-2 border-brutal-black flex items-center justify-center text-sm">1</span>
        TYPE & DESCRIPTION
      </h3>

      <div>
        <label className="brutal-label">Claim Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {claimTypes.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => onUpdate({ claimType: ct.value })}
              className={`
                p-4 border-[3px] border-brutal-black font-mono text-sm font-bold uppercase transition-all text-left
                ${formData.claimType === ct.value
                  ? `${ct.color} shadow-brutal-sm -translate-x-[1px] -translate-y-[1px]`
                  : 'bg-white hover:shadow-brutal-sm hover:-translate-y-[1px]'
                }
              `}
            >
              <div className="text-[10px] text-brutal-black/40 mb-1">{ct.icon}</div>
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="brutal-label">Incident Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={6}
          placeholder="Describe the incident in detail. Include names, dates, amounts, and any relevant information. The AI will extract structured data from this text."
          className="brutal-input resize-none placeholder:text-brutal-black/25"
        />
      </div>

      {aiError && (
        <div className="p-4 bg-brutal-yellow border-[3px] border-brutal-black font-mono text-sm">
          <span className="font-bold uppercase">Notice:</span> {aiError}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onExtract}
          disabled={isLoading || !formData.description.trim()}
          className="brutal-btn brutal-btn-accent"
        >
          {isLoading ? '/// Extracting...' : '/// Extract with AI'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.description.trim()}
          className="brutal-btn brutal-btn-primary"
        >
          Next &rarr;
        </button>
      </div>

      {formData.aiExtraction && (
        <div className="p-4 bg-brutal-lime border-[3px] border-brutal-black font-mono text-sm flex items-start gap-3">
          <span className="brutal-tag bg-brutal-black text-white flex-shrink-0">AI</span>
          <span>
            Data extracted with <strong>{Math.round(formData.aiExtraction.overallConfidence * 100)}%</strong> overall confidence.
            Fields have been pre-filled in the next steps.
          </span>
        </div>
      )}
    </div>
  );
}
