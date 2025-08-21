import { AppButton } from "@/components/button"
import { StatusBar } from "expo-status-bar"
import { Linking, Platform, Text, View } from "react-native"

export default function RegisterRedirect() {
  const WEB_REGISTER_URL = "https://test.com.br/register"

  function openWebRegister() {
    Linking.openURL(WEB_REGISTER_URL)
  }

  return (
    <View className="flex-1 bg-[#001240] justify-center items-center px-6">
      <StatusBar style="light" />

      <Text className="text-white text-3xl font-semibold text-center mb-6">
        Cadastro disponível no site
      </Text>

      <Text className="text-white text-base text-center mb-10">
        O cadastro deve ser realizado pela versão web. Clique no botão abaixo
        para acessar o site e concluir seu registro.
      </Text>

      <AppButton
        title="Ir para o site"
        className="w-full"
        onPress={openWebRegister}
      />

      <Text className="text-gray-300 text-xs mt-6 text-center">
        {Platform.OS === "ios"
          ? "Será aberto no Safari."
          : "Será aberto no navegador padrão."}
      </Text>
    </View>
  )
}
