import { get } from 'svelte/store';
import { authStore } from './stores/auth';
import type { IHttpClient, TApiResponse } from './crud-factory';

export class AuthenticatedHttpClient implements IHttpClient {
  constructor(private baseUrl: string) {}

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const auth = get(authStore);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (auth.isAuthenticated && auth.tokens?.access_token) {
      headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
    }

    return headers;
  }

  private async handleAuthError(response: Response): Promise<void> {
    if (response.status === 401) {
      const auth = get(authStore);
      if (auth.tokens?.refresh_token) {
        const refreshResult = await authStore.refreshToken();
        if (!refreshResult.success) {
          authStore.logout();
        }
      } else {
        authStore.logout();
      }
    }
  }

  async get<T>(url: string): Promise<TApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'GET',
        headers
      });

      if (response.status === 401) {
        await this.handleAuthError(response);
        return { success: false, error: 'Authentication required' };
      }

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message || `GET request failed: ${response.status}` };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: `GET request failed: ${error}` };
    }
  }

  async post<T>(url: string, data: unknown): Promise<TApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (response.status === 401) {
        await this.handleAuthError(response);
        return { success: false, error: 'Authentication required' };
      }

      const responseData = await response.json();
      
      if (!response.ok) {
        return { success: false, error: responseData.message || `POST request failed: ${response.status}` };
      }

      return { success: true, data: responseData };
    } catch (error) {
      return { success: false, error: `POST request failed: ${error}` };
    }
  }

  async put<T>(url: string, data: unknown): Promise<TApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });

      if (response.status === 401) {
        await this.handleAuthError(response);
        return { success: false, error: 'Authentication required' };
      }

      const responseData = await response.json();
      
      if (!response.ok) {
        return { success: false, error: responseData.message || `PUT request failed: ${response.status}` };
      }

      return { success: true, data: responseData };
    } catch (error) {
      return { success: false, error: `PUT request failed: ${error}` };
    }
  }

  async delete<T>(url: string): Promise<TApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'DELETE',
        headers
      });

      if (response.status === 401) {
        await this.handleAuthError(response);
        return { success: false, error: 'Authentication required' };
      }

      const responseData = await response.json();
      
      if (!response.ok) {
        return { success: false, error: responseData.message || `DELETE request failed: ${response.status}` };
      }

      return { success: true, data: responseData };
    } catch (error) {
      return { success: false, error: `DELETE request failed: ${error}` };
    }
  }
}

export async function createAuthenticatedCRUDFactory<T extends import('./types').TBaseEntity>(
  config: import('./types').TCRUDConfig<T>,
  logger?: import('./crud-factory').ILogger,
  validator?: import('./crud-factory').IValidator<T>
) {
  const httpClient = new AuthenticatedHttpClient(config.baseUrl);
  const { CRUDFactory, ConsoleLogger, BaseValidator } = await import('./crud-factory');
  
  return new CRUDFactory(
    config,
    httpClient,
    logger || new ConsoleLogger(),
    validator || new BaseValidator<T>(config.schema)
  );
}
