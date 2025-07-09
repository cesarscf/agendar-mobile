import { Button } from "@/components/button"
import { usePaymentMethods } from "@/hooks/data/plans/use-payment-method"

import { getPaymentMethods } from "@/http/payment-methods/get-payment-methods"
import { getSetupIntent } from "@/http/payment-methods/get-setup-intent"
import { createPartnerSubscribe } from "@/http/subscription/create-partner-subscribe"
import { useSession } from "@/providers/auth-context"
import { sleep } from "@/utils"
import { CardField, useStripe } from "@stripe/stripe-react-native"
import { useLocalSearchParams } from "expo-router"
import React from "react"
import { Alert, View } from "react-native"

export default function Checkout() {
  const { planId } = useLocalSearchParams()

  const { partner } = useSession()
  const { createPaymentMethod, confirmSetupIntent } = useStripe()
  const { refetch } = usePaymentMethods()
  const [loading, setLoading] = React.useState(false)

  async function handlePayment(data: {
    name: string
    email: string
    phone: string
  }) {
    try {
      setLoading(true)

      const { data: currentMethods } = await refetch()
      const initialCount = currentMethods?.length || 0

      const { paymentMethod, error: paymentMethodError } =
        await createPaymentMethod({
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: {
              name: data.name,
              email: data.email,
              phone: data.phone,
            },
          },
        })

      if (paymentMethodError) {
        throw new Error(
          paymentMethodError.message || "Erro no cartão de crédito"
        )
      }

      const { data: setupIntent, error: setupIntentError } =
        await getSetupIntent()

      if (setupIntentError || !setupIntent) {
        throw new Error(setupIntentError || "Erro ao criar SetupIntent")
      }

      const { setupIntent: _confirmedSetupIntent, error: confirmError } =
        await confirmSetupIntent(setupIntent.clientSecret, {
          paymentMethodData: {
            paymentMethodId: paymentMethod.id,
          },
          paymentMethodType: "Card",
        })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      let attempts = 0
      const maxAttempts = 6

      while (attempts < maxAttempts) {
        await sleep(5000)

        const { data: updatedMethods, error } = await getPaymentMethods()

        if (error) {
          attempts++
          continue
        }

        if (!updatedMethods || updatedMethods.length <= initialCount) {
          attempts++
          continue
        }

        const lastMethod = updatedMethods[0]

        const { data: subscribe, error: subscribeError } =
          await createPartnerSubscribe({
            cardId: lastMethod.id,
            planId: planId as string,
          })

        console.log("Resultado createPartnerSubscribe:", {
          subscribe,
          subscribeError,
        })

        if (subscribeError) {
          throw new Error("Erro ao criar assinatura")
        }

        Alert.alert("Sucesso", "Assinatura realizada com sucesso!")
        return
      }

      Alert.alert("Erro", "Tempo limite ao aguardar o cartão ser cadastrado.")
    } catch (error) {
      Alert.alert("Erro", String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ width: "100%", marginVertical: 30 }}>
      <CardField
        postalCodeEnabled={false}
        placeholders={{ number: "4242 4242 4242 4242" }}
        cardStyle={{ backgroundColor: "#FFFFFF", textColor: "#000000" }}
        style={{ height: 50, marginBottom: 10 }}
      />
      <Button
        loading={loading}
        title="Pagar"
        onPress={() => {
          if (!partner) return

          handlePayment({
            email: partner.email,
            name: partner.name,
            phone: partner.name,
          })
        }}
      />
    </View>
  )
}
