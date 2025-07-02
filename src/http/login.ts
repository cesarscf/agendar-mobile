import { AxiosError } from "axios"
import { api } from "./api-client"

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
}

export async function login({ email, password }: LoginRequest) {
  try {
    const response = await api.post<LoginResponse>("/login", {
      email: email,
      password: password,
    })

    return {
      data: response.data,
      error: null,
    }
  } catch (err) {
    console.log(JSON.stringify(err))
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
