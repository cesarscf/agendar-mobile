import { Stack } from "expo-router"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "PLANO",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          title: "ATUALIZAR PLANO",
          headerShown: false,
        }}
      />
    </Stack>
  )
}
