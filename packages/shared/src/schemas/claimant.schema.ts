import { z } from 'zod';

export const claimantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().default(''),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  policyNumber: z.string().min(1, 'Policy number is required'),
});

export const claimantResponseSchema = claimantSchema.extend({
  id: z.string().uuid(),
  claimId: z.string().uuid(),
});
