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
  import { createCRUDFactory } from './crud-factory';
  import ConnectionManager from './ConnectionManager.svelte';
  import TableList from './TableList.svelte';
  import TableViewer from './TableViewer.svelte';

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

  // Initialize by loading connections from backend
  onMount(async () => {
    await loadConnections();
  });

  // Load connections from backend
  async function loadConnections() {
    connectionState = { ...connectionState, isLoading: true, error: null };

    try {
      const auth = get(authStore);
      const headers = {};
      
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
      const headers = {};
      
      if (auth.isAuthenticated && auth.tokens?.access_token) {
        headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
      }
      
      const response = await fetch(`http://localhost:3002/api/connections/${connectionState.activeConnection.id}/tables`, {
        headers
      });
      const result = await response.json();

      if (result.success) {
        // Mock table schemas based on our sample data
        const mockTables: TTableSchema[] = [
          {
            name: "users",
            columns: [
              { name: "id", type: "INTEGER", nullable: false, primaryKey: true },
              { name: "name", type: "TEXT", nullable: false, primaryKey: false },
              { name: "email", type: "TEXT", nullable: false, primaryKey: false },
              { name: "age", type: "INTEGER", nullable: true, primaryKey: false },
              { name: "department", type: "TEXT", nullable: true, primaryKey: false },
              { name: "salary", type: "DECIMAL", nullable: true, primaryKey: false },
              { name: "hire_date", type: "DATE", nullable: true, primaryKey: false },
              { name: "is_active", type: "BOOLEAN", nullable: true, primaryKey: false },
              { name: "created_at", type: "DATETIME", nullable: true, primaryKey: false }
            ]
          },
          {
            name: "products", 
            columns: [
              { name: "id", type: "INTEGER", nullable: false, primaryKey: true },
              { name: "name", type: "TEXT", nullable: false, primaryKey: false },
              { name: "description", type: "TEXT", nullable: true, primaryKey: false },
              { name: "price", type: "DECIMAL", nullable: false, primaryKey: false },
              { name: "category", type: "TEXT", nullable: true, primaryKey: false },
              { name: "stock_quantity", type: "INTEGER", nullable: true, primaryKey: false },
              { name: "is_available", type: "BOOLEAN", nullable: true, primaryKey: false },
              { name: "created_at", type: "DATETIME", nullable: true, primaryKey: false }
            ]
          },
          {
            name: "orders",
            columns: [
              { name: "id", type: "INTEGER", nullable: false, primaryKey: true },
              { name: "user_id", type: "INTEGER", nullable: false, primaryKey: false },
              { name: "product_id", type: "INTEGER", nullable: false, primaryKey: false },
              { name: "quantity", type: "INTEGER", nullable: false, primaryKey: false },
              { name: "total_amount", type: "DECIMAL", nullable: false, primaryKey: false },
              { name: "order_date", type: "DATE", nullable: true, primaryKey: false },
              { name: "status", type: "TEXT", nullable: true, primaryKey: false },
              { name: "created_at", type: "DATETIME", nullable: true, primaryKey: false }
            ]
          }
        ];

        tableState = {
          ...tableState,
          tables: mockTables,
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
      // Create CRUD factory for the selected table
      const config = {
        tableName: table.name,
        schema: table,
        baseUrl: "http://localhost:3002/api",
        connectionId: connectionState.activeConnection!.id
      };

      const crudFactory = createCRUDFactory(config);
      
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
</script>

<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <!-- Connection Manager -->
  <div class="lg:col-span-1">
    <ConnectionManager 
      {connectionState}
      onConnectionChange={handleConnectionChange}
    />
  </div>

  <!-- Table List -->
  <div class="lg:col-span-1">
    <TableList 
      {tableState}
      onTableSelect={selectTable}
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
