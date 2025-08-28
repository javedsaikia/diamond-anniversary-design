"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, Shield, Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginType, setLoginType] = useState<"user" | "admin">("user")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Check if user role matches login type
      if (loginType === "admin" && data.user.role !== "admin") {
        throw new Error("Access denied. Admin credentials required.")
      }

      if (loginType === "user" && data.user.role === "admin") {
        // Allow admin to login as user, but redirect to admin dashboard
        router.push("/admin")
        return
      }

      // Redirect based on user role
      router.push(data.redirectUrl)
    } catch (error) {
      let errorMessage = "Login failed"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    console.log("Google sign-in initiated")
    // Handle Google OAuth logic here
  }

  const handleFacebookSignIn = () => {
    console.log("Facebook sign-in initiated")
    // Handle Facebook OAuth logic here
  }

  return (
    <div className="relative z-10 flex min-h-screen px-4 items-center justify-center">
      <div className="w-full max-w-md ring-1 ring-white/10 bg-white/5 rounded-2xl p-8 shadow-xl backdrop-blur-lg space-y-6">
        <div className="space-y-2 text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-transparent blur-2xl"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 ring-1 ring-white/10 flex bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-xl shadow-md items-center justify-center overflow-hidden">
                <Image
                  src="/images/balya-logo.png"
                  alt="Balya Bhavan Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight font-serif">Balya Bhavan Alumni Jorhat</h1>
          <p className="text-sm text-white/70">Sign in to continue</p>
        </div>

        <Tabs value={loginType} onValueChange={(value) => setLoginType(value as "user" | "admin")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
            <TabsTrigger
              value="user"
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Users className="w-4 h-4" />
              Alumni
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Shield className="w-4 h-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4 mt-6">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-200 mb-1">Demo Alumni Login:</p>
              <p className="text-xs text-blue-300">Email: rajesh.kumar@email.com</p>
              <p className="text-xs text-blue-300">Password: user123</p>
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4 mt-6">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-200 mb-1">Demo Admin Login:</p>
              <p className="text-xs text-red-300">Email: admin@balyabhavan.edu</p>
              <p className="text-xs text-red-300">Password: admin123</p>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg py-2.5 text-sm font-medium transition flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            onClick={handleFacebookSignIn}
            disabled={isLoading}
            className="w-full bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/30 text-white rounded-lg py-2.5 text-sm font-medium transition flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/5 text-white/60">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-white text-black hover:bg-white/90 active:bg-white/80 rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : `Sign In as ${loginType === "admin" ? "Admin" : "Alumni"}`}
          </Button>
        </form>

        <div className="space-y-3 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/5 text-white/60">New to Alumni Network?</span>
            </div>
          </div>

          <Link href="/register-user">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Alumni Account
            </Button>
          </Link>

          <Link href="/events" className="text-sm text-white/60 hover:text-white/80 transition-colors block">
            Continue as Guest →
          </Link>
        </div>
      </div>
    </div>
  )
}
