import { createService } from "@/http/create-service"
import type { CreateServiceRequest } from "@/lib/validations/service"
import { useMutation } from "@tanstack/react-query"

export function useCreateService() {
  return useMutation<boolean, string, CreateServiceRequest>({
    mutationFn: async inputs => {
      const { data, error } = await createService(inputs)

      if (error) {
        throw error
      }

      return data!
    },
  })
}
