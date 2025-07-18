import { Link, router, Stack } from "expo-router"
import { ChevronLeft, Plus } from "lucide-react-native"
import { Pressable } from "react-native"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "CLIENTES",
          headerLeft: () => (
            <Pressable
              onPress={() => {
                router.back()
              }}
            >
              <ChevronLeft />
            </Pressable>
          ),
          headerRight: () => (
            <Link href="/(tabs)/establishment/customers/new" asChild>
              <Pressable>
                <Plus />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: "ADICIONAR CLIENTE",
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

      <Stack.Screen
        name="[id]"
        options={{
          title: "EDITAR CLIENTE",
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
  )
}
