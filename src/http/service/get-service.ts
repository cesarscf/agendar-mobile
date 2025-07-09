import { AxiosError } from "axios"
import { api } from "../api-client"
import type { Service } from "@/lib/validations/service"

export async function getService(serviceId: string) {
  try {
    const response = await api.get<Service>(`/services/${serviceId}`)

    return {
      data: response.data,
      error: null,
    }
  } catch (err) {
    if (err instanceof AxiosError) {
      return {
        data: null,
        error: err.message,
      }
    }
    return {
      data: null,
      error: "Erro inesperado, tente novamente em alguns minutos.",
    }
  }
}
