import { LoginForm } from "@/components/forms/login-form"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { Image, Text, View } from "react-native"

export default function Login() {
  return (
    <View className="flex-1 justify-center items-center bg-[#001240]">
      <StatusBar style="light" />
      <Image
        source={require("../../assets/icon.png")}
        className="size-48 mb-6"
        resizeMode="contain"
      />
      <LoginForm />
      <Text
        className="text-center mt-2 text-white"
        onPress={() => {
          router.push("/register")
        }}
      >
        Não tem uma conta? Cadastre-se
      </Text>
    </View>
  )
}
