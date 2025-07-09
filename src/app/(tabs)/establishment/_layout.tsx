import { Stack } from "expo-router"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "LOJA",
        }}
      />

      <Stack.Screen
        name="services"
        options={{
          title: "SERVIÇOS",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="employees"
        options={{
          title: "PROFISSIONAIS",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="general"
        options={{
          title: "GERAL",
          headerShown: false,
        }}
      />
    </Stack>
  )
}
