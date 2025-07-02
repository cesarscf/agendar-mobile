import { updateService } from "@/http/update-service"
import type { UpdateServiceRequest } from "@/lib/validations/service"
import { useMutation } from "@tanstack/react-query"

export function useUpdateService() {
  return useMutation<boolean, string, UpdateServiceRequest>({
    mutationFn: async inputs => {
      const { data, error } = await updateService(inputs)

      if (error) {
        throw error
      }

      return data!
    },
  })
}
