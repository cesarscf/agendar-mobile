import { z } from "zod"

export const packageSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  commission: z.string(),
  price: z.string(),
  image: z.string().optional(),
})

export const createPackageSchema = packageSchema.omit({ id: true })

export const updatePackageSchema = packageSchema.partial().extend({
  id: z.string().min(1, "ID obrigatório"),
})

export const packageItemSchema = z.object({
  serviceId: z.string(),
  quantity: z.number(),
  name: z.string(),
})

export const packageSchemaWithItems = packageSchema.extend({
  items: z.array(packageItemSchema),
})

export const updatePackageItemSchema = z.object({
  serviceId: z.string().min(1, "Selecione um serviço"),
  quantity: z.number(),
})

export const updatePackageItemsSchema = z.object({
  items: z.array(updatePackageItemSchema),
})

export type Package = z.infer<typeof packageSchema>
export type PackageWithItems = z.infer<typeof packageSchemaWithItems>

export type CreatePackageRequest = z.infer<typeof createPackageSchema>
export type UpdatePackageRequest = z.infer<typeof updatePackageSchema>

export type UpdatePackageItemRequest = z.infer<typeof updatePackageItemsSchema>

export type UpdatePackageItem = z.infer<typeof updatePackageItemSchema>
export type UpdatePackageItemsRequest = z.infer<typeof updatePackageItemsSchema>
