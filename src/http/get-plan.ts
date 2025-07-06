import { AxiosError } from "axios"
import { api } from "./api-client"
import type { Plan } from "@/lib/validations/plans"

export async function getPlan(planId: string) {
  try {
    const response = await api.get<Plan>(`/plan/${planId}`)

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
