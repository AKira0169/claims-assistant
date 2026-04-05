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
  { value: ClaimType.AUTO, label: 'Auto / Vehicle' },
  { value: ClaimType.PROPERTY, label: 'Property / Home' },
  { value: ClaimType.HEALTH, label: 'Health / Medical' },
  { value: ClaimType.OTHER, label: 'Other' },
];

export function Step1TypeDescription({ formData, onUpdate, onExtract, isLoading, aiError, onNext }: Step1Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 1: Claim Type & Description</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Claim Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {claimTypes.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => onUpdate({ claimType: ct.value })}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                formData.claimType === ct.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Incident Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={6}
          placeholder="Describe the incident in detail. Include names, dates, amounts, and any relevant information. The AI will extract structured data from this text."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {aiError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {aiError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExtract}
          disabled={isLoading || !formData.description.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Extracting...' : 'Extract with AI'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.description.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

      {formData.aiExtraction && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          AI extracted data with {Math.round(formData.aiExtraction.overallConfidence * 100)}% overall confidence. Fields have been pre-filled in the next steps.
        </div>
      )}
    </div>
  );
}
