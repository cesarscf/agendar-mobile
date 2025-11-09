import { router, Stack } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { Pressable } from "react-native"

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "FUNCIONAMENTO",
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
