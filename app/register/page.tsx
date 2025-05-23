"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { createUser, createParticipantFromUser } from "@/lib/db"

// Default approval code for SK officials (in a real app, this would be more secure)
const SK_APPROVAL_CODE = "SKADMIN2023"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    role: "viewer", // Default role
    approval_code: "", // For SK officials
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrorMessage("") // Clear error when user makes changes
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
    setErrorMessage("") // Clear error when user makes changes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    // Validate form
    if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setErrorMessage("All fields are required")
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords don't match")
      return
    }

    // Validate approval code for SK officials
    if (formData.role === "skofficial") {
      if (!formData.approval_code) {
        setErrorMessage("Approval code is required for SK Officials")
        return
      }
      
      if (formData.approval_code !== SK_APPROVAL_CODE) {
        setErrorMessage("Invalid approval code for SK Officials")
        return
      }
    }

    setIsLoading(true)

    try {
      // All users are approved by default now
      const isApproved = true

      // Create user with our enhanced function
      const user = await createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_approved: isApproved,
        approval_code: formData.role === "skofficial" ? formData.approval_code : null
      })

      // Create participant record linked to the user
      await createParticipantFromUser(user.id)

      // Show success message instead of redirecting
      setRegistrationSuccess(true)
      toast({
        title: "Registration Successful",
        description: "Please check your email to confirm your account before logging in."
      })
    } catch (error) {
      console.error("Registration error:", error)
      
      // Set appropriate error message
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          setErrorMessage("A user with this email or username already exists")
        } else if (error.message.includes("password")) {
          setErrorMessage("Password is too weak. Use at least 6 characters with a mix of letters and numbers.")
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage("Registration failed. Please try again.")
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage || "There was an error creating your account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Registration Successful</CardTitle>
            <CardDescription className="text-center">Check your email to confirm your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
              <p className="mb-2 font-medium">Thanks for signing up!</p>
              <p>We've sent a confirmation email to <strong>{formData.email}</strong>.</p>
              <p className="mt-2">Please check your inbox and click the confirmation link before logging in.</p>
            </div>
            <Button 
              className="w-full" 
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-500">
            <p>If you don't see the email, check your spam folder or request a new confirmation on the login page.</p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {errorMessage}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
              <Input
                  id="first_name"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                onChange={handleChange}
                required
              />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500">
                You'll need to confirm this email address
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>User Role</Label>
              <RadioGroup value={formData.role} onValueChange={handleRoleChange} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="viewer" id="viewer" />
                  <Label htmlFor="viewer">Viewer (General User)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skofficial" id="skofficial" />
                  <Label htmlFor="skofficial">SK Official</Label>
                </div>
              </RadioGroup>
              {formData.role === "skofficial" && (
                <div className="mt-3">
                  <Label htmlFor="approval_code">Approval Code</Label>
                  <Input
                    id="approval_code"
                    name="approval_code"
                    type="password"
                    placeholder="Enter SK Official approval code"
                    value={formData.approval_code}
                    onChange={handleChange}
                    className="mt-1"
                  />
                <p className="text-xs text-gray-500 mt-1">
                    SK Officials need an approval code to register.
                </p>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm w-full">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
