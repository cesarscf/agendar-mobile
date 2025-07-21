import { api } from "../api-client"
import type { UpdatePackageRequest } from "@/lib/validations/packages"
import { handleApiError } from "@/utils"

export async function updatePackage(inputs: UpdatePackageRequest) {
  try {
    await api.put(`/packages/${inputs.id}`, {
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
