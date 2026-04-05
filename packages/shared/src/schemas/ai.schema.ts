import { z } from 'zod';
import { ClaimType, ClaimPriority, ValidationIssueType } from '../enums';

export const aiExtractRequestSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  claimType: z.nativeEnum(ClaimType),
});

export const aiExtractedFieldSchema = z.object({
  value: z.unknown(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const aiExtractionResponseSchema = z.object({
  claimant: z.object({
    firstName: aiExtractedFieldSchema.optional(),
    lastName: aiExtractedFieldSchema.optional(),
    email: aiExtractedFieldSchema.optional(),
    phone: aiExtractedFieldSchema.optional(),
    address: aiExtractedFieldSchema.optional(),
    policyNumber: aiExtractedFieldSchema.optional(),
  }),
  claim: z.object({
    incidentDate: aiExtractedFieldSchema.optional(),
    estimatedAmount: aiExtractedFieldSchema.optional(),
    priority: aiExtractedFieldSchema.optional(),
  }),
  details: z.record(z.string(), aiExtractedFieldSchema).optional(),
  overallConfidence: z.number().min(0).max(1),
});

export const aiValidateRequestSchema = z.object({
  claim: z.object({
    type: z.nativeEnum(ClaimType),
    description: z.string(),
    incidentDate: z.string().nullable().optional(),
    estimatedAmount: z.number().nullable().optional(),
    priority: z.nativeEnum(ClaimPriority).optional(),
  }),
  claimant: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    policyNumber: z.string(),
  }),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const validationIssueSchema = z.object({
  type: z.nativeEnum(ValidationIssueType),
  field: z.string(),
  message: z.string(),
});

export const aiValidationResponseSchema = z.object({
  issues: z.array(validationIssueSchema),
  summary: z.string(),
});
