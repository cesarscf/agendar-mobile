import { useReports } from "@/hooks/data/report/use-get-reports"
import { getCurrentMonthRange } from "@/utils"
import { Text, View } from "react-native"

export function ServiceCountCard() {
  const { endDate, startDate } = getCurrentMonthRange()
  const { data, isPending } = useReports({
    endDate,
    startDate,
    type: "newCustomers",
  })

  const formattedCount = data?.data
    ? parseInt(data.data).toLocaleString("pt-BR")
    : "0"

  return (
    <View className="bg-white rounded-lg shadow-sm p-4">
      <Text className="text-gray-500 text-sm font-medium">Novos Clientes</Text>

      {isPending ? (
        <View className="h-8 mt-2 bg-gray-100 rounded animate-pulse" />
      ) : (
        <Text className="text-2xl font-bold text-gray-900 mt-1">
          {formattedCount}
        </Text>
      )}

      <View className="flex-row items-center mt-2">
        <Text className="text-gray-400 text-xs">
          Período: {new Date(startDate).toLocaleDateString("pt-BR")} -{" "}
          {new Date(endDate).toLocaleDateString("pt-BR")}
        </Text>
      </View>
    </View>
  )
}
