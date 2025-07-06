import { AxiosError } from "axios"
import { api } from "./api-client"
import type { CreateEmployeeRequest } from "@/lib/validations/employee"

export async function createEmployee(inputs: CreateEmployeeRequest) {
  try {
    await api.post("/employees", {
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
