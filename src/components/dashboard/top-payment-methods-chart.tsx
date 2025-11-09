import { useMemo } from "react"
import { PieChartCard } from "./pie-chart-card"
import { useTopPaymentMethods } from "@/hooks/data/reports/use-top-payment-methods"

type TopPaymentMethodsChartProps = {
  startDate: string
  endDate: string
}

export function TopPaymentMethodsChart({
  startDate,
  endDate,
}: TopPaymentMethodsChartProps) {
  const { data, isLoading } = useTopPaymentMethods({ startDate, endDate })
  console.log(data)
  const chartData = useMemo(() => {
    if (!data?.items) return []

    return data.items.map(item => ({
      value: item.usage,
      label: item.method,
      color: "",
    }))
  }, [data])

  return (
    <PieChartCard
      title="Formas de Pagamento"
      data={chartData}
      isLoading={isLoading}
      formatValue={value => value.toString()}
    />
  )
}
