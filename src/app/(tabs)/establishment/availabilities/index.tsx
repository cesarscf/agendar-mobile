import { getEstablishmentAvailability } from "@/http/establishment/get-establishment-availability"
import { useQuery } from "@tanstack/react-query"

import { ActivityIndicator, SafeAreaView, View } from "react-native"

export default function Availabilities() {
  const { data, isLoading } = useQuery({
    queryKey: ["availabilities"],
    queryFn: getEstablishmentAvailability,
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    )
  }

  if (!data) return

  console.log(data)

  return <SafeAreaView className="flex-1 bg-white"></SafeAreaView>
}
