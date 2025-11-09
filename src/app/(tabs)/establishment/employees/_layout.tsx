import { Link, router, Stack } from "expo-router"
import { ChevronLeft, Plus } from "lucide-react-native"
import { Pressable } from "react-native"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "PROFISSIONAIS",
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
            <Link href="/(tabs)/establishment/employees/new" asChild>
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
          title: "ADICIONAR PROFISSIONAL",
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
          title: "PROFISSIONAL",
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
