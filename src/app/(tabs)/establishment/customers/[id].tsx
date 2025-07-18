import { useLocalSearchParams } from "expo-router"
import { View, Text } from "react-native"

import { EditCustomerForm } from "@/components/forms/edit-customer-form"
import { useCustomer } from "@/hooks/data/customers/use-customer"

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams()

  if (!id) return null

  const { data: customer } = useCustomer(id as string)

  if (!customer) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Carregando...</Text>
      </View>
    )
  }

  return <EditCustomerForm customer={customer} />
}
