import {
  type UpdateServiceRequest,
  updateServiceSchema,
} from "@/lib/validations/service"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native"
import type { z } from "zod"
import { Input } from "../input"
import { Button } from "../button"
import { ImagePickerControl } from "../image-picker"
import { StorageEntity, uploadImageToFirebase } from "@/lib/upload-image"
import { useRouter } from "expo-router"

import { useUpdateService } from "@/hooks/data/services"
import React from "react"

type Inputs = z.infer<typeof updateServiceSchema>

type EditServiceFormProps = {
  service: Inputs
}

export function EditServiceForm({ service }: EditServiceFormProps) {
  const { mutateAsync, isPending } = useUpdateService()
  const [loading, setLoading] = React.useState(false)

  const router = useRouter()

  const form = useForm<Inputs>({
    resolver: zodResolver(updateServiceSchema),
    reValidateMode: "onBlur",
    defaultValues: {
      ...service,
      price: service.price?.replace(".", ","),
      durationInMinutes: String(service.durationInMinutes),
    },
  })

  async function onSubmit(inputs: Inputs) {
    setLoading(true)
    let imageUrl = inputs.image

    if (inputs.image && !inputs.image.startsWith("http")) {
      const uploaded = await uploadImageToFirebase(
        inputs.image,
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
        durationInMinutes: inputs.durationInMinutes
          ? Number(inputs.durationInMinutes)
          : undefined,
        price: inputs.price ? inputs.price.replace(",", ".") : undefined,
      } as UpdateServiceRequest

      await mutateAsync(payload)

      router.back()
    } catch (_) {
      Alert.alert("Erro ao atualizar serviço.")
    } finally {
      setLoading(false)
    }
  }

  const currentImage = form.watch("image")

  function onImageChange(uri: string) {
    form.setValue("image", uri, { shouldValidate: true })
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
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
            <Text className="text-sm font-medium">Preço</Text>
            <Controller
              control={form.control}
              name="price"
              render={({ field }) => (
                <Input
                  placeholder="Preço"
                  keyboardType="numeric"
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.price && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.price.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Duração (min)</Text>
            <Controller
              control={form.control}
              name="durationInMinutes"
              render={({ field }) => (
                <Input
                  placeholder="Duração em minutos"
                  keyboardType="numeric"
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.durationInMinutes && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.durationInMinutes.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Descrição</Text>
            <Controller
              control={form.control}
              name="description"
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
            {form.formState.errors.description && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.description.message}
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

          <ImagePickerControl
            value={currentImage}
            onChange={onImageChange}
            label="Imagem do serviço"
          />
        </ScrollView>

        <View className="p-4 border-t border-gray-200 bg-white">
          <Button
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
