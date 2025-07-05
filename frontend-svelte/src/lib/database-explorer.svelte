<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { authStore } from './stores/auth';
  import type { 
    TDatabaseConnection, 
    TTableSchema, 
    TConnectionState, 
    TTableState
  } from './types';
  import { createCRUDFactory, HttpClient } from './crud-factory';
  import ConnectionManager from './connection-manager.svelte';
  import TableList from './table-list.svelte';
  import TableViewer from './table-viewer.svelte';
  // import QueryExecutor from './query-executor.svelte';

  // Reactive state using Svelte stores approach
  let connectionState: TConnectionState = {
    connections: [],
    activeConnection: null,
    isLoading: false,
    error: null
  };

  let tableState: TTableState = {
    tables: [],
    activeTable: null,
    tableData: [],
    isLoading: false,
    error: null,
    totalRows: 0,
    currentPage: 1,
    pageSize: 20
  };

  let showQueryExecutor = false;

  // Initialize by loading connections from backend
  onMount(async () => {
    await loadConnections();
  });

  // Load connections from backend
  async function loadConnections() {
    connectionState = { ...connectionState, isLoading: true, error: null };

    try {
      const auth = get(authStore);
      const headers: Record<string, string> = {};
      
      if (auth.isAuthenticated && auth.tokens?.access_token) {
        headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
      }
      
      const response = await fetch('http://localhost:3002/api/connections', {
        headers
      });
      const result = await response.json();

      if (result.success && result.data) {
        // Use the first available connection or create a sample one
        let connections = result.data;
        if (connections.length === 0) {
          // Create a sample connection if none exist
          const sampleConnection: TDatabaseConnection = {
            id: "sample-db",
            name: "Sample Database",
            type: "sqlite",
            database: "sample.db",
            isConnected: true
          };
          connections = [sampleConnection];
        }

        connectionState = {
          ...connectionState,
          connections,
          activeConnection: connections[0],
          isLoading: false
        };

        // Load tables for the active connection
        await loadTables();
      } else {
        connectionState = {
          ...connectionState,
          error: result.error || "Failed to load connections",
          isLoading: false
        };
      }
    } catch (error) {
      connectionState = {
        ...connectionState,
        error: `Failed to load connections: ${error}`,
        isLoading: false
      };
    }
  }

  // Load tables from the active connection
  async function loadTables() {
    if (!connectionState.activeConnection) return;

    tableState = { ...tableState, isLoading: true, error: null };

    try {
      const auth = get(authStore);
      const headers: Record<string, string> = {};
      
      if (auth.isAuthenticated && auth.tokens?.access_token) {
        headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
      }
      
      const response = await fetch(`http://localhost:3002/api/connections/${connectionState.activeConnection.id}/tables`, {
        headers
      });
      const result = await response.json();

      if (result.success) {
        // Use actual tables from backend response
        const actualTables: TTableSchema[] = result.data.map((table: any) => ({
          name: table.name,
          columns: [
            // Basic columns for any table - we'll get real schema later
            { name: "id", type: "INTEGER", nullable: false, primaryKey: true }
          ]
        }));

        tableState = {
          ...tableState,
          tables: actualTables,
          isLoading: false
        };
      } else {
        tableState = {
          ...tableState,
          error: result.error || "Failed to load tables",
          isLoading: false
        };
      }
    } catch (error) {
      tableState = {
        ...tableState,
        error: `Failed to load tables: ${error}`,
        isLoading: false
      };
    }
  }

  // Select a table to view
  async function selectTable(table: TTableSchema) {
    tableState = {
      ...tableState,
      activeTable: table,
      isLoading: true,
      error: null
    };

    try {
      // Create auth-aware HTTP client
      const getAuthHeaders = async () => {
        const auth = get(authStore);
        const headers: Record<string, string> = {};
        if (auth.isAuthenticated && auth.tokens?.access_token) {
          headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
        }
        return headers;
      };

      // Create CRUD factory for the selected table
      const config = {
        tableName: table.name,
        schema: table,
        baseUrl: "http://localhost:3002/api",
        connectionId: connectionState.activeConnection!.id
      };

      const httpClient = new HttpClient(config.baseUrl, getAuthHeaders);
      const crudFactory = createCRUDFactory(config, httpClient);
      
      // Load table data
      const [dataResponse, countResponse] = await Promise.all([
        crudFactory.getAll({
          limit: tableState.pageSize,
          offset: (tableState.currentPage - 1) * tableState.pageSize
        }),
        crudFactory.count()
      ]);

      if (dataResponse.success && countResponse.success) {
        tableState = {
          ...tableState,
          tableData: dataResponse.data || [],
          totalRows: countResponse.data || 0,
          isLoading: false
        };
      } else {
        tableState = {
          ...tableState,
          error: dataResponse.error || countResponse.error || "Failed to load table data",
          isLoading: false
        };
      }
    } catch (error) {
      tableState = {
        ...tableState,
        error: `Failed to load table data: ${error}`,
        isLoading: false
      };
    }
  }

  function handleConnectionChange(connection: TDatabaseConnection) {
    connectionState = {
      ...connectionState,
      activeConnection: connection
    };
    loadTables();
  }

  function handleConnectionCreated() {
    // Reload connections after creating a new one
    loadConnections();
  }

  function handleRefresh() {
    if (tableState.activeTable) {
      selectTable(tableState.activeTable);
    }
  }

  function handlePageChange(page: number) {
    tableState = {
      ...tableState,
      currentPage: page
    };
    if (tableState.activeTable) {
      selectTable(tableState.activeTable);
    }
  }

  function handleOpenQueryExecutor() {
    showQueryExecutor = true;
  }

  function handleQueryExecuted() {
    // Refresh current table if one is selected
    if (tableState.activeTable) {
      selectTable(tableState.activeTable);
    }
    // Reload tables to catch any new tables that might have been created
    loadTables();
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <!-- Connection Manager -->
  <div class="lg:col-span-1">
    <ConnectionManager 
      {connectionState}
      onConnectionChange={handleConnectionChange}
      onConnectionCreated={handleConnectionCreated}
      onOpenQueryExecutor={handleOpenQueryExecutor}
    />
  </div>

  <!-- Table List -->
  <div class="lg:col-span-1">
    <TableList 
      {tableState}
      activeConnection={connectionState.activeConnection}
      onTableSelect={selectTable}
      onTableCreated={loadTables}
    />
  </div>

  <!-- Table Viewer -->
  <div class="lg:col-span-2">
    <TableViewer 
      {tableState}
      onRefresh={handleRefresh}
      onPageChange={handlePageChange}
    />
  </div>
</div>

<!-- Query Executor Modal -->
<!-- <QueryExecutor 
  connection={connectionState.activeConnection}
  isVisible={showQueryExecutor}
  on:close={() => showQueryExecutor = false}
  on:queryExecuted={handleQueryExecuted}
/> -->
