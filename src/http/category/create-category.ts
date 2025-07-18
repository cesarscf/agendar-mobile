import { AxiosError } from "axios"
import { api } from "../api-client"
import type { CreateCategoryRequest } from "@/lib/validations/category"

export async function createCategory(inpus: CreateCategoryRequest) {
  try {
    const createCategory = await api.post<{ id: string }>(`/categories`, {
      name: inpus.name,
    })

    return {
      data: createCategory.data,
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
