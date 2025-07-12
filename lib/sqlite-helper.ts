// Helper function to dynamically import SQLiteConnection to avoid build-time issues
export async function getSQLiteConnection() {
  const { SQLiteConnection } = await import("@/lib/db-connections/sqlite")
  return SQLiteConnection
}
