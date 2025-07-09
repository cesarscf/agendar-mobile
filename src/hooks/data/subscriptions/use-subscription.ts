import {
  getSubscription,
  type GetSubscriptionResponse,
} from "@/http/get-subscription"
import { useQuery } from "@tanstack/react-query"

export function useSubscription(subscriptionId: string) {
  return useQuery<GetSubscriptionResponse, string>({
    queryKey: ["subscription"],
    enabled: !!subscriptionId,
    queryFn: async () => {
      const { data, error } = await getSubscription(subscriptionId)

      if (error) {
        throw error
      }

      return data!
    },
  })
}
