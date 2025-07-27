import { getReport } from "@/http/reports/get-reports"
import type { GetReportParams } from "@/lib/validations/report"
import { useQuery } from "@tanstack/react-query"

export function useReports(params: GetReportParams) {
  return useQuery({
    queryKey: ["reports", params.type, params.serviceId, params.employeeId],
    queryFn: async () => {
      const { data, error } = await getReport(params)

      if (error) {
        throw error
      }

      return data!
    },

    staleTime: 1000 * 60 * 5,
  })
}
