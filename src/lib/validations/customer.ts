import { z } from "zod"

export const customerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  birthDate: z.coerce.date(),
  phoneNumber: z.string(),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  cpf: z.string().nullable(),
  notes: z.string().nullable(),
  state: z.string().nullable(),
  city: z.string().nullable(),
})

export const createCustomerSchema = customerSchema.omit({ id: true })
export const updateCustomerSchema = customerSchema.partial().extend({
  id: z.string().min(1, "ID obrigatório"),
})

export type Customer = z.infer<typeof customerSchema>
export type CreateCustomerRequest = z.infer<typeof createCustomerSchema>
export type UpdateCustomerRequest = z.infer<typeof updateCustomerSchema>
