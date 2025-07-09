import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { User as SupabaseUser, AuthChangeEvent, Session } from "@supabase/supabase-js"

interface User extends SupabaseUser {
  id: string
  email?: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
        supabase.auth.getUser().then(({ data: { user: initialUser } }: { data: { user: User | null } }) => {
      setUser(initialUser)
      setLoading(false)
    })

    // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user as User || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
