import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native"
import type { z } from "zod"
import { Input } from "../input"
import { AppButton } from "../button"
import { ImagePickerControl } from "../image-picker"
import { StorageEntity, uploadImageToFirebase } from "@/lib/upload-image"
import { useRouter } from "expo-router"

import React from "react"
import { updateEmployeeSchema } from "@/lib/validations/employee"
import { useUpdateEmployee } from "@/hooks/data/employees"

type Inputs = z.infer<typeof updateEmployeeSchema>

type EditEmployeeFormProps = {
  employee: Inputs
}

export function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const { mutateAsync, isPending } = useUpdateEmployee()
  const [loading, setLoading] = React.useState(false)

  const router = useRouter()

  const form = useForm<Inputs>({
    resolver: zodResolver(updateEmployeeSchema),
    reValidateMode: "onBlur",
    defaultValues: {
      ...employee,
    },
  })

  async function onSubmit(inputs: Inputs) {
    setLoading(true)
    let imageUrl = inputs.avatarUrl

    if (inputs.avatarUrl && !inputs.avatarUrl.startsWith("http")) {
      const uploaded = await uploadImageToFirebase(
        inputs.avatarUrl,
        StorageEntity.Service
      )

      if (!uploaded) {
        Alert.alert("Erro ao salvar imagem.")
        setLoading(false)
        return
      }

      imageUrl = uploaded
    }

    try {
      const payload = {
        ...inputs,
        image: imageUrl,
      }

      await mutateAsync(payload)

      router.back()
    } catch (_) {
      Alert.alert("Erro ao atualizar serviço.")
    } finally {
      setLoading(false)
    }
  }

  const currentImage = form.watch("avatarUrl")

  function onImageChange(uri: string) {
    form.setValue("avatarUrl", uri, { shouldValidate: true })
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white">
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 32,
            gap: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-1">
            <Text className="text-sm font-medium">Nome</Text>
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Input
                  placeholder="Nome do serviço"
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.name && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.name.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Email</Text>
            <Controller
              control={form.control}
              name="email"
              render={({ field }) => (
                <Input
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
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

          <View className="gap-1">
            <Text className="text-sm font-medium">Telefone</Text>
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <Input
                  placeholder="Duração em minutos"
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.phone && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.phone.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Endereço</Text>
            <Controller
              control={form.control}
              name="address"
              render={({ field }) => (
                <Input
                  placeholder="Descrição do serviço"
                  multiline
                  numberOfLines={5}
                  className="h-40"
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.address && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.address.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Ativo</Text>
            <Controller
              control={form.control}
              name="active"
              render={({ field: { value, onChange } }) => (
                <View className="flex-row items-center justify-between p-3 rounded">
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    thumbColor={value ? "#10b981" : "#ccc"}
                    trackColor={{ false: "#e5e7eb", true: "#e5e7eb" }}
                  />
                </View>
              )}
            />
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Biografia</Text>
            <Controller
              control={form.control}
              name="biography"
              render={({ field }) => (
                <Input
                  placeholder="Sobre o funcionário"
                  multiline
                  numberOfLines={5}
                  className="h-40"
                  {...field}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  value={field.value}
                />
              )}
            />
          </View>

          <ImagePickerControl
            value={currentImage}
            onChange={onImageChange}
            label="Imagem do serviço"
          />
        </ScrollView>

        <View className="p-4 border-t border-gray-200 bg-white">
          <AppButton
            disabled={isPending || loading}
            loading={isPending || loading}
            title="Salvar Alterações"
            theme="primary"
            onPress={form.handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
