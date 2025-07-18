import { AxiosError } from "axios"
import { api } from "../api-client"
import type { CreatePackageRequest, Package } from "@/lib/validations/packages"

export async function createPackage(inputs: CreatePackageRequest) {
  try {
    const result = await api.post<Package>("/packages", {
      ...inputs,
    })

    return {
      data: result.data,
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
