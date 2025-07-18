// app/edit-package/[id].tsx
import { useState } from "react"
import { useLocalSearchParams } from "expo-router"
import { usePackage } from "@/hooks/data/packages/use-package"
import { useServices } from "@/hooks/data/services"
import { Text, TouchableOpacity, View } from "react-native"
import { EditPackageForm } from "@/components/forms/update-package-form"
import { EditPackageItemsForm } from "@/components/forms/edit-package-items-form"

export default function EditPackageScreen() {
  const { id } = useLocalSearchParams()
  const { data } = usePackage(id as string)
  const { data: services } = useServices()

  const [tab, setTab] = useState<"info" | "items">("info")

  if (!data || !services) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Carregando...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => setTab("info")}
          className={`flex-1 py-4 items-center border-b-2 ${
            tab === "info" ? "border-blue-500" : "border-gray-300"
          }`}
        >
          <Text
            className={`font-semibold ${tab === "info" ? "text-blue-600" : "text-gray-500"}`}
          >
            Informações
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("items")}
          className={`flex-1 py-4 items-center border-b-2 ${
            tab === "items" ? "border-blue-500" : "border-gray-300"
          }`}
        >
          <Text
            className={`font-semibold ${tab === "items" ? "text-blue-600" : "text-gray-500"}`}
          >
            Itens
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "info" && <EditPackageForm data={data} />}
      {tab === "items" && (
        <EditPackageItemsForm
          packageId={data.id}
          items={data.items ?? []}
          services={services}
        />
      )}
    </View>
  )
}
