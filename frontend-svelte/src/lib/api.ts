import { get } from 'svelte/store';
import { authStore } from './stores/auth';

const API_BASE_URL = 'http://localhost:3002/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const auth = get(authStore);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (auth.isAuthenticated && auth.tokens?.access_token) {
    headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
  }

  return headers;
}

export async function authenticatedFetch(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
}

export async function getConnections() {
  const response = await authenticatedFetch('/connections');
  return response.json();
}

export async function createConnection(connectionData: any) {
  const response = await authenticatedFetch('/connections', {
    method: 'POST',
    body: JSON.stringify(connectionData)
  });
  return response.json();
}

export async function testConnection(connectionData: any) {
  const response = await authenticatedFetch('/test-connection', {
    method: 'POST',
    body: JSON.stringify(connectionData)
  });
  return response.json();
}

export async function getTables(connectionId: string) {
  const response = await authenticatedFetch(`/connections/${connectionId}/tables`);
  return response.json();
}

export async function executeQuery(connectionId: string, query: string, values?: any[]) {
  const response = await authenticatedFetch(`/connections/${connectionId}/query`, {
    method: 'POST',
    body: JSON.stringify({ query, values })
  });
  return response.json();
}
