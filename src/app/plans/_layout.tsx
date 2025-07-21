import { useSession } from "@/providers/auth-context"
import { StripeProvider } from "@stripe/stripe-react-native"
import { router, Stack } from "expo-router"
import { ChevronLeft, LogOut } from "lucide-react-native"
import { Pressable } from "react-native"

export default function Layout() {
  const { signOut } = useSession()

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY as string}
    >
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "PLANOS",
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  signOut()
                }}
              >
                <LogOut />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            title: "CHECKOUT",
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  router.back()
                }}
              >
                <ChevronLeft />
              </Pressable>
            ),
          }}
        />
      </Stack>
    </StripeProvider>
  )
}
