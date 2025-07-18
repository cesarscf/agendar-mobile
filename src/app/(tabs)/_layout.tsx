import { Calendar, ChartArea, Settings, Store } from "lucide-react-native"
import { Tabs } from "expo-router"

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Agenda",
          headerShown: false,
          tabBarIcon: ({ color }) => <Calendar color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color }) => <ChartArea color={color} />,
        }}
      />
      <Tabs.Screen
        name="establishment"
        options={{
          title: "Loja",
          headerShown: false,
          tabBarIcon: ({ color }) => <Store color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Configurações",
          headerShown: false,
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
    </Tabs>
  )
}
