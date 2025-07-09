import { usePlans } from "@/hooks/data/plans"
import { usePaymentMethods } from "@/hooks/data/plans/use-payment-method"
import { useUpdateSubscription } from "@/hooks/data/subscriptions/use-update-subscription"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Text, View, ActivityIndicator, Alert } from "react-native"
import { Button } from "@/components/button"

export default function Checkout() {
  const router = useRouter()
  const { planId } = useLocalSearchParams()

  const { data: paymentMethods, isLoading: loadingMethods } =
    usePaymentMethods()
  const { data: plans, isLoading: loadingPlans } = usePlans()
  const { mutateAsync, isPending } = useUpdateSubscription()

  const selectedPlan = plans?.find(it => it.id === planId)
  const paymentMethodDefault = paymentMethods?.find(it => it.isDefault)

  async function onUpdateSubscription() {
    try {
      if (!selectedPlan || !paymentMethodDefault) return

      await mutateAsync(selectedPlan.id)

      Alert.alert("Sucesso", "Plano atualizado com sucesso!")
      router.push("/settings/billing")
    } catch (e) {
      console.log(e)
      Alert.alert("Erro", "Falha ao atualizar plano.")
    }
  }

  if (
    !selectedPlan ||
    !paymentMethodDefault ||
    loadingPlans ||
    loadingMethods
  ) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <Stack.Screen options={{ title: "Atualizar Plano" }} />

      <Text className="text-xl font-bold mb-4">Resumo da Atualização</Text>

      <View className="mb-6 border border-gray-200 p-4 rounded-xl shadow-sm bg-gray-50">
        <Text className="text-base font-semibold mb-1">Plano Selecionado:</Text>
        <Text className="text-lg">{selectedPlan.name}</Text>
        <Text className="text-sm text-gray-600 mt-1">
          {selectedPlan.description}
        </Text>
        <Text className="text-md mt-2 font-semibold">
          R$ {(Number(selectedPlan.price) / 100).toFixed(2)} /{" "}
          {selectedPlan.intervalMonth === 1
            ? "mês"
            : `${selectedPlan.intervalMonth} meses`}
        </Text>
      </View>

      <View className="mb-6 border border-gray-200 p-4 rounded-xl shadow-sm bg-gray-50">
        <Text className="text-base font-semibold mb-1">Cartão utilizado:</Text>
        <Text className="text-lg">
          {paymentMethodDefault.brand.toUpperCase()} ****{" "}
          {paymentMethodDefault.last4}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          Expira {paymentMethodDefault.expMonth}/{paymentMethodDefault.expYear}
        </Text>
      </View>

      <Button
        onPress={onUpdateSubscription}
        disabled={isPending}
        loading={isPending}
        title={"Atualizar plano"}
      />
    </View>
  )
}
