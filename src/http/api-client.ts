import axios from "axios"
import * as SecureStore from "expo-secure-store"

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
})

api.interceptors.request.use(
  async config => {
    const token = await SecureStore.getItemAsync("token")

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export { api }
