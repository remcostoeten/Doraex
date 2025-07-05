// Shared CRUD Factory Implementation
// This factory follows SOLID principles and will be identical across all frameworks

import type {
  TBaseEntity,
  TCRUDConfig,
  TQueryOptions,
  TApiResponse,
  TTableSchema
} from './types';

// Single Responsibility: HTTP Client Interface
export interface IHttpClient {
  get<T>(url: string): Promise<TApiResponse<T>>;
  post<T>(url: string, data: unknown): Promise<TApiResponse<T>>;
  put<T>(url: string, data: unknown): Promise<TApiResponse<T>>;
  delete<T>(url: string): Promise<TApiResponse<T>>;
}

// Single Responsibility: Logger Interface
export interface ILogger {
  info(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
  warn(message: string, data?: unknown): void;
}

// Single Responsibility: Validator Interface
export interface IValidator<T> {
  validate(data: Partial<T>): { isValid: boolean; errors: string[] };
}

// Single Responsibility: CRUD Operations Interface
export interface ICRUDOperations<T extends TBaseEntity> {
  getAll(options?: TQueryOptions): Promise<TApiResponse<T[]>>;
  getById(id: string | number): Promise<TApiResponse<T>>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<TApiResponse<T>>;
  update(id: string | number, data: Partial<T>): Promise<TApiResponse<T>>;
  delete(id: string | number): Promise<TApiResponse<void>>;
  count(options?: TQueryOptions): Promise<TApiResponse<number>>;
}

// Default HTTP Client Implementation
export class HttpClient implements IHttpClient {
  constructor(private baseUrl: string) {}

  async get<T>(url: string): Promise<TApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: `GET request failed: ${error}` };
    }
  }

  async post<T>(url: string, data: unknown): Promise<TApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: `POST request failed: ${error}` };
    }
  }

  async put<T>(url: string, data: unknown): Promise<TApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: `PUT request failed: ${error}` };
    }
  }

  async delete<T>(url: string): Promise<TApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: `DELETE request failed: ${error}` };
    }
  }
}

// Default Console Logger Implementation
export class ConsoleLogger implements ILogger {
  info(message: string, data?: unknown): void {
    console.log(`[INFO] ${message}`, data || '');
  }

  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error || '');
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, data || '');
  }
}

// Base Validator Implementation
export class BaseValidator<T extends TBaseEntity> implements IValidator<T> {
  constructor(private schema: TTableSchema) {}

