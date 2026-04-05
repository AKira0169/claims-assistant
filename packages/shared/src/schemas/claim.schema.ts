import { z } from 'zod';
import { ClaimType, ClaimStatus, ClaimPriority } from '../enums';

export const createClaimSchema = z.object({
  type: z.nativeEnum(ClaimType),
  description: z.string().min(1, 'Description is required'),
  incidentDate: z.string().datetime().optional(),
  estimatedAmount: z.number().min(0).optional(),
  priority: z.nativeEnum(ClaimPriority).optional().default(ClaimPriority.MEDIUM),
  createdBy: z.string().min(1, 'Agent ID is required'),
});

export const updateClaimSchema = z.object({
  type: z.nativeEnum(ClaimType).optional(),
  description: z.string().min(1).optional(),
  incidentDate: z.string().datetime().optional(),
  estimatedAmount: z.number().min(0).optional(),
  priority: z.nativeEnum(ClaimPriority).optional(),
});

export const claimResponseSchema = z.object({
  id: z.string().uuid(),
  claimNumber: z.string(),
  type: z.nativeEnum(ClaimType),
  status: z.nativeEnum(ClaimStatus),
  priority: z.nativeEnum(ClaimPriority),
  description: z.string(),
  incidentDate: z.string().datetime().nullable(),
  reportDate: z.string().datetime(),
  estimatedAmount: z.number().nullable(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
