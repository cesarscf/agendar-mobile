import { AxiosError } from "axios"
import { api } from "./api-client"

export interface CreatePartnerSubscribeRequest {
  planId: string
  cardId: string
}

export interface CreatePartnerSubscribeResponse {
  status: string
  currentPeriodEnd: string
}

export async function createPartnerSubscribe(
  inputs: CreatePartnerSubscribeRequest
) {
  try {
    const result = await api.post<CreatePartnerSubscribeResponse>(
      "/subscriptions/subscribe",
      inputs
    )

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
