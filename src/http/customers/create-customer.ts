import { AxiosError } from "axios"
import { api } from "../api-client"
import type { CreateCustomerRequest } from "@/lib/validations/customer"

export async function createCustomer(inputs: CreateCustomerRequest) {
  try {
    await api.post("/customers", {
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
