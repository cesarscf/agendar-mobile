import { TextInput, type TextInputProps } from "react-native"

export function Input(props: TextInputProps) {
  return (
    <TextInput
      className="bg-[#d0d2d8] px-4 h-12 w-full rounded-lg border border-[#C3C5CB]"
      placeholderTextColor="#74798B"
      {...props}
    />
  )
}
