import {
  ClaimType,
  ClaimPriority,
  ClaimantDto,
  AutoDetails,
  PropertyDetails,
  HealthDetails,
  OtherDetails,
  AiExtractionResponse,
  AiValidationResponse,
} from '@claims-assistant/shared';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface AiFilledField {
  value: unknown;
  confidence: 'high' | 'medium' | 'low';
}

export interface WizardFormData {
  // Step 1
  claimType: ClaimType;
  description: string;

  // Step 2
  claimant: ClaimantDto;

  // Step 3
  incidentDate: string;
  estimatedAmount: number | null;
  priority: ClaimPriority;
  details: AutoDetails | PropertyDetails | HealthDetails | OtherDetails;

  // AI state
  aiExtraction: AiExtractionResponse | null;
  aiValidation: AiValidationResponse | null;
  aiFilledFields: Set<string>;
}

export const initialFormData: WizardFormData = {
  claimType: ClaimType.AUTO,
  description: '',
  claimant: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    policyNumber: '',
  },
  incidentDate: '',
  estimatedAmount: null,
  priority: ClaimPriority.MEDIUM,
  details: {
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    otherPartyName: '',
    otherPartyInsurance: '',
    policeReportNumber: '',
    accidentLocation: '',
  },
  aiExtraction: null,
  aiValidation: null,
  aiFilledFields: new Set(),
};
