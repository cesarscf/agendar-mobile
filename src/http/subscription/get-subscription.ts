import { AxiosError } from "axios"
import { api } from "../api-client"

export interface GetSubscriptionResponse {
  id: string
  status: string
  currentPeriodEnd: string
  endedAt: Date
  integrationSubscriptionId: string
  plan: {
    id: string
    name: string
    description: string
    price: string
  }
}

export async function getSubscription(id: string) {
  try {
    const result = await api.get<GetSubscriptionResponse>(
      `/subscriptions/${id}`
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
