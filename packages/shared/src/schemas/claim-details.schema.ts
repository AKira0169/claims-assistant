import { z } from 'zod';
import { ClaimType } from '../enums';

export const autoDetailsSchema = z.object({
  vehicleMake: z.string().optional().default(''),
  vehicleModel: z.string().optional().default(''),
  vehicleYear: z.string().optional().default(''),
  licensePlate: z.string().optional().default(''),
  otherPartyName: z.string().optional().default(''),
  otherPartyInsurance: z.string().optional().default(''),
  policeReportNumber: z.string().optional().default(''),
  accidentLocation: z.string().optional().default(''),
});

export const propertyDetailsSchema = z.object({
  propertyAddress: z.string().optional().default(''),
  damageType: z.string().optional().default(''),
  roomsAffected: z.string().optional().default(''),
  propertyType: z.string().optional().default(''),
  estimatedRepairCost: z.number().optional(),
});

export const healthDetailsSchema = z.object({
  providerName: z.string().optional().default(''),
  diagnosis: z.string().optional().default(''),
  treatmentDate: z.string().optional().default(''),
  treatmentType: z.string().optional().default(''),
  facilityName: z.string().optional().default(''),
});

export const otherDetailsSchema = z.object({
  category: z.string().optional().default(''),
  additionalInfo: z.string().optional().default(''),
});

export const claimDetailsSchema = z.object({
  detailType: z.nativeEnum(ClaimType),
  data: z.union([autoDetailsSchema, propertyDetailsSchema, healthDetailsSchema, otherDetailsSchema]),
});

export const claimDetailsDataMap = {
  [ClaimType.AUTO]: autoDetailsSchema,
  [ClaimType.PROPERTY]: propertyDetailsSchema,
  [ClaimType.HEALTH]: healthDetailsSchema,
  [ClaimType.OTHER]: otherDetailsSchema,
} as const;
