/**
 * Thin re-export so imports like
 *   import { SQLiteConnection } from "@/lib/db-connections/sqlite"
 * continue to work.
 *
 * The actual implementation lives in "../sqlite-connection".
 */
import { SQLiteConnection } from "../sqlite-connection"
export type { SQLiteConnectionConfig } from "../sqlite-connection"

/* Named export */
export { SQLiteConnection }

/* Optional default export for convenience */
export default SQLiteConnection
