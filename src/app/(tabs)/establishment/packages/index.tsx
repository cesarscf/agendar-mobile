import { usePackages } from "@/hooks/data/packages/use-packages"
import type { Package } from "@/lib/validations/packages"
import { useRouter } from "expo-router"
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

export default function Packages() {
  const { data: packages, isLoading } = usePackages()
  const router = useRouter()

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    )
  }

  function renderItem({ item }: { item: Package }) {
    return (
      <View className="bg-white rounded-xl p-4 m-2 shadow-md flex-row items-center justify-between">
        <View className="flex-row items-center space-x-4">
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gray-200" />
          )}
          <View>
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-sm text-gray-500">
              Comissão: {item.commission}%
            </Text>
            <Text className="text-sm text-gray-500">
              {item.active === "true" ? "Ativo" : "Inativo"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() =>
            router.push(`/(tabs)/establishment/packages/${item.id}`)
          }
        >
          <Text className="text-white font-medium">Editar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <FlatList
      data={packages}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  )
}
