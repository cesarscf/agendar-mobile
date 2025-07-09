import { useLocalSearchParams } from "expo-router"
import { View, Text } from "react-native"

import { useEmployee } from "@/hooks/data/employees"
import { EditEmployeeForm } from "@/components/forms/update-employee-form"

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams()

  if (!id) return null

  const { data: employee } = useEmployee(id as string)

  if (!employee) return null

  if (!employee) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Carregando...</Text>
      </View>
    )
  }

  return <EditEmployeeForm employee={employee} />
}
