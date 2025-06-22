"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showResendOption, setShowResendOption] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleResendConfirmation = async () => {
    if (!usernameOrEmail || !usernameOrEmail.includes('@')) {
      setErrorMessage("Please enter a valid email address")
      return
    }

    setIsResendingEmail(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: usernameOrEmail,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Confirmation Email Sent",
        description: "Please check your inbox and confirm your email address",
      })
    } catch (error) {
      console.error("Error resending confirmation:", error)
      toast({
        title: "Failed to Resend Email",
        description: "There was an error sending the confirmation email",
        variant: "destructive",
      })
    } finally {
      setIsResendingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setShowResendOption(false)
    
    console.log("Login attempt with:", usernameOrEmail)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usernameOrEmail,
        password,
      })

      if (error) {
        console.error("Auth error:", error)
        if (error.message.includes("Email not confirmed")) {
          setErrorMessage("Your email has not been confirmed. Please check your inbox or resend the confirmation email.")
          setShowResendOption(true)
        } else {
          setErrorMessage("Invalid username/email or password")
        }
        setIsLoading(false)
        return
      }

      if (!data?.user) {
        setErrorMessage("Login failed - authentication error")
        setIsLoading(false)
        return
      }

      // Get user profile from database
      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id) // Use user ID for more reliable lookup
        .single();
      
      if (userProfile) {
        // Store user data in local storage
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userRole", userProfile.role || 'user')
        localStorage.setItem("userId", userProfile.id)
        localStorage.setItem("userEmail", userProfile.email)
        localStorage.setItem("userName", `${userProfile.first_name || ''} ${userProfile.last_name || ''}`)
        localStorage.setItem("username", userProfile.username || '')

        // Redirect based on user role
        if (userProfile.role === 'admin' || userProfile.role === 'skofficial') {
          router.push('/dashboard')
        } else {
          router.push('/programs')
        }
        return
      } else {
        // Fall back to just using auth data if profile is not found
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userEmail", data.user.email || usernameOrEmail)
      }

      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      })

      // Redirect to user-view page after login
      router.push("/user-view")

    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 relative mb-2">
              <img 
                src="/sk-logo.png" 
                alt="SK Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.src = 'https://placeholder.pics/svg/300/DEDEDE/555555/SK%20LOGO';
                }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {errorMessage}
                {showResendOption && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={isResendingEmail}
                      className="text-xs"
                    >
                      {isResendingEmail ? "Sending..." : "Resend confirmation email"}
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Email</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter your email"
                value={usernameOrEmail}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value)
                  setErrorMessage("")
                  setShowResendOption(false)
                }}
                required
              />
              <p className="text-xs text-gray-500">
                Please use the email you registered with
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-emerald-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrorMessage("")
                }}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-600 hover:underline">
              Sign up
            </Link>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Use the email address you registered with.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
