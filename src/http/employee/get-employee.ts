import { AxiosError } from "axios"
import { api } from "../api-client"
import type { Employee } from "@/lib/validations/employee"

export async function getEmployee(employeeId: string) {
  try {
    const response = await api.get<Employee>(`/employees/${employeeId}`)

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
