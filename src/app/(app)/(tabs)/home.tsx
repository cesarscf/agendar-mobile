import { Button } from "@/components/button"
import { useSession } from "@/providers/auth-context"
import { Text, View } from "react-native"

export default function Home() {
  const { signOut, partner } = useSession()

  return (
    <View>
      <Button
        onPress={() => {
          // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
          signOut()
        }}
        title="Sign Out"
      />

      <Text>{partner?.name}</Text>
    </View>
  )
}
