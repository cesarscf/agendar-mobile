import { Button } from "@/components/button"
import { useSubscription } from "@/hooks/data/subscriptions/use-subscription"
import { useCancelSubscription } from "@/hooks/data/subscriptions/use-cancel-subscription"
import { useSession } from "@/providers/auth-context"
import { router } from "expo-router"
import { Alert, ActivityIndicator, Text, View } from "react-native"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"

export default function Billing() {
  const { partner } = useSession()
  const subscriptionId = partner?.subscriptions[0]?.id

  const {
    data: subscription,
    isLoading,
    refetch,
  } = useSubscription(subscriptionId!)

  const { mutateAsync: cancelSubscription } = useCancelSubscription()
  const [isCancelling, setIsCancelling] = useState(false)
  console.log(subscription, isLoading)

  if (isLoading || !subscription) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    )
  }

  function handleCancel() {
    Alert.alert(
      "Cancelar assinatura",
      "Tem certeza que deseja cancelar seu plano?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsCancelling(true)
              await cancelSubscription()
              Alert.alert("Assinatura cancelada com sucesso.")
              await refetch()
            } catch {
              Alert.alert("Erro ao cancelar", "Tente novamente mais tarde.")
            } finally {
              setIsCancelling(false)
            }
          },
        },
      ]
    )
  }

  return (
    <View className="flex-1 bg-white px-6 py-8">
      <Text className="text-2xl font-bold mb-6">Seu plano atual</Text>

      <Text className="text-base font-semibold text-black mb-1">
        {subscription.plan.name}
      </Text>
      <Text className="text-sm text-gray-700 mb-4">
        {subscription.plan.description}
      </Text>

      <Text className="text-lg font-bold text-gray-900 mb-1">
        R$ {Number(subscription.plan.price).toFixed(2).replace(".", ",")}
      </Text>

      <Text className="text-sm text-gray-600 mb-1">
        Status:{" "}
        <Text
          className={`font-semibold ${
            subscription.status === "active" ? "text-green-700" : "text-red-600"
          }`}
        >
          {subscription.status === "active" ? "Ativa" : "Inativa"}
        </Text>
      </Text>

      <Text className="text-sm text-gray-600 mb-8">
        Renovação em:{" "}
        {format(
          new Date(subscription.currentPeriodEnd),
          "dd 'de' MMMM 'de' yyyy",
          { locale: ptBR }
        )}
      </Text>

      <Button
        title="Atualizar plano"
        onPress={() => {
          router.push("/(tabs)/settings/billing/plans")
        }}
        className="mb-3"
      />

      <Button
        title={isCancelling ? "Cancelando..." : "Cancelar assinatura"}
        onPress={handleCancel}
        theme="secondary"
        disabled={isCancelling}
      />
    </View>
  )
}
