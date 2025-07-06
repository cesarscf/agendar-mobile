import { Button } from "@/components/button"
import { useSession } from "@/providers/auth-context"
import { View } from "react-native"

export default function Appointments() {
  const { signOut } = useSession()

  return (
    <View className="flex-1 justify-center">
      <Button
        onPress={() => {
          signOut()
        }}
        title="Sair"
      />
    </View>
  )
}
