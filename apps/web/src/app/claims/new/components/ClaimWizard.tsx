'use client';

import { useClaimWizard } from '../hooks/useClaimWizard';
import { StepIndicator } from './StepIndicator';
import { Step1TypeDescription } from './Step1TypeDescription';
import { Step2ClaimantInfo } from './Step2ClaimantInfo';
import { Step3IncidentDetails } from './Step3IncidentDetails';
import { Step4Documents } from './Step4Documents';
import { Step5ReviewSubmit } from './Step5ReviewSubmit';

export function ClaimWizard() {
  const wizard = useClaimWizard();

  return (
    <div className="brutal-card p-6 md:p-8 brutal-animate-in">
      <StepIndicator currentStep={wizard.step} onStepClick={wizard.goToStep} />

      {wizard.step === 1 && (
        <Step1TypeDescription
          formData={wizard.formData}
          onUpdate={wizard.updateFormData}
          onExtract={wizard.extractWithAi}
          isLoading={wizard.isLoading}
          aiError={wizard.aiError}
          onNext={wizard.goNext}
        />
      )}

      {wizard.step === 2 && (
        <Step2ClaimantInfo
          formData={wizard.formData}
          onUpdate={wizard.updateFormData}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      )}

      {wizard.step === 3 && (
        <Step3IncidentDetails
          formData={wizard.formData}
          onUpdate={wizard.updateFormData}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      )}

      {wizard.step === 4 && (
        <Step4Documents
          claimId={wizard.claimId}
          createDraftClaim={wizard.createDraftClaim}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      )}

      {wizard.step === 5 && (
        <Step5ReviewSubmit
          formData={wizard.formData}
          isLoading={wizard.isLoading}
          aiError={wizard.aiError}
          submitSuccess={wizard.submitSuccess}
          onValidate={wizard.validateWithAi}
          onSubmit={wizard.submitClaim}
          onBack={wizard.goBack}
          onGoToStep={wizard.goToStep}
        />
      )}
    </div>
  );
}
