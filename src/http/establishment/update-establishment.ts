import { AxiosError } from "axios"
import { api } from "../api-client"
import type { UpdateEstablishmentRequest } from "@/lib/validations/establishment"

export async function updateEstablishment(inputs: UpdateEstablishmentRequest) {
  try {
    await api.put<boolean>(`/establishments`, {
      ...inputs,
    })

    return {
      data: true,
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
