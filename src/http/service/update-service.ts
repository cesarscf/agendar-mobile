import { AxiosError } from "axios"
import { api } from "../api-client"
import type { UpdateServiceRequest } from "@/lib/validations/service"

export async function updateService(inputs: UpdateServiceRequest) {
  try {
    await api.put(`/services/${inputs.id}`, {
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
