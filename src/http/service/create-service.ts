import { api } from "../api-client"
import type { CreateServiceRequest } from "@/lib/validations/service"
import { handleApiError } from "@/utils"

export async function createService(inputs: CreateServiceRequest) {
  try {
    await api.post("/packages", {
      ...inputs,
      durationInMinutes: Number(inputs.durationInMinutes),
      price: inputs.price.replace(",", "."),
    })

    return {
      data: true,
      error: null,
    }
  } catch (err) {
    const { error } = handleApiError(err)

    return {
      data: null,
      error,
    }
  }
}
