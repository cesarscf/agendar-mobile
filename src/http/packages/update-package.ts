import { AxiosError } from "axios"
import { api } from "../api-client"
import type { UpdatePackageRequest } from "@/lib/validations/packages"

export async function updatePackage(inputs: UpdatePackageRequest) {
  try {
    await api.put(`/packages/${inputs.id}`, {
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
