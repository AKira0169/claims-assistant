'use client';

import { useState, useCallback } from 'react';
import {
  ClaimType,
  AiExtractionResponse,
  AiValidationResponse,
  ClaimantDto,
} from '@claims-assistant/shared';
import { WizardStep, WizardFormData, initialFormData } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useClaimWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 5) as WizardStep);
  }, []);

  const goBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1) as WizardStep);
  }, []);

  const goToStep = useCallback((s: WizardStep) => {
    setStep(s);
  }, []);

  const extractWithAi = useCallback(async () => {
    setIsLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_URL}/ai/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          claimType: formData.claimType,
        }),
      });

      if (!res.ok) {
        throw new Error('AI extraction unavailable');
      }

      const extraction: AiExtractionResponse = await res.json();
      const aiFilledFields = new Set<string>();
      const claimantUpdates: Partial<ClaimantDto> = {};

      if (extraction.claimant) {
        for (const [key, field] of Object.entries(extraction.claimant)) {
          if (field && field.confidence !== 'low') {
            (claimantUpdates as any)[key] = String(field.value);
            aiFilledFields.add(`claimant.${key}`);
          }
        }
      }

      const claimUpdates: Partial<WizardFormData> = {};

      if (extraction.claim?.incidentDate?.confidence !== 'low' && extraction.claim?.incidentDate) {
        claimUpdates.incidentDate = String(extraction.claim.incidentDate.value);
        aiFilledFields.add('incidentDate');
      }
      if (extraction.claim?.estimatedAmount?.confidence !== 'low' && extraction.claim?.estimatedAmount) {
        claimUpdates.estimatedAmount = Number(extraction.claim.estimatedAmount.value);
        aiFilledFields.add('estimatedAmount');
      }

      updateFormData({
        ...claimUpdates,
        claimant: { ...formData.claimant, ...claimantUpdates },
        aiExtraction: extraction,
        aiFilledFields,
      });
    } catch (err) {
      setAiError('AI extraction is currently unavailable. Please fill the form manually.');
    } finally {
      setIsLoading(false);
    }
  }, [formData.description, formData.claimType, formData.claimant, updateFormData]);

  const createDraftClaim = useCallback(async () => {
    if (claimId) return claimId;

    const res = await fetch(`${API_URL}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: formData.claimType,
        description: formData.description,
        createdBy: 'agent-001',
      }),
    });

    const claim = await res.json();
    setClaimId(claim.id);
    return claim.id;
  }, [claimId, formData.claimType, formData.description]);

  const validateWithAi = useCallback(async () => {
    setIsLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_URL}/ai/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: {
            type: formData.claimType,
            description: formData.description,
            incidentDate: formData.incidentDate || null,
            estimatedAmount: formData.estimatedAmount,
            priority: formData.priority,
          },
          claimant: formData.claimant,
          details: formData.details,
        }),
      });

      if (!res.ok) throw new Error('Validation unavailable');

      const validation: AiValidationResponse = await res.json();
      updateFormData({ aiValidation: validation });
      return validation;
    } catch {
      setAiError('AI validation unavailable. You may submit without validation.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [formData, updateFormData]);

  const submitClaim = useCallback(async () => {
    setIsLoading(true);
    try {
      const id = await createDraftClaim();

      await fetch(`${API_URL}/claims/${id}/claimant`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.claimant),
      });

      await fetch(`${API_URL}/claims/${id}/details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detailType: formData.claimType,
          data: formData.details,
        }),
      });

      await fetch(`${API_URL}/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentDate: formData.incidentDate || undefined,
          estimatedAmount: formData.estimatedAmount || undefined,
          priority: formData.priority,
        }),
      });

      await fetch(`${API_URL}/claims/${id}/submit`, {
        method: 'POST',
      });

      setSubmitSuccess(true);
    } catch (err) {
      setAiError('Failed to submit claim. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, createDraftClaim]);

  return {
    step,
    formData,
    claimId,
    isLoading,
    aiError,
    submitSuccess,
    updateFormData,
    goNext,
    goBack,
    goToStep,
    extractWithAi,
    validateWithAi,
    submitClaim,
    createDraftClaim,
  };
}
