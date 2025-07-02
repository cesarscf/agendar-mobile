import { RegisterForm } from "@/components/forms/register-form"
import { router } from "expo-router"
import { Text, View } from "react-native"

export default function Register() {
  return (
    <View className="flex-1 justify-center items-center">
      <RegisterForm />
      <Text className="text-center mt-2" onPress={() => router.back()}>
        Já possue conta? Entrar
      </Text>
    </View>
  )
}
