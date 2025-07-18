export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatDate(value: string) {
  const onlyDigits = value.replace(/\D/g, "")
  if (onlyDigits.length <= 2) return onlyDigits
  if (onlyDigits.length <= 4)
    return `${onlyDigits.slice(0, 2)}/${onlyDigits.slice(2)}`
  return (
    onlyDigits.slice(0, 2) +
    "/" +
    onlyDigits.slice(2, 4) +
    "/" +
    onlyDigits.slice(4, 8)
  )
}

export function parseDateFromString(value: string): Date | undefined {
  const parts = value.split("/")
  if (parts.length !== 3) return undefined
  const day = Number(parts[0])
  const month = Number(parts[1]) - 1
  const year = Number(parts[2])
  const date = new Date(year, month, day)
  if (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  ) {
    return date
  }
  return undefined
}

export function formatDateToString(date?: Date | null): string {
  if (!date) return ""
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatPhoneNumber(value: string) {
  const onlyDigits = value.replace(/\D/g, "")

  if (onlyDigits.length === 0) return ""

  if (onlyDigits.length <= 2) {
    return `(${onlyDigits}`
  }

  if (onlyDigits.length <= 7) {
    return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(2)}`
  }

  if (onlyDigits.length <= 11) {
    return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(2, 7)}-${onlyDigits.slice(7)}`
  }

  return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(2, 7)}-${onlyDigits.slice(7, 11)}`
}
