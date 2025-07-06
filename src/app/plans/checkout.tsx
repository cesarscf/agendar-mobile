import { Button } from "@/components/button"
import { usePaymentMethods } from "@/hooks/data/plans/use-payment-method"
import { createPartnerSubscribe } from "@/http/create-partner-subscribe"
import { getPaymentMethods } from "@/http/get-payment-methods"
import { getSetupIntent } from "@/http/get-setup-intent"
import { useSession } from "@/providers/auth-context"
import { sleep } from "@/utils"
import { CardField, useStripe } from "@stripe/stripe-react-native"
import { useLocalSearchParams } from "expo-router"
import React from "react"
import { Alert, View } from "react-native"

export default function Checkout() {
  const { planId } = useLocalSearchParams()

  const [cardDetails, setCardDetails] = React.useState(null)

  const { partner } = useSession()
  const { createPaymentMethod, confirmSetupIntent } = useStripe()
  const { refetch } = usePaymentMethods()

  async function handlePayment(data: {
    name: string
    email: string
    phone: string
  }) {
    const { data: currentMethods } = await refetch()
    const initialCount = currentMethods?.length || 0

    if (!cardDetails) return

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
      throw new Error(paymentMethodError.message || "Erro no cartão de crédito")
    }

    const { data: setupIntent, error: setupIntentError } =
      await getSetupIntent()

    if (setupIntentError || !setupIntent) {
      throw new Error(setupIntentError || "Erro ao criar SetupIntent")
    }

    const { setupIntent: confirmedSetupIntent, error: confirmError } =
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
        console.warn("Erro ao buscar métodos de pagamento:", error)
        continue
      }

      if (!updatedMethods || updatedMethods.length <= initialCount) {
        attempts++
        continue
      }

      const lastMethod = updatedMethods[updatedMethods.length - 1]

      const { data: subscribe, error: subscribeError } =
        await createPartnerSubscribe({
          cardId: lastMethod.id,
          planId: planId as string,
        })

      console.log(subscribe, subscribeError)
      return
    }

    Alert.alert("Erro", "Tempo limite ao aguardar o cartão ser cadastrado.")
  }

  return (
    <View style={{ width: "100%", marginVertical: 30 }}>
      <CardField
        postalCodeEnabled={false}
        placeholders={{ number: "4242 4242 4242 4242" }}
        cardStyle={{ backgroundColor: "#FFFFFF", textColor: "#000000" }}
        style={{ height: 50, marginBottom: 10 }}
        onCardChange={cardDetails => {
          setCardDetails(cardDetails)
        }}
      />
      <Button
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
