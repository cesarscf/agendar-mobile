import { AppButton } from "@/components/button"
import { Input } from "@/components/input"
import { register } from "@/http/auth/register"
import { registerSchema } from "@/lib/validations/auth"
import { useSession } from "@/providers/auth-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native"
import type { z } from "zod"

type Inputs = z.infer<typeof registerSchema>

export default function Register() {
  const [loading, setLoading] = React.useState(false)
  const { signIn } = useSession()

  const form = useForm<Inputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      city: "",
      state: "",
    },
  })

  async function onSubmit(inputs: Inputs) {
    setLoading(true)

    const { data, error } = await register(inputs)

    if (data) {
      signIn(data.token)
      router.replace("/")
    }

    if (error) {
      Alert.alert(error)
    }

    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 32 : 0}
      className="flex-1 bg-[#001240]"
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-4 w-full gap-4">
          <Text className="text-white text-4xl mb-5 font-semibold">
            Fazer cadastro
          </Text>

          <View className="gap-1 w-full">
            <Text className="text-sm text-white font-medium">
              Nome Completo
            </Text>
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Input
                  placeholder="Digite seu nome"
                  {...field}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  value={field.value}
                />
              )}
            />
            {form.formState.errors.name && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.name.message}
              </Text>
            )}
          </View>

          <View className="gap-1 w-full">
            <Text className="text-sm font-medium text-white">Email</Text>
            <Controller
              control={form.control}
              name="email"
              render={({ field }) => (
                <Input
                  placeholder="Digite seu email"
                  {...field}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  value={field.value}
                />
              )}
            />
            {form.formState.errors.email && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.email.message}
              </Text>
            )}
          </View>

          <View className="gap-1 w-full">
            <Text className="text-sm font-medium text-white">Senha</Text>

            <Controller
              control={form.control}
              name="password"
              render={({ field }) => (
                <Input
                  placeholder="Digite sua senha"
                  secureTextEntry
                  {...field}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  value={field.value}
                />
              )}
            />
            {form.formState.errors.password && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.password.message}
              </Text>
            )}
          </View>

          <AppButton
            disabled={loading}
            loading={loading}
            title="Cadastrar"
            className="w-full"
            onPress={form.handleSubmit(onSubmit)}
          />
          <Text
            className="text-center mt-2 text-white"
            onPress={() => router.back()}
          >
            Já possue conta? Entrar
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
