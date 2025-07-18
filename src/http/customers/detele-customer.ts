import { AxiosError } from "axios"
import { api } from "../api-client"

export async function deleteCustomer(id: string) {
  try {
    await api.delete(`/customers/${id}`)

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
