import { AxiosError } from "axios"
import { api } from "../api-client"
import type { UpdateCustomerRequest } from "@/lib/validations/customer"

export async function updateCustomer(inputs: UpdateCustomerRequest) {
  try {
    await api.put(`/customers/${inputs.id}`, {
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
