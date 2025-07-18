import { zodResolver } from "@hookform/resolvers/zod"
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
import { Input } from "../input"
import { Button } from "../button"
import { ImagePickerControl } from "../image-picker"
import { router } from "expo-router"
import { StorageEntity, uploadImageToFirebase } from "@/lib/upload-image"
import React from "react"
import { useCreatePackage } from "@/hooks/data/packages/use-create-package"
import { createPackageSchema } from "@/lib/validations/packages"

type Inputs = z.infer<typeof createPackageSchema>

export function CreatePackageForm() {
  const { mutateAsync, isPending } = useCreatePackage()
  const [loading, setLoading] = React.useState(false)

  const form = useForm<Inputs>({
    resolver: zodResolver(createPackageSchema),
    reValidateMode: "onBlur",
    defaultValues: {
      commission: "0",
      image: "",
      price: "",
      active: true,
      name: "",
    },
  })

  async function onSubmit(inputs: Inputs) {
    setLoading(true)
    let _imageUrl = inputs.image

    if (inputs.image && !inputs.image.startsWith("http")) {
      const uploaded = await uploadImageToFirebase(
        inputs.image,
        StorageEntity.Service
      )

      if (!uploaded) {
        Alert.alert("Erro ao salvar imagem.")
        return
      }

      _imageUrl = uploaded
    }
    try {
      const packageCreated = await mutateAsync({
        ...inputs,
      })

      router.push(`/(tabs)/establishment/packages/${packageCreated.id}`)
    } catch (e) {
      console.log(e)
      Alert.alert("Erro ao atualizar serviço.")
    } finally {
      setLoading(false)
    }
  }

  function onImageChange(uri: string) {
    form.setValue("image", uri, { shouldValidate: true })
  }

  const currentImage = form.watch("image")

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

          <View className="gap-1">
            <Text className="text-sm font-medium">Valor do pacote</Text>
            <Controller
              control={form.control}
              name="price"
              render={({ field }) => (
                <Input
                  placeholder="R$ 10,00"
                  {...field}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  value={field.value}
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
            <Text className="text-sm font-medium">Comissão</Text>
            <Controller
              control={form.control}
              name="commission"
              render={({ field }) => (
                <Input
                  placeholder="Comissão do pacote"
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
            {form.formState.errors.commission && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.commission.message}
              </Text>
            )}
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
            title="Cadastrar Serviço"
            theme="primary"
            onPress={form.handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
