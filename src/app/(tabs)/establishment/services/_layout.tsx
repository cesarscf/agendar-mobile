import { Link, router, Stack } from "expo-router"
import { ChevronLeft, Plus } from "lucide-react-native"
import { Pressable } from "react-native"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "SERVIÇOS",
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
            <Link href="/(tabs)/establishment/services/new" asChild>
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
          title: "ADICIONAR SERVIÇO",
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
