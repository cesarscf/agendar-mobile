import { AxiosError } from "axios"
import { api } from "./api-client"
import type { PaymentMethod } from "@/lib/validations/payment-method"

export async function getPaymentMethods() {
  try {
    const result = await api.get<PaymentMethod[]>("/payment-methods")

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
