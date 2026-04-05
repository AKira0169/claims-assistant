'use client';

import { WizardFormData } from '../types';
import { AiBadge } from './AiBadge';

interface Step2Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FIELDS: { name: string; label: string; required?: boolean }[] = [
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'lastName', label: 'Last Name', required: true },
  { name: 'email', label: 'Email' },
  { name: 'phone', label: 'Phone' },
  { name: 'address', label: 'Address' },
  { name: 'policyNumber', label: 'Policy Number', required: true },
];

export function Step2ClaimantInfo({ formData, onUpdate, onNext, onBack }: Step2Props) {
  const updateClaimant = (field: string, value: string) => {
    onUpdate({
      claimant: { ...formData.claimant, [field]: value },
    });
  };

  const isAiFilled = (field: string) => formData.aiFilledFields.has(`claimant.${field}`);
  const getConfidence = (field: string) => {
    const extraction = formData.aiExtraction?.claimant;
    if (!extraction) return null;
    const f = (extraction as any)[field];
    return f?.confidence || null;
  };

  return (
    <div className="space-y-6 brutal-animate-in">
      <h3 className="brutal-heading text-xl flex items-center gap-3">
        <span className="w-8 h-8 bg-brutal-pink text-white border-2 border-brutal-black flex items-center justify-center text-sm">2</span>
        CLAIMANT INFO
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label className="brutal-label brutal-label--inline">
              {field.label}
              {field.required && <span className="text-brutal-pink text-sm">*</span>}
              {isAiFilled(field.name) && getConfidence(field.name) && (
                <AiBadge confidence={getConfidence(field.name)!} />
              )}
            </label>
            <input
              type="text"
              value={(formData.claimant as any)[field.name] || ''}
              onChange={(e) => updateClaimant(field.name, e.target.value)}
              className={`brutal-input ${isAiFilled(field.name) ? 'brutal-input-ai' : ''}`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="brutal-btn brutal-btn-secondary">
          &larr; Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.claimant.firstName || !formData.claimant.lastName || !formData.claimant.policyNumber}
          className="brutal-btn brutal-btn-primary"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
