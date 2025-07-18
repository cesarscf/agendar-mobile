import { AxiosError } from "axios"
import { api } from "../api-client"

export async function deleteCategory(id: string) {
  try {
    await api.delete<{ id: string }>(`/categories/${id}`)

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
