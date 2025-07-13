import { Link, router, Stack } from "expo-router"
import { ChevronLeft, Plus } from "lucide-react-native"
import { Pressable } from "react-native"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "PACOTES",
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
            <Link href="/(tabs)/establishment/packages/new" asChild>
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
          title: "ADICIONAR PACOTE",
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
          title: "EDITAR PACOTE",
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
