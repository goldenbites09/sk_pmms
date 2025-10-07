"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get the redirect URL - dynamically use current origin
      // This will work for both localhost and production (netlify)
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/reset-password`
        : 'http://localhost:3000/reset-password'

      console.log('Sending password reset email to:', email)
      console.log('Redirect URL:', redirectUrl)

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      console.log('Reset password response:', { data, error })
      console.log('Full response data:', JSON.stringify(data, null, 2))

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          status: error.status,
          name: error.name
        })
        throw error
      }

      console.log('✅ Password reset email request successful')
      console.log('📧 Email should be sent to:', email)
      console.log('🔗 Reset link will redirect to:', redirectUrl)

      // Even if there's no error, Supabase will send the email
      // Note: Supabase won't tell you if the email doesn't exist (for security)
      setEmailSent(true)
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists with this email, you will receive a password reset link",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)
      toast({
        title: "Failed to Send Reset Email",
        description: error?.message || "Please check your email address and try again",
        variant: "destructive",
      })
    } finally {
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
                  e.currentTarget.src = 'https://placeholder.pics/svg/300/DEDEDE/555555/SK%20LOGO';
                }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            {emailSent 
              ? "Check your email for the password reset link" 
              : "Enter your email address and we'll send you a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                <p className="text-sm text-emerald-800 text-center">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-emerald-700 text-center mt-2">
                  Please check your inbox and spam folder
                </p>
              </div>
              <Button 
                onClick={() => setEmailSent(false)} 
                variant="outline" 
                className="w-full"
              >
                Send Another Email
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
          <div className="text-center text-sm text-gray-500">
            <Link href="/" className="text-emerald-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
