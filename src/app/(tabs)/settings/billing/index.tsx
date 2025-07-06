import { useSession } from "@/providers/auth-context"
import { Text, View } from "react-native"

export default function Billing() {
  const { partner } = useSession()

  const currentPlan = partner?.subscriptions[0]

  return (
    <View className="flex-1 justify-center">
      <Text>{currentPlan?.id}</Text>
    </View>
  )
}
