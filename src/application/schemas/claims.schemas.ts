import { z } from 'zod';

export const claimIdParamsSchema = z.object({
  id: z.string().min(1, 'Claim ID is required')
});

export const getClaimsQuerySchema = z.object({
  memberId: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
});

export type ClaimIdParams = z.infer<typeof claimIdParamsSchema>;
export type GetClaimsQuery = z.infer<typeof getClaimsQuerySchema>;
