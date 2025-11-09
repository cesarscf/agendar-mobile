import { View, Text, ActivityIndicator, Dimensions } from "react-native"
import { useMemo } from "react"
import { BarChart } from "react-native-gifted-charts"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useDailyRevenue } from "@/hooks/data/reports/use-daily-revenue"
import { formatPriceFromCents } from "@/utils"

type DailyRevenueChartProps = {
  startDate: string
  endDate: string
}

export function DailyRevenueChart({
  startDate,
  endDate,
}: DailyRevenueChartProps) {
  const { data, isLoading } = useDailyRevenue({ startDate, endDate })

  const chartData = useMemo(() => {
    if (!data?.items) return []

    return data.items.map(item => ({
      value: item.value / 100,
      label: format(parseISO(item.date), "dd/MM", { locale: ptBR }),
      frontColor: "#000",
    }))
  }, [data])

  const total = data?.items.reduce((sum, item) => sum + item.value, 0) ?? 0

  if (isLoading) {
    return (
      <View className="bg-white rounded-xl p-4 border border-gray-200 items-center justify-center min-h-[300px]">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-sm text-gray-500 mt-2">Carregando...</Text>
      </View>
    )
  }

  if (!chartData.length) {
    return (
      <View className="bg-white rounded-xl p-4 border border-gray-200">
        <Text className="text-base font-semibold mb-2">Receita Diária</Text>
        <View className="items-center justify-center py-12">
          <Text className="text-sm text-gray-500">Nenhum dado disponível</Text>
        </View>
      </View>
    )
  }

  const screenWidth = Dimensions.get("window").width

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200">
      <View className="mb-4">
        <Text className="text-base font-semibold text-gray-800">
          Receita Diária
        </Text>
        <Text className="text-2xl font-bold text-black mt-1">
          {formatPriceFromCents(total)}
        </Text>
      </View>

      <BarChart
        data={chartData}
        width={screenWidth - 64}
        height={220}
        barWidth={chartData.length > 15 ? 12 : 22}
        spacing={chartData.length > 15 ? 8 : 16}
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#E5E7EB"
        yAxisTextStyle={{
          color: "#6B7280",
          fontSize: 10,
        }}
        xAxisLabelTextStyle={{
          color: "#6B7280",
          fontSize: 10,
          textAlign: "center",
        }}
        isAnimated
        animationDuration={500}
        showGradient
        gradientColor="#000"
        frontColor="#000"
      />
    </View>
  )
}
