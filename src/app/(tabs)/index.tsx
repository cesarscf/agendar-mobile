import { Button } from "@/components/button"
import { useSession } from "@/providers/auth-context"
import { useAppointments } from "@/hooks/data/appointment/use-appointments"

import {
  formatISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
} from "react-native"
import { useState } from "react"

export default function Appointments() {
  const { signOut } = useSession()
  const [filter, setFilter] = useState<"today" | "week">("today")

  const now = new Date()
  const dateRange =
    filter === "today"
      ? {
          startDate: formatISO(startOfDay(now)),
          endDate: formatISO(endOfDay(now)),
        }
      : {
          startDate: formatISO(startOfWeek(now, { weekStartsOn: 1 })),
          endDate: formatISO(endOfWeek(now, { weekStartsOn: 1 })),
        }

  const { data, isLoading, error } = useAppointments({
    ...dateRange,
    status: "scheduled",
  })

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <View className="flex-row justify-around mb-4">
          <TouchableOpacity onPress={() => setFilter("today")}>
            <Text
              className={filter === "today" ? "font-bold text-blue-600" : ""}
            >
              Hoje
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter("week")}>
            <Text
              className={filter === "week" ? "font-bold text-blue-600" : ""}
            >
              Semana
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text className="text-red-500">{error.message}</Text>
        ) : (
          <FlatList
            data={data?.appointments || []}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text>Nenhum agendamento encontrado.</Text>}
            renderItem={({ item }) => (
              <View className="mb-4 p-3 border rounded-lg">
                <Text className="font-semibold">{item.customer.name}</Text>
                <Text>{item.service.name}</Text>
                <Text>
                  {item.startTime.toString()} - {item.endTime}
                </Text>
              </View>
            )}
            scrollEnabled={false} // Scroll será controlado pelo ScrollView
          />
        )}

        <View className="mt-6">
          <Button onPress={signOut} title="Sair" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
