import { SplashScreenController } from "@/components/splash"
import { SessionProvider, useSession } from "@/providers/auth-context"
import { Stack } from "expo-router"
import "../../global.css"
import { StatusBar } from "expo-status-bar"

import { queryClient } from "@/lib/react-query"
import { QueryClientProvider } from "@tanstack/react-query"

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <StatusBar style="auto" />
        <SplashScreenController />
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  )
}

function RootNavigator() {
  const { session } = useSession()

  const isLoggedIn = !!session

  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  )
}
