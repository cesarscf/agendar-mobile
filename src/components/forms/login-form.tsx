import { login } from "@/http/auth/login"
import { loginSchema } from "@/lib/validations/auth"
import { useSession } from "@/providers/auth-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from "expo-router"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, Text, View } from "react-native"
import type { z } from "zod"
import { Input } from "../input"
import { Button } from "../button"

type Inputs = z.infer<typeof loginSchema>

export function LoginForm() {
  const [loading, setLoading] = React.useState(false)

  const { signIn } = useSession()

  const form = useForm<Inputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(inputs: Inputs) {
    setLoading(true)

    const { data, error } = await login(inputs)

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
    <View className="p-4 gap-3 w-full">
      <Text className="text-sm font-medium">Email</Text>
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

      <Text className="text-sm font-medium">Senha</Text>
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

      <Button
        disabled={loading}
        loading={loading}
        title="Entrar"
        theme="primary"
        onPress={form.handleSubmit(onSubmit)}
        // loading={loading}
      />
    </View>
  )
}
