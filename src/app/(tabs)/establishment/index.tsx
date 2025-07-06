import { type Href, Link } from "expo-router"
import {
  ChevronRight,
  HammerIcon,
  MoreVertical,
  Users,
} from "lucide-react-native"
import { Pressable, SafeAreaView, Text, View } from "react-native"

export default function Establishment() {
  const items = [
    {
      label: "Serviços",
      description: "Gerencie os serviços oferecidos",
      route: "/(tabs)/establishment/services" as Href,
      icon: HammerIcon,
    },
    {
      label: "Funcionários",
      description: "Adicione ou edite sua equipe",
      route: "/(tabs)/establishment/employees" as Href,
      icon: Users,
    },
    {
      label: "Outros",
      description: "Configurações e mais opções",
      route: "/(tabs)/establishment" as Href,
      icon: MoreVertical,
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">Estabelecimento</Text>
      </View>

      <View className="mt-2 px-4">
        {items.map(item => (
          <Link key={item.label} href={item.route} asChild>
            <Pressable className="flex-row items-center justify-between p-2 py-6 border-b border-gray-100">
              <View className="flex-row gap-4 flex-1 items-center">
                <item.icon size={24} className="text-gray-700 mt-1" />
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">
                    {item.label}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {item.description}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} className="text-gray-400 mt-1" />
            </Pressable>
          </Link>
        ))}
      </View>
    </SafeAreaView>
  )
}
