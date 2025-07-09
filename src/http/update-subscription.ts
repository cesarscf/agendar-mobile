import { AxiosError } from "axios"
import { api } from "./api-client"

export interface UpdateSubscriptionResponse {
  newPlanName: string
  status: string
  currentPeriodEnd: string
}

export async function updateSubscription(newPlanId: string) {
  try {
    const result = await api.patch<UpdateSubscriptionResponse>(
      "/subscriptions/change-plan",
      {
        newPlanId,
      }
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
