import { DrawerItem } from "@react-navigation/drawer"
import { router } from "expo-router"
import { Drawer } from "expo-router/drawer"
import { GestureHandlerRootView } from "react-native-gesture-handler"

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={() => {
        return (
          <GestureHandlerRootView className="flex-1 pt-10">
            <DrawerItem
              label="Home"
              onPress={() => {
                router.push("/(app)/(tabs)/home")
              }}
            />
            <DrawerItem
              label="Clientes"
              onPress={() => {
                router.push("/(app)/(tabs)/services")
              }}
            />
            <DrawerItem
              label="Configurações"
              onPress={() => {
                router.push("/(app)/settings")
              }}
            />
          </GestureHandlerRootView>
        )
      }}
    />
  )
}
