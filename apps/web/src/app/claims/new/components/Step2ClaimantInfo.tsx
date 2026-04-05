'use client';

import { WizardFormData } from '../types';
import { AiBadge } from './AiBadge';

interface Step2Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

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

  const fields = [
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'lastName', label: 'Last Name', required: true },
    { name: 'email', label: 'Email' },
    { name: 'phone', label: 'Phone' },
    { name: 'address', label: 'Address' },
    { name: 'policyNumber', label: 'Policy Number', required: true },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 2: Claimant Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
              {isAiFilled(field.name) && getConfidence(field.name) && (
                <AiBadge confidence={getConfidence(field.name)!} />
              )}
            </label>
            <input
              type="text"
              value={(formData.claimant as any)[field.name] || ''}
              onChange={(e) => updateClaimant(field.name, e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${
                isAiFilled(field.name)
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-300'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.claimant.firstName || !formData.claimant.lastName || !formData.claimant.policyNumber}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
