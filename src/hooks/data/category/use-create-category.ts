import { createCategory } from "@/http/category/create-category"
import { queryClient } from "@/lib/react-query"
import type { UpdateCategoryRequest } from "@/lib/validations/category"
import { useMutation } from "@tanstack/react-query"

export function useCreateCategory() {
  return useMutation<{ id: string }, string, UpdateCategoryRequest>({
    mutationFn: async inputs => {
      const { data, error } = await createCategory(inputs)
      if (error) throw error
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
