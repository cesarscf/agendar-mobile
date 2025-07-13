import { AxiosError } from "axios"
import { api } from "../api-client"
import type { Package } from "@/lib/validations/packages"

export async function getPackages() {
  try {
    const result = await api.get<Package[]>("/packages")

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
