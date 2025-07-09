import { AxiosError } from "axios"
import { api } from "../api-client"

export async function cancelSubscription() {
  try {
    await api.delete<boolean>("/subscriptions/cancel")

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
