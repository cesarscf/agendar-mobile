import { ListItem } from "@/components/list-item"
import type { Href } from "expo-router"
import { CreditCard } from "lucide-react-native"
import { Text, View } from "react-native"

export default function Settings() {
  const items = [
    {
      label: "Plano",
      description: "Gerencie seu plano",
      route: "/(tabs)/settings/billing" as Href,
      icon: CreditCard,
    },
  ]

  return (
    <View className="flex-1 bg-white">
      <View className="p-6 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">...</Text>
      </View>

      <View className="mt-2 px-4">
        {items.map(item => (
          <ListItem
            key={item.label}
            Icon={item.icon}
            description={item.description}
            label={item.label}
            route={item.route}
          />
        ))}
      </View>
    </View>
  )
}
