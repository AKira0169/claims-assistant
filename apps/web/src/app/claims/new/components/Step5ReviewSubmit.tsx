'use client';

import { useEffect } from 'react';
import { ValidationIssueType } from '@claims-assistant/shared';
import { WizardFormData } from '../types';

interface Step5Props {
  formData: WizardFormData;
  isLoading: boolean;
  aiError: string | null;
  submitSuccess: boolean;
  onValidate: () => Promise<any>;
  onSubmit: () => void;
  onBack: () => void;
  onGoToStep: (step: any) => void;
}

export function Step5ReviewSubmit({
  formData,
  isLoading,
  aiError,
  submitSuccess,
  onValidate,
  onSubmit,
  onBack,
  onGoToStep,
}: Step5Props) {
  useEffect(() => {
    if (!formData.aiValidation) {
      onValidate();
    }
  }, []);

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">&#10003;</div>
        <h3 className="text-xl font-semibold text-green-700 mb-2">Claim Submitted Successfully</h3>
        <p className="text-gray-600">The claim has been submitted and is now under review.</p>
        <a href="/" className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Dashboard
        </a>
      </div>
    );
  }

  const validation = formData.aiValidation;
  const errors = validation?.issues.filter((i) => i.type === ValidationIssueType.ERROR) || [];
  const warnings = validation?.issues.filter((i) => i.type === ValidationIssueType.WARNING) || [];
  const hasErrors = errors.length > 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 5: Review & Submit</h3>

      {isLoading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Running AI validation...
        </div>
      )}

      {validation && !isLoading && (
        <div className="space-y-3">
          {errors.length === 0 && warnings.length === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {validation.summary}
            </div>
          )}

          {errors.map((e, i) => (
            <div key={`err-${i}`} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <span className="font-bold">ERROR:</span>
              <span>{e.message} (field: {e.field})</span>
            </div>
          ))}

          {warnings.map((w, i) => (
            <div key={`warn-${i}`} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-start gap-2">
              <span className="font-bold">WARNING:</span>
              <span>{w.message} (field: {w.field})</span>
            </div>
          ))}
        </div>
      )}

      {aiError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {aiError}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Claim Info</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Type:</dt>
            <dd className="font-medium">{formData.claimType}</dd>
            <dt className="text-gray-500">Priority:</dt>
            <dd className="font-medium">{formData.priority}</dd>
            <dt className="text-gray-500">Incident Date:</dt>
            <dd className="font-medium">{formData.incidentDate ? new Date(formData.incidentDate).toLocaleDateString() : 'Not specified'}</dd>
            <dt className="text-gray-500">Estimated Amount:</dt>
            <dd className="font-medium">{formData.estimatedAmount ? `$${formData.estimatedAmount.toLocaleString()}` : 'Not specified'}</dd>
          </dl>
        </div>

        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Claimant</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Name:</dt>
            <dd className="font-medium">{formData.claimant.firstName} {formData.claimant.lastName}</dd>
            <dt className="text-gray-500">Policy:</dt>
            <dd className="font-medium">{formData.claimant.policyNumber}</dd>
            <dt className="text-gray-500">Email:</dt>
            <dd className="font-medium">{formData.claimant.email || '\u2014'}</dd>
            <dt className="text-gray-500">Phone:</dt>
            <dd className="font-medium">{formData.claimant.phone || '\u2014'}</dd>
          </dl>
        </div>

        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Description</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || hasErrors}
          className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Submitting...' : 'Submit Claim'}
        </button>
        {hasErrors && (
          <span className="text-xs text-red-600">Fix all errors before submitting.</span>
        )}
      </div>
    </div>
  );
}
