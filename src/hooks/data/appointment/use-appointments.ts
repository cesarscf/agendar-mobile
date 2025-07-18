import { useQuery } from "@tanstack/react-query"

import {
  getAppointments,
  type GetAppointmentsParams,
} from "@/http/appointments/get-appointments"
import {
  type GetAppointmentsResponse,
  getAppointmentsResponseSchema,
} from "@/lib/validations/appointment"

export function useAppointments(params: GetAppointmentsParams = {}) {
  return useQuery<GetAppointmentsResponse, Error>({
    queryKey: ["appointments", params],
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await getAppointments(params)

      if (error) {
        throw new Error(error)
      }

      const parsed = getAppointmentsResponseSchema.safeParse(data)
      if (!parsed.success) {
        throw new Error("Erro ao validar os dados de agendamentos")
      }

      return parsed.data
    },
  })
}
