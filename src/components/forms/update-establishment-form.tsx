import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"

import { StorageEntity, uploadImageToFirebase } from "@/lib/upload-image"
import { useRouter } from "expo-router"
import React from "react"
import { useUpdateEstablishment } from "@/hooks/data/establishment/use-update-establishment"
import {
  updateEstablishmentSchema,
  type UpdateEstablishmentRequest,
} from "@/lib/validations/establishment"
import { Input } from "@/components/input"
import { ImagePickerControl } from "@/components/image-picker"
import { AppButton } from "@/components/button"

type Inputs = UpdateEstablishmentRequest

type UpdateEstablishmentFormProps = {
  data: Inputs
}

const themeOptions = [
  { label: "Verde", value: "green" },
  { label: "Azul", value: "blue" },
  { label: "Vermelho", value: "red" },
]

export function UpdateEstablishmentForm({
  data,
}: UpdateEstablishmentFormProps) {
  const { mutateAsync, isPending } = useUpdateEstablishment()
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const form = useForm<Inputs>({
    resolver: zodResolver(updateEstablishmentSchema),
    reValidateMode: "onBlur",
    defaultValues: {
      ...data,
    },
  })

  async function onSubmit(inputs: Inputs) {
    setLoading(true)

    let logoUrl = inputs.logoUrl
    let bannerUrl = inputs.bannerUrl

    if (logoUrl && !logoUrl.startsWith("http")) {
      const uploaded = await uploadImageToFirebase(
        logoUrl,
        StorageEntity.Establishment
      )
      if (!uploaded) {
        Alert.alert("Erro ao salvar imagem.")
        setLoading(false)
        return
      }
      logoUrl = uploaded
    }

    if (bannerUrl && !bannerUrl.startsWith("http")) {
      const uploaded = await uploadImageToFirebase(
        bannerUrl,
        StorageEntity.Establishment
      )
      if (!uploaded) {
        Alert.alert("Erro ao salvar imagem.")
        setLoading(false)
        return
      }
      bannerUrl = uploaded
    }

    try {
      await mutateAsync({ ...inputs, logoUrl, bannerUrl })
      router.back()
    } catch (_) {
      Alert.alert("Erro ao atualizar estabelecimento.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-1">
            <Text className="text-sm font-medium">Nome</Text>
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Input
                  placeholder="Nome do estabelecimento"
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
            <Text className="text-sm font-medium mb-1">Cor do Tema</Text>
            <Controller
              control={form.control}
              name="theme"
              render={({ field }) => (
                <View className="flex-row gap-4">
                  {themeOptions.map(option => (
                    <Pressable
                      key={option.value}
                      onPress={() => field.onChange(option.value)}
                      className="flex-row items-center gap-2"
                    >
                      <View
                        className={`w-4 h-4 rounded-full border border-gray-400 ${
                          field.value === option.value ? "bg-black" : "bg-white"
                        }`}
                      />
                      <Text className="text-sm">{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
            {form.formState.errors.theme && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.theme.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Sobre</Text>
            <Controller
              control={form.control}
              name="about"
              render={({ field }) => (
                <Input
                  placeholder="Descrição do estabelecimento"
                  multiline
                  numberOfLines={5}
                  className="h-40"
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.about && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.about.message}
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
                  placeholder="Telefone"
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
            <Text className="text-sm font-medium">Serviços Realizados</Text>
            <Controller
              control={form.control}
              name="servicesPerformed"
              render={({ field }) => (
                <Input
                  placeholder="Ex: Corte, Barba, Sobrancelha..."
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.servicesPerformed && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.servicesPerformed.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Clientes Ativos</Text>
            <Controller
              control={form.control}
              name="activeCustomers"
              render={({ field }) => (
                <Input
                  placeholder="Número de clientes ativos"
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.activeCustomers && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.activeCustomers.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Tempo de Experiência</Text>
            <Controller
              control={form.control}
              name="experienceTime"
              render={({ field }) => (
                <Input
                  placeholder="Ex: 3 anos"
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.experienceTime && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.experienceTime.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium">Link do Google Maps</Text>
            <Controller
              control={form.control}
              name="googleMapsLink"
              render={({ field }) => (
                <Input
                  placeholder="https://maps.google.com/..."
                  {...field}
                  onChangeText={field.onChange}
                />
              )}
            />
            {form.formState.errors.googleMapsLink && (
              <Text className="text-red-500 text-xs">
                {form.formState.errors.googleMapsLink.message}
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
                  placeholder="Endereço completo"
                  multiline
                  numberOfLines={3}
                  className="h-32"
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

          <ImagePickerControl
            value={form.watch("bannerUrl")}
            onChange={uri =>
              form.setValue("bannerUrl", uri, { shouldValidate: true })
            }
            label="Imagem do Banner"
          />

          <ImagePickerControl
            value={form.watch("logoUrl")}
            onChange={uri =>
              form.setValue("logoUrl", uri, { shouldValidate: true })
            }
            label="Logo do Estabelecimento"
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
