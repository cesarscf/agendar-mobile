import { updatePackageSchema } from "@/lib/validations/packages"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Alert, ScrollView, Text, View } from "react-native"
import { Input } from "../input"
import { AppButton } from "../button"
import { ImagePickerControl } from "../image-picker"
import { uploadImageToFirebase, StorageEntity } from "@/lib/upload-image"
import { useUpdatePackage } from "@/hooks/data/packages/use-update-package"
import { useRouter } from "expo-router"
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
      price: data.price?.replace(".", ","),
    },
  })

  const { mutateAsync, isPending } = useUpdatePackage()
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

    await mutateAsync({
      ...values,
      image: imageUrl,
      price: values.price?.replace(",", "."),
    })

    setLoading(false)
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
        <Text>Comissão</Text>
        <Controller
          control={form.control}
          name="commission"
          render={({ field }) => (
            <Input
              placeholder="Comissão"
              keyboardType="numeric"
              {...field}
              onChangeText={field.onChange}
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
              placeholder="Preço"
              keyboardType="numeric"
              {...field}
              onChangeText={field.onChange}
            />
          )}
        />
      </View>

      <ImagePickerControl
        value={currentImage}
        onChange={uri => form.setValue("image", uri, { shouldValidate: true })}
        label="Imagem do pacote"
      />

      <AppButton
        title="Salvar Alterações"
        onPress={form.handleSubmit(onSubmit)}
        loading={loading || isPending}
      />
    </ScrollView>
  )
}
