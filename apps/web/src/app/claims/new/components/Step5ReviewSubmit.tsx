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
      <div className="text-center py-16 brutal-animate-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brutal-lime border-[3px] border-brutal-black shadow-brutal-lg mb-6">
          <span className="text-4xl">&#10003;</span>
        </div>
        <h3 className="brutal-heading text-3xl mb-3">CLAIM SUBMITTED</h3>
        <p className="font-mono text-sm text-brutal-black/60 mb-8">
          The claim has been submitted and is now under review.
        </p>
        <a href="/" className="brutal-btn brutal-btn-primary">
          &larr; Back to Dashboard
        </a>
      </div>
    );
  }

  const validation = formData.aiValidation;
  const errors = validation?.issues.filter((i) => i.type === ValidationIssueType.ERROR) || [];
  const warnings = validation?.issues.filter((i) => i.type === ValidationIssueType.WARNING) || [];
  const hasErrors = errors.length > 0;

  return (
    <div className="space-y-6 brutal-animate-in">
      <h3 className="brutal-heading text-xl flex items-center gap-3">
        <span className="w-8 h-8 bg-brutal-lime border-2 border-brutal-black flex items-center justify-center text-sm">5</span>
        REVIEW & SUBMIT
      </h3>

      {isLoading && (
        <div className="p-4 bg-brutal-blue text-white border-[3px] border-brutal-black font-mono text-sm font-bold uppercase tracking-wider">
          /// Running AI validation...
        </div>
      )}

      {validation && !isLoading && (
        <div className="space-y-3">
          {errors.length === 0 && warnings.length === 0 && (
            <div className="p-4 bg-brutal-lime border-[3px] border-brutal-black font-mono text-sm flex items-center gap-3">
              <span className="brutal-tag bg-brutal-black text-white">OK</span>
              {validation.summary}
            </div>
          )}

          {errors.map((e, i) => (
            <div key={`err-${i}`} className="p-4 bg-brutal-pink text-white border-[3px] border-brutal-black font-mono text-sm flex items-start gap-3">
              <span className="brutal-tag bg-white text-brutal-black flex-shrink-0">ERR</span>
              <span>{e.message} <span className="opacity-60">(field: {e.field})</span></span>
            </div>
          ))}

          {warnings.map((w, i) => (
            <div key={`warn-${i}`} className="p-4 bg-brutal-yellow border-[3px] border-brutal-black font-mono text-sm flex items-start gap-3">
              <span className="brutal-tag bg-brutal-black text-white flex-shrink-0">WARN</span>
              <span>{w.message} <span className="opacity-60">(field: {w.field})</span></span>
            </div>
          ))}
        </div>
      )}

      {aiError && (
        <div className="p-4 bg-brutal-yellow border-[3px] border-brutal-black font-mono text-sm">
          <span className="font-bold uppercase">Notice:</span> {aiError}
        </div>
      )}

      <div className="border-[3px] border-brutal-black divide-y-[3px] divide-brutal-black">
        <div className="p-5">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-black/50 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-brutal-yellow" /> Claim Info
          </h4>
          <dl className="grid grid-cols-2 gap-y-2 gap-x-4 font-mono text-sm">
            <dt className="text-brutal-black/50 uppercase text-xs">Type:</dt>
            <dd className="font-bold">{formData.claimType}</dd>
            <dt className="text-brutal-black/50 uppercase text-xs">Priority:</dt>
            <dd className="font-bold">{formData.priority}</dd>
            <dt className="text-brutal-black/50 uppercase text-xs">Date:</dt>
            <dd className="font-bold">{formData.incidentDate ? new Date(formData.incidentDate).toLocaleDateString() : '\u2014'}</dd>
            <dt className="text-brutal-black/50 uppercase text-xs">Amount:</dt>
            <dd className="font-bold">{formData.estimatedAmount ? `$${formData.estimatedAmount.toLocaleString()}` : '\u2014'}</dd>
          </dl>
        </div>

        <div className="p-5">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-black/50 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-brutal-pink" /> Claimant
          </h4>
          <dl className="grid grid-cols-2 gap-y-2 gap-x-4 font-mono text-sm">
            <dt className="text-brutal-black/50 uppercase text-xs">Name:</dt>
            <dd className="font-bold">{formData.claimant.firstName} {formData.claimant.lastName}</dd>
            <dt className="text-brutal-black/50 uppercase text-xs">Policy:</dt>
            <dd className="font-bold">{formData.claimant.policyNumber}</dd>
            <dt className="text-brutal-black/50 uppercase text-xs">Email:</dt>
            <dd className="font-bold">{formData.claimant.email || '\u2014'}</dd>
            <dt className="text-brutal-black/50 uppercase text-xs">Phone:</dt>
            <dd className="font-bold">{formData.claimant.phone || '\u2014'}</dd>
          </dl>
        </div>

        <div className="p-5">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-black/50 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-brutal-blue" /> Description
          </h4>
          <p className="font-mono text-sm text-brutal-black/80 whitespace-pre-wrap leading-relaxed">{formData.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button type="button" onClick={onBack} className="brutal-btn brutal-btn-secondary">
          &larr; Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || hasErrors}
          className="brutal-btn brutal-btn-success"
        >
          {isLoading ? '/// Submitting...' : '/// Submit Claim'}
        </button>
        {hasErrors && (
          <span className="font-mono text-xs font-bold text-brutal-pink uppercase">Fix errors to submit</span>
        )}
      </div>
    </div>
  );
}