  validate(data: Partial<T>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    this.schema.columns
      .filter(col => !col.nullable && !col.defaultValue)
      .forEach(col => {
        if (!(col.name in data) || data[col.name as keyof T] == null) {
          errors.push(`${col.name} is required`);
        }
      });

    // Type validation would go here
    // For brevity, we'll keep it simple

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Main CRUD Factory Implementation
export class CRUDFactory<T extends TBaseEntity> implements ICRUDOperations<T> {
  constructor(
    private config: TCRUDConfig<T>,
    private httpClient: IHttpClient,
    private logger: ILogger,
    private validator: IValidator<T>
  ) {}

  async getAll(options: TQueryOptions = {}): Promise<TApiResponse<T[]>> {
    this.logger.info(`Fetching all records from ${this.config.tableName}`, options);
    
    const queryParams = this.buildQueryParams(options);
    const url = `/connections/${this.config.connectionId}/query`;
    
    const query = this.buildSelectQuery(options);
    const response = await this.httpClient.post<{ rows: T[] }>(url, { query });
    
    if (response.success && response.data) {
      return { success: true, data: response.data.rows };
    }
    
    this.logger.error(`Failed to fetch records from ${this.config.tableName}`, response.error);
    return { success: false, error: response.error };
  }

  async getById(id: string | number): Promise<TApiResponse<T>> {
    this.logger.info(`Fetching record by ID: ${id} from ${this.config.tableName}`);
    
    const url = `/connections/${this.config.connectionId}/query`;
    const query = `SELECT * FROM ${this.config.tableName} WHERE id = ${id} LIMIT 1`;
    
    const response = await this.httpClient.post<{ rows: T[] }>(url, { query });
    
    if (response.success && response.data && response.data.rows.length > 0) {
      return { success: true, data: response.data.rows[0] };
    }
    
    this.logger.error(`Record not found: ${id}`, response.error);
    return { success: false, error: response.error || 'Record not found' };
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<TApiResponse<T>> {
    this.logger.info(`Creating new record in ${this.config.tableName}`, data);
    
    const validation = this.validator.validate(data as Partial<T>);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const url = `/connections/${this.config.connectionId}/query`;
    const { columns, values, placeholders } = this.buildInsertQuery(data);
    const query = `INSERT INTO ${this.config.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    
    const response = await this.httpClient.post<{ rows: T[] }>(url, { query, values });
    
    if (response.success && response.data && response.data.rows.length > 0) {
      this.logger.info(`Record created successfully in ${this.config.tableName}`);
      return { success: true, data: response.data.rows[0] };
    }
    
    this.logger.error(`Failed to create record in ${this.config.tableName}`, response.error);
    return { success: false, error: response.error };
  }

  async update(id: string | number, data: Partial<T>): Promise<TApiResponse<T>> {
    this.logger.info(`Updating record ${id} in ${this.config.tableName}`, data);
    
    const url = `/connections/${this.config.connectionId}/query`;
    const { setClause, values } = this.buildUpdateQuery(data);
    const query = `UPDATE ${this.config.tableName} SET ${setClause} WHERE id = ${id} RETURNING *`;
    
    const response = await this.httpClient.post<{ rows: T[] }>(url, { query, values });
    
    if (response.success && response.data && response.data.rows.length > 0) {
      this.logger.info(`Record updated successfully: ${id}`);
      return { success: true, data: response.data.rows[0] };
    }
    
    this.logger.error(`Failed to update record: ${id}`, response.error);
    return { success: false, error: response.error };
  }

  async delete(id: string | number): Promise<TApiResponse<void>> {
    this.logger.info(`Deleting record ${id} from ${this.config.tableName}`);
    
    const url = `/connections/${this.config.connectionId}/query`;
    const query = `DELETE FROM ${this.config.tableName} WHERE id = ${id}`;
    
    const response = await this.httpClient.post<void>(url, { query });
    
    if (response.success) {
      this.logger.info(`Record deleted successfully: ${id}`);
    } else {
      this.logger.error(`Failed to delete record: ${id}`, response.error);
    }
    
    return response;
  }

  async count(options: TQueryOptions = {}): Promise<TApiResponse<number>> {
    this.logger.info(`Counting records in ${this.config.tableName}`, options);
    
    const url = `/connections/${this.config.connectionId}/query`;
    const whereClause = this.buildWhereClause(options.filters);
    const query = `SELECT COUNT(*) as count FROM ${this.config.tableName}${whereClause}`;
    
    const response = await this.httpClient.post<{ rows: [{ count: number }] }>(url, { query });
    
    if (response.success && response.data) {
      return { success: true, data: response.data.rows[0].count };
    }
    
    return { success: false, error: response.error };
  }

  // Helper methods for query building
  private buildQueryParams(options: TQueryOptions): URLSearchParams {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());
    return params;
  }

  private buildSelectQuery(options: TQueryOptions): string {
    const whereClause = this.buildWhereClause(options.filters);
    const orderClause = options.orderBy 
      ? ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`
      : '';
    const limitClause = options.limit ? ` LIMIT ${options.limit}` : '';
    const offsetClause = options.offset ? ` OFFSET ${options.offset}` : '';
    
    return `SELECT * FROM ${this.config.tableName}${whereClause}${orderClause}${limitClause}${offsetClause}`;
  }

  private buildWhereClause(filters?: Array<{ column: string; operator: string; value: unknown }>): string {
    if (!filters || filters.length === 0) return '';
    
    const conditions = filters.map(filter => {
      const value = typeof filter.value === 'string' ? `'${filter.value}'` : filter.value;
      return `${filter.column} ${filter.operator} ${value}`;
    });
    
    return ` WHERE ${conditions.join(' AND ')}`;
  }

  private buildInsertQuery(data: Record<string, unknown>): { columns: string; values: unknown[]; placeholders: string } {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    return { columns, values, placeholders };
  }

  private buildUpdateQuery(data: Partial<T>): { setClause: string; values: unknown[] } {
    const entries = Object.entries(data).filter(([_, value]) => value !== undefined);
    const setClause = entries.map(([key], index) => `${key} = $${index + 1}`).join(', ');
    const values = entries.map(([_, value]) => value);
    
    return { setClause, values };
  }
}

// Factory creator function (Dependency Injection)
export function createCRUDFactory<T extends TBaseEntity>(
  config: TCRUDConfig<T>,
  httpClient?: IHttpClient,
  logger?: ILogger,
  validator?: IValidator<T>
): ICRUDOperations<T> {
  return new CRUDFactory(
    config,
    httpClient || new HttpClient(config.baseUrl),
    logger || new ConsoleLogger(),
    validator || new BaseValidator<T>(config.schema)
  );
}
