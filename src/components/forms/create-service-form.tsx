import { createServiceSchema } from "@/lib/validations/service"
import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { Text, View } from "react-native"
import type { z } from "zod"
import { Input } from "../input"
import { Button } from "../button"
import { createService } from "@/http/create-service"

type Inputs = z.infer<typeof createServiceSchema>

export function CreateServiceForm() {
  const [loading, setLoading] = React.useState(false)

  const form = useForm<Inputs>({
    resolver: zodResolver(createServiceSchema),
    reValidateMode: "onBlur",
    defaultValues: {
      name: "",
      price: "",
      active: true,
      durationInMinutes: "",
      description: "",
      image: "",
    },
  })

  async function onSubmit(inputs: Inputs) {
    setLoading(true)

    const { data, error } = await createService(inputs)

    if (data) {
      // sucesso (ex: redirecionar ou mostrar toast)
    }

    if (error) {
      // mostrar erro
    }

    setLoading(false)
  }

  return (
    <View className="flex-1 justify-between">
      <View className="p-4 gap-3">
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

        <Text className="text-sm font-medium">Preço</Text>
        <Controller
          control={form.control}
          name="price"
          render={({ field }) => (
            <Input
              placeholder="Preço"
              keyboardType="numeric"
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

        <Text className="text-sm font-medium">Duração (min)</Text>
        <Controller
          control={form.control}
          name="durationInMinutes"
          render={({ field }) => (
            <Input
              placeholder="Duração em minutos"
              keyboardType="numeric"
              {...field}
              onBlur={field.onBlur}
              value={field.value}
              onChangeText={value => field.onChange(value)}
            />
          )}
        />
        {form.formState.errors.durationInMinutes && (
          <Text className="text-red-500 text-xs">
            {form.formState.errors.durationInMinutes.message}
          </Text>
        )}

        <Text className="text-sm font-medium">Descrição</Text>
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <Input
              placeholder="Descrição do serviço"
              multiline
              numberOfLines={5}
              className="min-h-40"
              {...field}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              value={field.value}
            />
          )}
        />
        {form.formState.errors.description && (
          <Text className="text-red-500 text-xs">
            {form.formState.errors.description.message}
          </Text>
        )}

        <Text className="text-sm font-medium">URL da Imagem</Text>
        <Controller
          control={form.control}
          name="image"
          render={({ field }) => (
            <Input
              placeholder="Link da imagem"
              {...field}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              value={field.value}
            />
          )}
        />
        {form.formState.errors.image && (
          <Text className="text-red-500 text-xs">
            {form.formState.errors.image.message}
          </Text>
        )}
      </View>

      <View className="p-4">
        <Button
          disabled={loading}
          loading={loading}
          title="Cadastrar Serviço"
          theme="primary"
          onPress={form.handleSubmit(onSubmit)}
        />
      </View>
    </View>
  )
}
