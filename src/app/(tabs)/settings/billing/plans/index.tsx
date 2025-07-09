import { usePlans } from "@/hooks/data/plans"
import { Text, View, ScrollView, TouchableOpacity } from "react-native"
import { Button } from "@/components/button"
import { router } from "expo-router"
import { useState } from "react"
import { CheckCircle } from "lucide-react-native"

const PLAN_GROUPS = [
  { label: "Mensal", value: 1 },
  { label: "Semestral", value: 6 },
  { label: "Anual", value: 12 },
]

export default function Plans() {
  const { data: plans } = usePlans()
  const [selectedGroup, setSelectedGroup] = useState(1)

  const filteredPlans = plans?.filter(
    plan => plan.intervalMonth === selectedGroup
  )

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row justify-around p-4 bg-white border-b border-gray-200">
        {PLAN_GROUPS.map(group => (
          <TouchableOpacity
            key={group.value}
            onPress={() => setSelectedGroup(group.value)}
            className={`px-4 py-2 rounded-full ${
              selectedGroup === group.value ? "bg-black" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedGroup === group.value ? "text-white" : "text-black"
              }`}
            >
              {group.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 p-4">
        {filteredPlans?.length ? (
          filteredPlans.map(plan => (
            <View
              key={plan.id}
              className="mb-6 p-5 bg-white rounded-2xl shadow-xs border border-gray-200"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xl font-bold text-gray-900">
                  {plan.name}
                </Text>
                <Text className="text-sm bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {plan.intervalMonth === 1
                    ? "Mensal"
                    : plan.intervalMonth === 6
                      ? "Semestral"
                      : "Anual"}
                </Text>
              </View>

              <Text className="text-gray-600 text-sm mb-3">
                {plan.description}
              </Text>

              <Text className="text-2xl font-bold text-gray-800 mb-1">
                R$ {Number(plan.price).toFixed(2).replace(".", ",")}{" "}
                <Text className="text-base text-gray-500">
                  /
                  {plan.intervalMonth === 1
                    ? "mês"
                    : `${plan.intervalMonth} meses`}
                </Text>
              </Text>

              <View className="flex-row items-center mt-2">
                <CheckCircle size={16} color="green" />
                <Text className="text-sm text-gray-700 ml-2">
                  Inclui de {plan.minimumProfessionalsIncluded} a{" "}
                  {plan.maximumProfessionalsIncluded} profissionais
                </Text>
              </View>

              {plan.trialPeriodDays > 0 && (
                <View className="mt-2 mb-3 bg-green-50 border border-green-200 px-3 py-1 rounded-md">
                  <Text className="text-xs text-green-700">
                    {plan.trialPeriodDays} dias de teste gratuito
                  </Text>
                </View>
              )}

              <Button
                title="Selecionar plano"
                onPress={() => {
                  router.push(
                    `/(tabs)/settings/billing/plans/checkout?planId=${plan.id}`
                  )
                }}
              />
            </View>
          ))
        ) : (
          <Text className="text-center text-gray-500 mt-10">
            Nenhum plano disponível nesta categoria.
          </Text>
        )}
      </ScrollView>
    </View>
  )
}
