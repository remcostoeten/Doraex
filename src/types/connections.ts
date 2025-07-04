type TConnectionConfig = {
  sqlite?: { path: string }
  postgres?: {
    host: string
    port: number
    database: string
    user: string
    password: string
  }
  url?: string
}

type TConnection = {
  type: 'sqlite' | 'postgres'
  db: any
  config: TConnectionConfig
}

type TQueryResult = {
  result: any[]
  executedAt: string
  query: string
}

type TConnectionTest = {
  success: boolean
  message: string
  error?: string
}

export type { TConnectionConfig, TConnection, TQueryResult, TConnectionTest }
