import { useReports } from "@/hooks/data/report/use-get-reports"
import { getCurrentMonthRange } from "@/utils"
import { Text, View } from "react-native"

export function TotalRevenueCard() {
  const { endDate, startDate } = getCurrentMonthRange()
  const { data, isPending } = useReports({
    endDate,
    startDate,
    type: "totalRevenue",
  })

  const numericValue = data?.data ? parseFloat(data.data) : 0

  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue)

  return (
    <View className="bg-white rounded-lg shadow-sm p-4">
      <Text className="text-gray-500 text-sm font-medium">
        Faturamento Total
      </Text>

      {isPending ? (
        <View className="h-8 mt-2 bg-gray-100 rounded animate-pulse" />
      ) : (
        <Text className="text-2xl font-bold text-gray-900 mt-1">
          {formattedValue}
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
