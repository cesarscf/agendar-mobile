import { ListItem } from "@/components/list-item"
import type { Href } from "expo-router"
import {
  DoorOpen,
  Hammer,
  HammerIcon,
  Package,
  Store,
  Tag,
  Users,
} from "lucide-react-native"
import { SafeAreaView, View } from "react-native"

export default function Establishment() {
  const items = [
    {
      label: "Serviços",
      description: "Gerencie os serviços oferecidos",
      route: "/(tabs)/establishment/services" as Href,
      icon: HammerIcon,
    },
    {
      label: "Categorias",
      description: "Adicione ou edite as categories",
      route: "/(tabs)/establishment/categories" as Href,
      icon: Tag,
    },
    {
      label: "Funcionários",
      description: "Adicione ou edite sua equipe",
      route: "/(tabs)/establishment/employees" as Href,
      icon: Hammer,
    },
    {
      label: "Pacotes de serviços",
      description: "Adicione ou edite pacotes de serviços",
      route: "/(tabs)/establishment/packages" as Href,
      icon: Package,
    },
    {
      label: "Programas de fidelidade",
      description: "Adicione ou edite programas de fidelidade",
      route: "/(tabs)/establishment/loyalties" as Href,
      icon: Package,
    },
    {
      label: "Clientes",
      description: "Configurações clientes de sua loja",
      route: "/(tabs)/establishment/customers" as Href,
      icon: Users,
    },
    {
      label: "Geral",
      description: "Configurações gerais de sua loja",
      route: "/(tabs)/establishment/general" as Href,
      icon: Store,
    },
    {
      label: "Funcionamento",
      description: "Configurações de funcionamento de sua loja",
      route: "/(tabs)/establishment/availabilities" as Href,
      icon: DoorOpen,
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-white">
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
