import { ServiceCountCard } from "@/components/reports/service-count-card"

import { TotalRevenueCard } from "@/components/reports/total-revenue-card"
import { ScrollView, SafeAreaView, Text, View } from "react-native"

export default function Dashboard() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Dashboard
        </Text>
        <View style={{ gap: 16 }}>
          <TotalRevenueCard />
          <ServiceCountCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
