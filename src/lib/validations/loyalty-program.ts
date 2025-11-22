import { z } from "zod"

export const pointRuleSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  points: z.number(),
})

export const loyaltyProgramSchema = z.object({
  id: z.string(),
  name: z.string(),
  serviceRewardId: z.string(),
  serviceRewardName: z.string(),
  requiredPoints: z.number(),
  active: z.boolean(),
  rules: z.array(pointRuleSchema),
})

export type PointRule = z.infer<typeof pointRuleSchema>
export type LoyaltyProgram = z.infer<typeof loyaltyProgramSchema>
