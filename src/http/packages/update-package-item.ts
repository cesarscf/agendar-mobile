import { AxiosError } from "axios"
import { api } from "../api-client"
import type { UpdatePackageItemRequest } from "@/lib/validations/packages"

export async function updatePackageItem(
  inputs: UpdatePackageItemRequest & { packageId: string }
) {
  try {
    await api.post(`/packages/${inputs.packageId}/items`, {
      ...inputs,
    })

    return {
      data: true,
      error: null,
    }
  } catch (err) {
    if (err instanceof AxiosError) {
      const message = err.message
      return {
        data: null,
        error: message,
      }
    }

    return {
      data: null,
      error: "Erro inesperado, tente novamente em alguns minutos.",
    }
  }
}
