import { LoginForm } from "@/components/forms/login-form"
import { router } from "expo-router"
import { Text, View } from "react-native"

export default function Login() {
  return (
    <View className="flex-1 justify-center items-center">
      <LoginForm />
      <Text
        className="text-center mt-2"
        onPress={() => {
          router.push("/register")
        }}
      >
        Não tem uma conta? Cadastre-se
      </Text>
    </View>
  )
}
