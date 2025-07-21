import { api } from "../api-client"
import type { UpdateServiceRequest } from "@/lib/validations/service"
import { handleApiError } from "@/utils"

export async function updateService(inputs: UpdateServiceRequest) {
  try {
    await api.put(`/services/${inputs.id}`, {
      ...inputs,
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
