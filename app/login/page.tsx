"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const router = useRouter()

  // For signup form
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"admin" | "storekeeper" | "technician">("storekeeper")
  const [isUsernameValid, setIsUsernameValid] = useState(false)
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false)

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

    if (!validateEmail(email) || !validatePassword(password)) {
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
        credentials: "include", // Important for cookies
      })

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Login failed with status:", response.status, errorText)
        setLoginError("Login failed: " + (response.statusText || "Unknown error"))
        return
      }

      // Only try to parse JSON if we have a successful response
      let data
      try {
        const text = await response.text()
        console.log("Response text:", text)
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError)
        setLoginError("Error processing server response")
        return
      }

      console.log("Login response:", data)

      if (data.token) {
        // Store the token in localStorage as a backup
        localStorage.setItem("auth_token", data.token)

        // The cookie should be set by the server, but we'll set it client-side as well just in case
        document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`

        console.log("Login successful, redirecting...")

        // Use window.location for a hard redirect
        window.location.href = "/dashboard"
      } else {
        setLoginError("Authentication token not received")
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("An error occurred during login")
    }
  }
  

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !validateUsername(username) ||
      !validateEmail(email) ||
      !validatePassword(password) ||
      !validateConfirmPassword(confirmPassword)
    ) {
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, role }),
      })

      if (response.ok) {
        alert("Account created successfully! Please sign in.")
        setActiveTab("signin")
      } else {
        const data = await response.json()
        alert(data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      alert("An error occurred during registration")
    }
  }

  return (
    <div className="flex min-h-screen bg-[#dee1e7]">
      <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <Image src="./DPMMK.png" alt="Kalisimbi Ltd Logo" width={240} height={60} className="mb-8" />
 
            <h1 className="text-2xl font-bold text-[#000000]">Welcome Back</h1>
            <p className="text-[#adadad]">Please enter Your details</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-[#f0f0f0] rounded-md p-1">
            <button
              className={`w-1/2 py-2 text-center rounded-md ${activeTab === "signin" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setActiveTab("signin")}
            >
              Sign In
            </button>
            <button
              className={`w-1/2 py-2 text-center rounded-md ${activeTab === "signup" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              Signup
            </button>
          </div>

          {activeTab === "signin" ? (
            <form onSubmit={handleLogin}>
              <div className="mb-4 relative">
                <label htmlFor="email" className="block text-sm mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2 border rounded-md"
                    placeholder="username@kalisimbi.org"
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

              <div className="mb-6 relative">
                <label htmlFor="password" className="block text-sm mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    className="w-full p-2 border rounded-md"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      validatePassword(e.target.value)
                    }}
                  />
                  {isPasswordValid && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0365ff] text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="mb-4 relative">
                <label htmlFor="username" className="block text-sm mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    className="w-full p-2 border rounded-md"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      validateUsername(e.target.value)
                    }}
                  />
                  {isUsernameValid && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                </div>
              </div>

              <div className="mb-4 relative">
                <label htmlFor="signup-email" className="block text-sm mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="signup-email"
                    className="w-full p-2 border rounded-md"
                    placeholder="username@kalisimbi.org"
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

              <div className="mb-4 relative">
                <label htmlFor="signup-password" className="block text-sm mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="signup-password"
                    className="w-full p-2 border rounded-md"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      validatePassword(e.target.value)
                    }}
                  />
                  {isPasswordValid && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                </div>
              </div>

              <div className="mb-4 relative">
                <label htmlFor="confirm-password" className="block text-sm mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirm-password"
                    className="w-full p-2 border rounded-md"
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      validateConfirmPassword(e.target.value)
                    }}
                  />
                  {isConfirmPasswordValid && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="role" className="block text-sm mb-1">
                  Role
                </label>
                <select
                  id="role"
                  className="w-full p-2 border rounded-md"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "storekeeper" | "technician")}
                >
                  <option value="storekeeper">Storekeeper</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0365ff] text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Account
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-[#adadad] text-sm">Or Continue With</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <div className="flex justify-center gap-4">
              <button className="p-2 border rounded-full">
                <Image src="/google-icon.png" alt="Google" width={24} height={24} />
              </button>
              <button className="p-2 border rounded-full">
                <Image src="/facebook-icon.png" alt="Facebook" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:block md:w-1/2 bg-white p-6">
          <div className="h-full flex items-center justify-center">
            <Image
              src="/gas-cylinders.png"
              alt="Medical Gas Cylinders"
              width={500}
              height={600}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}


// "use client"

// import type React from "react"

// import { useState } from "react"
// import Image from "next/image"
// import { CheckCircle } from "lucide-react"
// import { useRouter } from "next/navigation"

// export default function LoginPage() {
//   const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isEmailValid, setIsEmailValid] = useState(false)
//   const [isPasswordValid, setIsPasswordValid] = useState(false)
//   const [loginError, setLoginError] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter()

//   // For signup form
//   const [username, setUsername] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [role, setRole] = useState<"admin" | "storekeeper" | "technician">("storekeeper")
//   const [isUsernameValid, setIsUsernameValid] = useState(false)
//   const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false)

//   const validateEmail = (email: string) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     setIsEmailValid(re.test(email))
//     return re.test(email)
//   }

//   const validatePassword = (password: string) => {
//     setIsPasswordValid(password.length >= 8)
//     return password.length >= 8
//   }

//   const validateUsername = (username: string) => {
//     setIsUsernameValid(username.length >= 3)
//     return username.length >= 3
//   }

//   const validateConfirmPassword = (confirmPassword: string) => {
//     setIsConfirmPasswordValid(confirmPassword === password)
//     return confirmPassword === password
//   }

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoginError(null)
//     setIsLoading(true)

//     if (!validateEmail(email) || !validatePassword(password)) {
//       setIsLoading(false)
//       return
//     }

//     try {
//       console.log("Attempting login...")
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//         credentials: "include", // Important for cookies
//       })

//       // Check if the response is ok before trying to parse JSON
//       if (!response.ok) {
//         const errorText = await response.text()
//         console.error("Login failed with status:", response.status, errorText)
//         setLoginError("Login failed: " + (response.statusText || "Unknown error"))
//         setIsLoading(false)
//         return
//       }

//       // Only try to parse JSON if we have a successful response
//       let data
//       try {
//         const text = await response.text()
//         console.log("Response text:", text)
//         data = text ? JSON.parse(text) : {}
//       } catch (parseError) {
//         console.error("Error parsing JSON:", parseError)
//         setLoginError("Error processing server response")
//         setIsLoading(false)
//         return
//       }

//       console.log("Login response:", data)

//       if (data.token) {
//         // Store the token in localStorage as a backup
//         localStorage.setItem("auth_token", data.token)

//         console.log("Login successful, redirecting...")

//         // Use window.location for a hard redirect
//         window.location.href = "/dashboard"
//       } else {
//         setLoginError("Authentication token not received")
//         setIsLoading(false)
//       }
//     } catch (error) {
//       console.error("Login error:", error)
//       setLoginError("An error occurred during login")
//       setIsLoading(false)
//     }
//   }

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (
//       !validateUsername(username) ||
//       !validateEmail(email) ||
//       !validatePassword(password) ||
//       !validateConfirmPassword(confirmPassword)
//     ) {
//       return
//     }

//     try {
//       const response = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, email, password, role }),
//       })

//       if (response.ok) {
//         alert("Account created successfully! Please sign in.")
//         setActiveTab("signin")
//       } else {
//         const data = await response.json()
//         alert(data.message || "Registration failed")
//       }
//     } catch (error) {
//       console.error("Signup error:", error)
//       alert("An error occurred during registration")
//     }
//   }

//   return (
//     <div className="flex min-h-screen bg-[#dee1e7]">
//       <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
//         {/* Left side - Form */}
//         <div className="w-full md:w-1/2 p-8 md:p-12">
//           <div className="mb-8">
//             <Image src="/DPMMK.png" alt="Kalisimbi Ltd Logo" width={240} height={60} className="mb-8" />

//             <h1 className="text-2xl font-bold text-[#000000]">Welcome Back</h1>
//             <p className="text-[#adadad]">Please enter Your details</p>
//           </div>

//           {/* Tabs */}
//           <div className="flex mb-6 bg-[#f0f0f0] rounded-md p-1">
//             <button
//               className={`w-1/2 py-2 text-center rounded-md ${activeTab === "signin" ? "bg-white shadow-sm" : ""}`}
//               onClick={() => setActiveTab("signin")}
//             >
//               Sign In
//             </button>
//             <button
//               className={`w-1/2 py-2 text-center rounded-md ${activeTab === "signup" ? "bg-white shadow-sm" : ""}`}
//               onClick={() => setActiveTab("signup")}
//             >
//               Signup
//             </button>
//           </div>

//           {loginError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{loginError}</div>}

//           {activeTab === "signin" ? (
//             <form onSubmit={handleLogin}>
//               <div className="mb-4 relative">
//                 <label htmlFor="email" className="block text-sm mb-1">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="email"
//                     id="email"
//                     className="w-full p-2 border rounded-md"
//                     placeholder="username@kalisimbi.org"
//                     value={email}
//                     onChange={(e) => {
//                       setEmail(e.target.value)
//                       validateEmail(e.target.value)
//                     }}
//                   />
//                   {isEmailValid && (
//                     <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
//                   )}
//                 </div>
//               </div>

//               <div className="mb-6 relative">
//                 <label htmlFor="password" className="block text-sm mb-1">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="password"
//                     id="password"
//                     className="w-full p-2 border rounded-md"
//                     placeholder="••••••••••"
//                     value={password}
//                     onChange={(e) => {
//                       setPassword(e.target.value)
//                       validatePassword(e.target.value)
//                     }}
//                   />
//                   {isPasswordValid && (
//                     <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
//                   )}
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-[#0365ff] text-white py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
//               >
//                 {isLoading ? "Logging in..." : "Login"}
//               </button>
//             </form>
//           ) : (
//             <form onSubmit={handleSignup}>
//               <div className="mb-4 relative">
//                 <label htmlFor="username" className="block text-sm mb-1">
//                   Username
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="text"
//                     id="username"
//                     className="w-full p-2 border rounded-md"
//                     placeholder="johndoe"
//                     value={username}
//                     onChange={(e) => {
//                       setUsername(e.target.value)
//                       validateUsername(e.target.value)
//                     }}
//                   />
//                   {isUsernameValid && (
//                     <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
//                   )}
//                 </div>
//               </div>

//               <div className="mb-4 relative">
//                 <label htmlFor="signup-email" className="block text-sm mb-1">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="email"
//                     id="signup-email"
//                     className="w-full p-2 border rounded-md"
//                     placeholder="username@kalisimbi.org"
//                     value={email}
//                     onChange={(e) => {
//                       setEmail(e.target.value)
//                       validateEmail(e.target.value)
//                     }}
//                   />
//                   {isEmailValid && (
//                     <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
//                   )}
//                 </div>
//               </div>

//               <div className="mb-4 relative">
//                 <label htmlFor="signup-password" className="block text-sm mb-1">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="password"
//                     id="signup-password"
//                     className="w-full p-2 border rounded-md"
//                     placeholder="••••••••••"
//                     value={password}
//                     onChange={(e) => {
//                       setPassword(e.target.value)
//                       validatePassword(e.target.value)
//                     }}
//                   />
//                   {isPasswordValid && (
//                     <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
//                   )}
//                 </div>
//               </div>

//               <div className="mb-4 relative">
//                 <label htmlFor="confirm-password" className="block text-sm mb-1">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="password"
//                     id="confirm-password"
//                     className="w-full p-2 border rounded-md"
//                     placeholder="••••••••••"
//                     value={confirmPassword}
//                     onChange={(e) => {
//                       setConfirmPassword(e.target.value)
//                       validateConfirmPassword(e.target.value)
//                     }}
//                   />
//                   {isConfirmPasswordValid && (
//                     <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
//                   )}
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label htmlFor="role" className="block text-sm mb-1">
//                   Role
//                 </label>
//                 <select
//                   id="role"
//                   className="w-full p-2 border rounded-md"
//                   value={role}
//                   onChange={(e) => setRole(e.target.value as "admin" | "storekeeper" | "technician")}
//                 >
//                   <option value="storekeeper">Storekeeper</option>
//                   <option value="technician">Technician</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-[#0365ff] text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Create Account
//               </button>
//             </form>
//           )}

//           <div className="mt-6 text-center">
//             <div className="flex items-center justify-center gap-2 mb-4">
//               <div className="h-px bg-gray-300 flex-1"></div>
//               <span className="text-[#adadad] text-sm">Or Continue With</span>
//               <div className="h-px bg-gray-300 flex-1"></div>
//             </div>

//             <div className="flex justify-center gap-4">
//               <button className="p-2 border rounded-full">
//                 <Image src="/google-icon.png" alt="Google" width={24} height={24} />
//               </button>
//               <button className="p-2 border rounded-full">
//                 <Image src="/facebook-icon.png" alt="Facebook" width={24} height={24} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Right side - Image */}
//         <div className="hidden md:block md:w-1/2 bg-white p-6">
//           <div className="h-full flex items-center justify-center">
//             <Image
//               src="/gas-cylinders.png"
//               alt="Medical Gas Cylinders"
//               width={500}
//               height={600}
//               className="object-contain"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

