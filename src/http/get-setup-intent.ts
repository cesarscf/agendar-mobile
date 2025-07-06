import { AxiosError } from "axios"
import { api } from "./api-client"

interface GetSetupIntent {
  clientSecret: "string"
}

export async function getSetupIntent() {
  try {
    const result = await api.get<GetSetupIntent>(
      "/payment-methods/setup-intent"
    )

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
