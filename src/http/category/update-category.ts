import { AxiosError } from "axios"
import { api } from "../api-client"
import type { UpdateCategoryRequest } from "@/lib/validations/category"

export async function updateCategory(inputs: UpdateCategoryRequest) {
  try {
    await api.put(`/categories/${inputs.id}`, {
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
