import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"
import { RowDataPacket } from 'mysql2';




export async function POST(request: Request) {
  interface User extends RowDataPacket {
    id: number;
    username: string;
    password: string;
    role: string;
    email: string;
  }
  try {
    const { email, password } = await request.json()
    
    const [rows] = await db.query(
      "SELECT id, username, password, role FROM users WHERE username = ? OR email = ?",
      [email, email]
    );
    
    const users = rows as User[];
    const user = users[0];

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

   
 // Create JWT token
 const jwtSecret = process.env.JWT_SECRET || "y=mySecret-key"
 console.log("Using JWT secret:", jwtSecret.substring(0, 3) + "...")

 const token = sign(
   {
     id: user.id,
     username: user.username,
     role: user.role,
   },
   jwtSecret,
   { expiresIn: "1d" },
 )

 console.log("Token generated successfully")

 // Set cookie with more permissive settings for development
 const isProduction = process.env.NODE_ENV === "production"
 console.log("Environment:", isProduction ? "production" : "development")

 ;(await cookies()).set({
   name: "auth_token",
   value: token,
   httpOnly: true,
   path: "/",
   secure: isProduction, // Only require HTTPS in production
   sameSite: "lax",
   maxAge: 60 * 60 * 24, // 1 day
 })

 console.log("Cookie set successfully")

 return NextResponse.json({
   message: "Login successful",
   user: {
     id: user.id,
     username: user.username,
     role: user.role,
   },
 })
} catch (error) {
 console.error("Login error:", error)
 return NextResponse.json({ message: "Internal server error" }, { status: 500 })
}
}
// import { NextResponse } from "next/server"
// import { db } from "@/lib/db"
// import bcrypt from "bcrypt"
// import { sign } from "jsonwebtoken"
// import { cookies } from "next/headers"
// import { RowDataPacket } from 'mysql2';


// export async function POST(request: Request) {
//     interface User extends RowDataPacket {
//     id: number;
//     username: string;
//     password: string;
//     role: string;
//     email: string;
//   }
//   try {
//     const { email, password } = await request.json()
//     console.log("Login attempt for:", email)

//     // Find user by email
//     const [rows] = await db.query(
//             "SELECT id, username, password, role FROM users WHERE username = ? OR email = ?",
//             [email, email]
//           );
          
//           const users = rows as User[];
//           const user = users[0];
      
//     console.log("User found:", !!user)

//     if (!user) {
//       return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
//     }

//     // Compare passwords
//     const passwordMatch = await bcrypt.compare(password, user.password)
//     console.log("Password match:", passwordMatch)

//     if (!passwordMatch) {
//       return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
//     }

//     // Create JWT token
//     const jwtSecret = process.env.JWT_SECRET || "mySecret-key"
//     console.log("Using JWT secret:", jwtSecret.substring(0, 3) + "...")

//     const token = sign(
//       {
//         id: user.id,
//         username: user.username,
//         role: user.role,
//       },
//       jwtSecret,
//       { expiresIn: "1d" },
//     )

//     console.log("Token generated successfully")

//     // Set cookie
//     const response = NextResponse.json({
//       message: "Login successful",
//       token: token,
//       user: {
//         id: user.id,
//         username: user.username,
//         role: user.role,
//       },
//     })

//     // Set the cookie in the response
//     response.cookies.set({
//       name: "auth_token",
//       value: token,
//       httpOnly: true,
//       path: "/",
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24, // 1 day
//     })

//     console.log("Cookie set successfully")
//     return response
//   } catch (error) {
//     console.error("Login error:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }
