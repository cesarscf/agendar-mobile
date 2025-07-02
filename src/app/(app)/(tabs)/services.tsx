import { useServices } from "@/hooks/data/services"
import { Text, View } from "react-native"

export default function Services() {
  const { data: services, isLoading } = useServices()

  if (isLoading) {
    return <Text>laoding</Text>
  }

  return (
    <View>
      <Text>Services Tab</Text>
      {services?.map(service => (
        <Text key={service.id}>{service.name}</Text>
      ))}
    </View>
  )
}
