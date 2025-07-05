// Shared types for Database Table Explorer
// This file will be copied to all three frontend projects

// Base Entity Interface (Open/Closed Principle)
export type TBaseEntity = {
  id: string | number;
  created_at?: string;
  updated_at?: string;
}

// Database Connection Types
export type TDatabaseConnection = {
  id: string;
  name: string;
  type: 'sqlite' | 'postgresql' | 'mysql';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  isConnected: boolean;
}

// Table Schema Types
export type TColumnType = 'TEXT' | 'INTEGER' | 'REAL' | 'BOOLEAN' | 'DATE' | 'DATETIME' | 'DECIMAL';

export type TTableColumn = {
  name: string;
  type: TColumnType;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue?: string;
}

export type TTableSchema = {
  name: string;
  columns: TTableColumn[];
}

// CRUD Operation Types
export type TCRUDOperation = 'create' | 'read' | 'update' | 'delete';

export type TQueryFilter = {
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
  value: string | number | boolean;
}

export type TQueryOptions = {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  filters?: TQueryFilter[];
}

// API Response Types
export type TApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Specific Entity Types extending TBaseEntity
export type TUser = TBaseEntity & {
  name: string;
  email: string;
  age?: number;
  department?: string;
  salary?: number;
  hire_date?: string;
  is_active?: boolean;
}

export type TProduct = TBaseEntity & {
  name: string;
  description?: string;
  price: number;
  category?: string;
  stock_quantity?: number;
  is_available?: boolean;
}

export type TOrder = TBaseEntity & {
  user_id: number;
  product_id: number;
  quantity: number;
  total_amount: number;
  order_date?: string;
  status?: string;
}

// Factory Configuration Type
export type TCRUDConfig<T extends TBaseEntity> = {
  tableName: string;
  schema: TTableSchema;
  baseUrl: string;
  connectionId: string;
}

// Authentication Types
export type TAuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export type TAuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export type TAuthState = {
  user: TAuthUser | null;
  tokens: TAuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type TLoginCredentials = {
  email: string;
  password: string;
}

export type TRegisterData = {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export type TPasswordReset = {
  email: string;
}

export type TPasswordResetConfirm = {
  token: string;
  password: string;
  confirmPassword: string;
}

// State Management Types
export type TConnectionState = {
  connections: TDatabaseConnection[];
  activeConnection: TDatabaseConnection | null;
  isLoading: boolean;
  error: string | null;
}

export type TTableState = {
  tables: TTableSchema[];
  activeTable: TTableSchema | null;
  tableData: Record<string, unknown>[];
  isLoading: boolean;
  error: string | null;
  totalRows: number;
  currentPage: number;
  pageSize: number;
}
