import { ListItem } from "@/components/list-item"
import { useSession } from "@/providers/auth-context"
import type { Href } from "expo-router"
import { ChevronRight, CreditCard, LogOut } from "lucide-react-native"
import { Pressable, Text, View } from "react-native"

export default function Settings() {
  const { signOut } = useSession()

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
      {/* <View className="p-6 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">...</Text>
      </View> */}

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
        <Pressable
          onPress={() => {
            signOut()
          }}
          className="flex-row items-center justify-between p-2 py-6  border-gray-100 text-red-400"
        >
          <View className="flex-row gap-4 flex-1 items-center">
            <LogOut size={24} color={"#ff0000"} className=" mt-1" />
            <View className="flex-1">
              <Text className="text-base font-medium text-red-400">Sair</Text>
            </View>
          </View>
          <ChevronRight
            size={20}
            className="mt-1 text-red-400"
            color={"#ff0000"}
          />
        </Pressable>
      </View>
    </View>
  )
}
