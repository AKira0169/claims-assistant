import { z } from 'zod';
import { createClaimSchema, updateClaimSchema, claimResponseSchema } from '../schemas/claim.schema';
import { claimantSchema, claimantResponseSchema } from '../schemas/claimant.schema';
import {
  autoDetailsSchema,
  propertyDetailsSchema,
  healthDetailsSchema,
  otherDetailsSchema,
  claimDetailsSchema,
} from '../schemas/claim-details.schema';
import {
  aiExtractRequestSchema,
  aiExtractionResponseSchema,
  aiExtractedFieldSchema,
  aiValidateRequestSchema,
  aiValidationResponseSchema,
  validationIssueSchema,
} from '../schemas/ai.schema';
import {
  chatMessageSchema,
  chatRequestSchema,
  chatResponseSchema,
} from '../schemas/chat.schema';

// Claim types
export type CreateClaimDto = z.infer<typeof createClaimSchema>;
export type UpdateClaimDto = z.infer<typeof updateClaimSchema>;
export type ClaimResponse = z.infer<typeof claimResponseSchema>;

// Claimant types
export type ClaimantDto = z.infer<typeof claimantSchema>;
export type ClaimantResponse = z.infer<typeof claimantResponseSchema>;

// Claim details types
export type AutoDetails = z.infer<typeof autoDetailsSchema>;
export type PropertyDetails = z.infer<typeof propertyDetailsSchema>;
export type HealthDetails = z.infer<typeof healthDetailsSchema>;
export type OtherDetails = z.infer<typeof otherDetailsSchema>;
export type ClaimDetailsDto = z.infer<typeof claimDetailsSchema>;

// AI types
export type AiExtractRequest = z.infer<typeof aiExtractRequestSchema>;
export type AiExtractionResponse = z.infer<typeof aiExtractionResponseSchema>;
export type AiExtractedField = z.infer<typeof aiExtractedFieldSchema>;
export type AiValidateRequest = z.infer<typeof aiValidateRequestSchema>;
export type AiValidationResponse = z.infer<typeof aiValidationResponseSchema>;
export type ValidationIssue = z.infer<typeof validationIssueSchema>;

// Chat types
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
