import { useServices } from "@/hooks/data/services"
import { Text, View } from "react-native"

export default function Services() {
  const { data: services } = useServices()
  console.log(services)
  return (
    <View>
      <Text>Services</Text>
      <View>
        {services?.map(service => (
          <Text key={service.id}>{service.name}</Text>
        ))}
      </View>
    </View>
  )
}
