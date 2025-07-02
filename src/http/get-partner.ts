import { AxiosError } from "axios"
import { api } from "./api-client"

export type Partner = {
  id: string
  name: string
  email: string
  establishments: {
    id: string
    name: string
  }[]
  subscriptions: {
    id: string
    status: string
    endedAt: Date
    createdAt: Date
  }[]
}

interface GetPartnerResponse {
  partner: Partner
}

export async function getPartner() {
  try {
    const response = await api.get<GetPartnerResponse>("/partner")

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
