import { useStorageState } from "@/hooks/use-storage-state"
import { getPartner, type Partner } from "@/http/get-partner"
import { SubscriptionStatusEnum } from "@/lib/enums"
import { router } from "expo-router"
import React from "react"

const AuthContext = React.createContext<{
  signIn: (token: string) => void
  signOut: () => void
  session: string | null
  isLoading: boolean
  partner: Partner | null
}>({
  signIn: async () => ({ data: null, error: "Context not ready" }),
  signOut: () => null,
  session: null,
  isLoading: false,
  partner: null,
})

export function useSession() {
  const value = React.useContext(AuthContext)
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />")
  }

  return value
}

export function SessionProvider({ children }: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("token")
  const [[_, _establishmentId], setEstablishmentId] =
    useStorageState("establishment-id")
  const [partner, setPartner] = React.useState<Partner | null>(null)

  function signOut() {
    setSession(null)
    setPartner(null)
  }

  function signIn(token: string) {
    setSession(token)
  }

  async function loadPartner() {
    const { data, error } = await getPartner()

    if (data) {
      setPartner(data.partner)
      setEstablishmentId(data.partner.establishments[0].id)
    }

    const currentSubscription = data?.partner.subscriptions[0]

    const validSubscriptions =
      !!currentSubscription &&
      [SubscriptionStatusEnum.active, SubscriptionStatusEnum.trialing].includes(
        currentSubscription.status as SubscriptionStatusEnum
      )

    if (!validSubscriptions) {
      router.replace("/plans")
    }

    if (error) {
      signOut()
    }
  }

  React.useEffect(() => {
    if (session && !partner) loadPartner()
  }, [session, partner])

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
        partner,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
