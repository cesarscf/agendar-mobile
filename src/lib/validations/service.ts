import { z } from "zod"

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome obrigatório"),
  price: z
    .string()
    .min(1, "Preço obrigatório")
    .regex(/^\d+(,\d{1,2})?$/, "Preço inválido. Ex: 10 ou 10,99"),
  active: z.boolean().optional(),
  durationInMinutes: z
    .string()
    .min(1, "Duração obrigatória")
    .regex(/^\d+$/, "Duração deve ser um número inteiro em minutos"),
  description: z.string().optional(),
  image: z.string().optional(),
})

export const createServiceSchema = serviceSchema.omit({ id: true })

export const updateServiceSchema = serviceSchema.partial().extend({
  id: z.string().min(1, "ID obrigatório"),
})

export type Service = z.infer<typeof serviceSchema>
export type CreateServiceRequest = z.infer<typeof createServiceSchema>
export type UpdateServiceRequest = z.infer<typeof updateServiceSchema>
