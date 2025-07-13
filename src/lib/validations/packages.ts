import { z } from "zod"

export const packageSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.string(),
  commission: z.string(),
  image: z.string(),
})

export const createPackageSchema = packageSchema.omit({ id: true })

export const updatePackageSchema = packageSchema.partial().extend({
  id: z.string().min(1, "ID obrigatório"),
})

export type Package = z.infer<typeof packageSchema>
export type CreatePackageRequest = z.infer<typeof createPackageSchema>
export type UpdatePackageRequest = z.infer<typeof updatePackageSchema>
