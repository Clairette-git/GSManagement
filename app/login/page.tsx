"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { CheckCircle, Eye, EyeOff, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get("tab")

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(tabParam === "signup" ? "signup" : "signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // For signup form
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"admin" | "storekeeper" | "technician" | "filler">("storekeeper")
  const [isUsernameValid, setIsUsernameValid] = useState(false)
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false)

  // Set active tab based on URL parameter
  useEffect(() => {
    if (searchParams && tabParam === "signup") {
      setActiveTab("signup")
    }
  }, [searchParams, tabParam])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsEmailValid(re.test(email))
    return re.test(email)
  }

  const validatePassword = (password: string) => {
    setIsPasswordValid(password.length >= 8)
    return password.length >= 8
  }

  const validateUsername = (username: string) => {
    setIsUsernameValid(username.length >= 3)
    return username.length >= 3
  }

  const validateConfirmPassword = (confirmPassword: string) => {
    setIsConfirmPasswordValid(confirmPassword === password)
    return confirmPassword === password
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoading(true)

    if (!validateEmail(email) || !validatePassword(password)) {
      setIsLoading(false)
      return
    }

    try {
      console.log("Attempting login...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("Login response:", data)

      if (response.ok && data.token) {
        // Store token in localStorage as backup
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        console.log("Login successful, redirecting...")

        // Force a hard navigation
        window.location.href = "/dashboard"
      } else {
        setLoginError(data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName || !lastName || !validateEmail(email) || !validatePassword(password)) {
      setLoginError("Please fill in all required fields correctly")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
          email,
          password,
          role,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLoginError(null)
        setActiveTab("signin")
        alert("Account created successfully! Please sign in.")

        // Clear form
        setFirstName("")
        setLastName("")
        setEmail("")
        setPassword("")
        setRole("storekeeper")
      } else {
        setLoginError(data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setLoginError("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Dark background with gas cylinders */}
      <div className="hidden md:flex md:w-1/2 bg-gray-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-90 z-0"></div>

        {/* Gas cylinder images with overlay */}
        <div className="absolute inset-0 opacity-60 z-0">
          <Image src="/Cylinders.jpg" alt="Gas Cylinders" fill priority className="object-cover" />
        </div>

        <div className="relative z-10">
          <Image src="/DPMMK.png" alt="Kalisimbi Ltd Logo" width={200} height={200} priority className="mb-8" />
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Gas Supply &Inventory Management System <br />
            <span className="relative">Supply</span>
          </h2>
        </div>

        <div className="relative z-10 text-sm text-white">© 2025 Kalisimbi Gas. All rights reserved.</div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center md:text-left mb-8">
            <div className="md:hidden mb-6">
              <Image src="/DPMMK.png" alt="Kalisimbi Ltd Logo" width={160} height={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === "signin" ? "Welcome!" : "Create your account"}
            </h1>
            <p className="text-gray-500 mt-2">
              {activeTab === "signin"
                ? "Sign in to access your GSIM System"
                : "Join us to manage your gas supply efficiently"}
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{loginError}</div>
          )}

          {activeTab === "signin" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      validateEmail(e.target.value)
                    }}
                  />
                  {isEmailValid && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      validatePassword(e.target.value)
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                </div>
                <div className="text-sm">
                  
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="font-medium text-teal-500 hover:text-teal-700"
                >
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="signup-email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      validateEmail(e.target.value)
                    }}
                    required
                  />
                  {isEmailValid && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="signup-password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      validatePassword(e.target.value)
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">Password must be at least 8 characters</p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "storekeeper" | "technician" | "filler")}
                  required
                >
                  <option value="storekeeper">Storekeeper</option>
                  <option value="technician">Technician</option>
                  <option value="filler">Filler</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
