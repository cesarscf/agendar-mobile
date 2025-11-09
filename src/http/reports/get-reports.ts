import { api } from "../api-client"
import { handleApiError } from "@/utils"
import type { GetReportParams } from "@/lib/validations/report"

export interface GetReportResponse {
  data: string
}

export async function getReport(params: GetReportParams) {
  try {
    const response = await api.get<GetReportResponse>(`/reports`, {
      params,
    })

    return {
      data: response.data,
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
