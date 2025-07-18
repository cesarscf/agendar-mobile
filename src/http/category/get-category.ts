import { AxiosError } from "axios"
import { api } from "../api-client"
import type { Category } from "@/lib/validations/category"

export async function getCategory(id: string) {
  try {
    const result = await api.get<Category>(`/categories/${id}`)

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
