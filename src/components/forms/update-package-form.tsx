import { updatePackageSchema } from "@/lib/validations/packages"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Alert, ScrollView, Text, View } from "react-native"
import { Input } from "../input"
import { AppButton } from "../button"
import { IconButton } from "../icon-button"
import { ImagePickerControl } from "../image-picker"
import { uploadImageToFirebase, StorageEntity } from "@/lib/upload-image"
import { useUpdatePackage } from "@/hooks/data/packages/use-update-package"
import { useDeletePackage } from "@/hooks/data/packages/use-delete-package"
import { useRouter } from "expo-router"
import {
  formatCentsToReal,
  formatCurrencyInput,
  formatPercentageInput,
} from "@/utils/currency"
import type { z } from "zod"
import React from "react"

type Inputs = z.infer<typeof updatePackageSchema>

type Props = {
  data: Inputs
}

export function EditPackageForm({ data }: Props) {
  const form = useForm<Inputs>({
    resolver: zodResolver(updatePackageSchema),
    defaultValues: {
      ...data,
      price: data.price ? formatCentsToReal(Number(data.price)) : undefined,
      commission: data.commission ? String(data.commission) : undefined,
    },
  })

  const { mutateAsync, isPending } = useUpdatePackage()
  const { mutateAsync: deleteAsync, isPending: isDeleting } = useDeletePackage()
  const [loading, setLoading] = React.useState(false)
  const _router = useRouter()
  const currentImage = form.watch("image")

  async function onSubmit(values: Inputs) {
    setLoading(true)
    let imageUrl = values.image

    if (imageUrl && !imageUrl.startsWith("http")) {
      const uploaded = await uploadImageToFirebase(
        imageUrl,
        StorageEntity.Package
      )
      if (!uploaded) {
        Alert.alert("Erro ao salvar imagem.")
        setLoading(false)
        return
      }
      imageUrl = uploaded
    }

    try {
      await mutateAsync({
        ...values,
        image: imageUrl,
      })

      Alert.alert("Sucesso", "Pacote atualizado com sucesso!")
      _router.back()
    } catch (_error) {
      Alert.alert("Erro", "Não foi possível atualizar o pacote.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este pacote?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAsync(data.id)
              _router.back()
            } catch {
              Alert.alert("Erro ao excluir pacote.")
            }
          },
        },
      ]
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View>
        <Text>Nome</Text>
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <Input
              placeholder="Nome do pacote"
              {...field}
              onChangeText={field.onChange}
            />
          )}
        />
      </View>

      <View>
        <Text>Comissão (%)</Text>
        <Controller
          control={form.control}
          name="commission"
          render={({ field }) => (
            <Input
              placeholder="Ex: 50, 50.5 ou 50.55"
              keyboardType="decimal-pad"
              {...field}
              onChangeText={value => {
                const formatted = formatPercentageInput(value)
                field.onChange(formatted)
              }}
            />
          )}
        />
      </View>

      <View>
        <Text>Preço</Text>
        <Controller
          control={form.control}
          name="price"
          render={({ field }) => (
            <Input
              placeholder="Ex: 20,99 ou 1.000,00"
              keyboardType="numeric"
              {...field}
              onChangeText={value => {
                const formatted = formatCurrencyInput(value)
                field.onChange(formatted)
              }}
            />
          )}
        />
      </View>

      <ImagePickerControl
        value={currentImage}
        onChange={uri => form.setValue("image", uri, { shouldValidate: true })}
        label="Imagem do pacote"
      />

      <View className="flex-row gap-2">
        <View className="flex-1">
          <AppButton
            title="Salvar"
            onPress={form.handleSubmit(onSubmit)}
            loading={loading || isPending}
            disabled={loading || isPending || isDeleting}
            className="py-2"
          />
        </View>
        <IconButton
          disabled={loading || isPending || isDeleting}
          loading={isDeleting}
          onPress={handleDelete}
          variant="danger"
          className="self-start"
        />
      </View>
    </ScrollView>
  )
}
