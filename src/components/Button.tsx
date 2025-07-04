import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  Text,
} from "react-native"
import { cn } from "../utils/cn"

type ButtonProps = {
  title: string
  onPress?: () => void
  theme?: "primary" | "secondary" | "tertiary"
  disabled?: boolean
  loading?: boolean
} & PressableProps

export function Button({
  title,
  onPress,
  theme = "primary",
  disabled,
  loading,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-center rounded-md px-5 py-3 mb-4 border",
        theme === "primary" && "bg-[#007AFF] border-[#007AFF]",
        theme === "secondary" && "bg-white border-gray-300",
        theme === "tertiary" && "bg-transparent border-transparent",
        disabled && "opacity-50"
      )}
      disabled={disabled}
      {...rest}
    >
      <Text
        className={cn(
          "font-semibold text-lg tracking-wider",
          theme === "secondary" && "text-black",
          theme === "primary" && "text-white",
          theme === "tertiary" && "text-gray-800"
        )}
      >
        {loading ? <ActivityIndicator className="size-6" /> : title}
      </Text>
    </Pressable>
  )
}
