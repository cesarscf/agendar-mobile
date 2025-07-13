import { ListItem } from "@/components/list-item"
import type { Href } from "expo-router"
import { HammerIcon, MoreVertical, Package, Users } from "lucide-react-native"
import { SafeAreaView, Text, View } from "react-native"

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
      label: "Pacotes de serviços",
      description: "Adicione ou edite pacotes de serviços",
      route: "/(tabs)/establishment/packages" as Href,
      icon: Package,
    },
    {
      label: "Geral",
      description: "Configurações gerais de sua loja",
      route: "/(tabs)/establishment/general" as Href,
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
          <ListItem
            key={item.label}
            Icon={item.icon}
            description={item.description}
            label={item.label}
            route={item.route}
          />
        ))}
      </View>
    </SafeAreaView>
  )
}
