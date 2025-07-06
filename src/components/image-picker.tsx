import { View, Image, TouchableOpacity, Text } from "react-native"
import * as ImagePicker from "expo-image-picker"

interface ImagePickerControlProps {
  value?: string
  onChange: (uri: string) => void
  disabled?: boolean
  label?: string
}

export function ImagePickerControl({
  value,
  onChange,
  disabled = false,
  label = "Imagem",
}: ImagePickerControlProps) {
  async function pickImage() {
    if (disabled) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      onChange(result.assets[0].uri)
    }
  }

  function handleRemove() {
    if (disabled) return
    onChange("")
  }

  return (
    <View>
      {label && <Text className="mb-2 font-semibold text-base">{label}</Text>}

      {value ? (
        <View className="relative w-full h-48 rounded-lg overflow-hidden">
          <Image
            source={{ uri: value }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
          />

          <View className="absolute bottom-3 right-3 flex-row space-x-3">
            <TouchableOpacity
              onPress={pickImage}
              disabled={disabled}
              className="bg-black bg-opacity-60 px-4 py-2 rounded"
            >
              <Text className="text-white font-semibold">Trocar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRemove}
              disabled={disabled}
              className="bg-red-600 bg-opacity-80 px-4 py-2 rounded"
            >
              <Text className="text-white font-semibold">Remover</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickImage}
          disabled={disabled}
          className="border border-gray-300 w-full h-48 rounded-lg justify-center items-center"
        >
          <Text className="text-gray-600 font-semibold">Selecionar Imagem</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
