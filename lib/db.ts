import mysql from "mysql2/promise"

// Log environment variables for debugging
console.log("Database connection attempt with:", {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  database: process.env.MYSQL_DATABASE || "gas_management",
  // Don't log the password for security reasons
})

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "gas_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export const db = {
  query: async (sql: string, params?: any[]) => {
    try {
      return await pool.query(sql, params)
    } catch (error) {
      console.error("Database query error:", error)
      throw error
    }
  },

  // Helper function to get a single row
  getOne: async (sql: string, params?: any[]) => {
    const [rows] = await pool.query(sql, params)
    return (rows as any[])[0]
  },

  // Helper function to get multiple rows
  getMany: async (sql: string, params?: any[]) => {
    const [rows] = await pool.query(sql, params)
    return rows as any[]
  },
}