import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type TSQLiteConnection = {
  id: string;
  name: string;
  type: 'sqlite';
  path: string;
  createdAt: string;
};

type TPostgresConnection = {
  id: string;
  name: string;
  type: 'postgres';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  createdAt: string;
};

type TConnection = TSQLiteConnection | TPostgresConnection;

function createConnectionsStore() {
  const { subscribe, set, update } = writable<TConnection[]>([]);

  function loadConnections() {
    if (!browser) return;
    
    try {
      const stored = localStorage.getItem('db-explorer-connections');
      if (stored) {
        const connections = JSON.parse(stored);
        set(connections);
      }
    } catch (error) {
      console.error('Failed to load connections from localStorage:', error);
    }
  }

  function saveConnections(connections: TConnection[]) {
    if (!browser) return;
    
    try {
      localStorage.setItem('db-explorer-connections', JSON.stringify(connections));
    } catch (error) {
      console.error('Failed to save connections to localStorage:', error);
    }
  }

  function addConnection(connection: Omit<TConnection, 'id' | 'createdAt'>) {
    const newConnection: TConnection = {
      ...connection,
      id: `${connection.name}_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    update(connections => {
      const updated = [...connections, newConnection];
      saveConnections(updated);
      return updated;
    });

    return newConnection.id;
  }

  function addPostgresConnection(params: {
    name: string;
    connectionString?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
  }) {
    const newConnection: TPostgresConnection = {
      ...params,
      id: `${params.name}_${Date.now()}`,
      type: 'postgres',
      createdAt: new Date().toISOString()
    };

    update(connections => {
      const updated = [...connections, newConnection];
      saveConnections(updated);
      return updated;
    });

    return newConnection.id;
  }

  function removeConnection(id: string) {
    update(connections => {
      const updated = connections.filter(c => c.id !== id);
      saveConnections(updated);
      return updated;
    });
  }

  function updateConnection(id: string, updates: Partial<TConnection>) {
    update(connections => {
      const updated = connections.map(c => 
        c.id === id ? { ...c, ...updates } : c
      );
      saveConnections(updated);
      return updated;
    });
  }

  function getConnection(id: string): TConnection | undefined {
    let connection: TConnection | undefined;
    subscribe(connections => {
      connection = connections.find(c => c.id === id);
    })();
    return connection;
  }

  // Initialize store when created
  loadConnections();

  return {
    subscribe,
    addConnection,
    addPostgresConnection,
    removeConnection,
    updateConnection,
    getConnection,
    loadConnections
  };
}

export const connectionsStore = createConnectionsStore();
export type { TConnection, TSQLiteConnection, TPostgresConnection };
