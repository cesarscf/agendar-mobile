import { usePlans } from "@/hooks/data/plans"
import { Text, View, ScrollView } from "react-native"
import { Button } from "@/components/button"
import { router } from "expo-router"
import { useSession } from "@/providers/auth-context"

export default function Plans() {
  const { data: plans } = usePlans()
  const { signOut } = useSession()

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-bold mb-4 text-center">
        Planos disponíveis
      </Text>
      <Button
        title="Sair"
        onPress={() => {
          signOut()
        }}
        className="mt-3"
      />

      {plans?.map(plan => (
        <View
          key={plan.id}
          className="mb-4 p-4 bg-white rounded-2xl shadow border border-gray-200"
        >
          <Text className="text-lg font-semibold">{plan.name}</Text>
          <Text className="text-sm text-gray-500">{plan.description}</Text>
          <Text className="text-base mt-1 font-medium">
            R$ {plan.price}/mês
          </Text>
          <Text className="text-xs text-gray-400">
            {plan.minimumProfessionalsIncluded} -{" "}
            {plan.maximumProfessionalsIncluded} profissionais
          </Text>

          <Button
            title="Selecionar plano"
            onPress={() => {
              router.push(`/plans/checkout?planId=${plan.id}`)
            }}
            className="mt-3"
          />
        </View>
      ))}
    </ScrollView>
  )
}
