import { db } from "./db"

// Function to keep database connection warm
export async function warmupDatabase() {
  try {
    console.log("Warming up database connection...")
    await db.query("SELECT 1")
    console.log("Database connection warmed up successfully")
    return true
  } catch (error) {
    console.error("Failed to warm up database connection:", error)
    return false
  }
}
