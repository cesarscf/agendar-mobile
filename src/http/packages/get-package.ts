import { AxiosError } from "axios"
import { api } from "../api-client"
import type { PackageWithItems } from "@/lib/validations/packages"

export async function getPackage(packageId: string) {
  try {
    const { data } = await api.get<PackageWithItems>(`/packages/${packageId}`)
    console.log(data)
    return {
      data: data,
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
