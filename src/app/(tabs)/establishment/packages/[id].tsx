import { useLocalSearchParams } from "expo-router"

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams()

  if (!id) return null

  //   const { data: employee } = useEmployee(id as string)

  //   if (!employee) return null

  //   if (!employee) {
  //     return (
  //       <View className="flex-1 items-center justify-center bg-white">
  //         <Text>Carregando...</Text>
  //       </View>
  //     )
  //   }

  return null
}
