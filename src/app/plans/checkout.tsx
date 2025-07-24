import { useState } from "react"
import {
  Alert,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { CardField, useStripe } from "@stripe/stripe-react-native"
import { router, useLocalSearchParams } from "expo-router"
import { DollarSign, Gift, Users } from "lucide-react-native"

import { AppButton } from "@/components/button"
import { usePaymentMethods } from "@/hooks/data/plans/use-payment-method"
import { usePlan } from "@/hooks/data/plans/use-plan"
import { getPaymentMethods } from "@/http/payment-methods/get-payment-methods"
import { getSetupIntent } from "@/http/payment-methods/get-setup-intent"
import { createPartnerSubscribe } from "@/http/subscription/create-partner-subscribe"
import { useSession } from "@/providers/auth-context"
import { sleep } from "@/utils"

export default function Checkout() {
  const { planId } = useLocalSearchParams()
  const { data: plan, isLoading } = usePlan(planId as string)

  const { partner } = useSession()
  const { createPaymentMethod, confirmSetupIntent } = useStripe()
  const { refetch } = usePaymentMethods()
  const [loading, setLoading] = useState(false)

  async function handlePayment(data: {
    name: string
    email: string
    phone: string
  }) {
    try {
      setLoading(true)

      const { data: currentMethods } = await refetch()
      const initialMethodCount = currentMethods?.length || 0

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
          paymentMethodError.message || "Error creating payment method."
        )
      }

      const { data: setupIntent, error: setupIntentError } =
        await getSetupIntent()

      if (setupIntentError || !setupIntent) {
        throw new Error(setupIntentError || "Error creating SetupIntent.")
      }

      const { setupIntent: confirmedSetupIntent, error: confirmError } =
        await confirmSetupIntent(setupIntent.clientSecret, {
          paymentMethodData: {
            paymentMethodId: paymentMethod.id,
          },
          paymentMethodType: "Card",
        })

      if (confirmError) {
        console.log(confirmError)
        throw new Error(confirmError.message || "Error confirming SetupIntent.")
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

        if (!updatedMethods || updatedMethods.length <= initialMethodCount) {
          attempts++
          continue
        }

        const latestMethod = updatedMethods[0]

        const { data: subscription, error: subscriptionError } =
          await createPartnerSubscribe({
            cardId: latestMethod.id,
            planId: planId as string,
          })

        if (subscriptionError) {
          throw new Error("Error creating subscription.")
        }

        Alert.alert("Success", "Subscription successfully created!")

        router.replace("/(tabs)")

        return
      }

      Alert.alert("Error", "Timeout while waiting for card registration.")
    } catch (error) {
      Alert.alert(String(error).replace("Error: ", ""))
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || !plan) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-5 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          {plan.name}
        </Text>
        <Text className="text-gray-600 mb-8">{plan.description}</Text>

        <View className="flex-row items-center mb-5 space-x-3">
          <DollarSign size={22} color="#4B5563" />
          <Text className="font-semibold text-gray-800 w-28">Price:</Text>
          <Text className="text-gray-700">
            ${plan.price} /{" "}
            {plan.intervalMonth > 1 ? `${plan.intervalMonth} months` : "month"}
          </Text>
        </View>

        <View className="flex-row items-center mb-5 space-x-3">
          <Gift size={22} color="#4B5563" />
          <Text className="font-semibold text-gray-800 w-28">Free Trial:</Text>
          <Text className="text-gray-700">{plan.trialPeriodDays} days</Text>
        </View>

        <View className="flex-row items-center mb-5 space-x-3">
          <Users size={22} color="#4B5563" />
          <Text className="font-semibold text-gray-800 w-28">
            Professionals:
          </Text>
          <Text className="text-gray-700">
            {plan.minimumProfessionalsIncluded} to{" "}
            {plan.maximumProfessionalsIncluded}
          </Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          Card Information
        </Text>

        <CardField
          postalCodeEnabled={false}
          placeholders={{ number: "4242 4242 4242 4242" }}
          cardStyle={{
            backgroundColor: "#fff",
            textColor: "#000",
            borderRadius: 8,
          }}
          style={{ height: 50, marginBottom: 24 }}
        />
      </ScrollView>

      <View className="absolute bottom-0 w-full px-5 py-4 bg-white border-t border-gray-200">
        <AppButton
          loading={loading}
          title="Subscribe Now"
          onPress={() => {
            if (!partner) return
            handlePayment({
              email: partner.email,
              name: partner.name,
              phone: partner.name || "",
            })
          }}
        />
      </View>
    </KeyboardAvoidingView>
  )
}
