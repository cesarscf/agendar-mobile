import { AxiosError } from "axios"
import { api } from "../api-client"
import type { Customer } from "@/lib/validations/customer"

export async function getCustomers() {
  try {
    const response = await api.get<Customer[]>(`/customers`)

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
