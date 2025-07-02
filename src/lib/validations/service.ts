import { z } from "zod"

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  active: z.boolean(),
  durationInMinutes: z.number(),
  description: z.string(),
  image: z.string().url(),
})

export const createServiceSchema = serviceSchema.omit({ id: true })

export const updateServiceSchema = serviceSchema.partial().extend({
  id: z.string().min(1, "ID obrigatório"),
})

export type Service = z.infer<typeof serviceSchema>
export type CreateServiceRequest = z.infer<typeof createServiceSchema>
export type UpdateServiceRequest = z.infer<typeof updateServiceSchema>
