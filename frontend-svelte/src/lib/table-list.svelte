<script lang="ts">
  import type { TTableSchema, TTableState, TDatabaseConnection } from './types';
  // import TableCreator from './table-creator.svelte';

  export let tableState: TTableState;
  export let activeConnection: TDatabaseConnection | null;
  export let onTableSelect: (table: TTableSchema) => void;
  export let onTableCreated: () => void;

  let showTableCreator = false;

  function handleTableCreated() {
    showTableCreator = false;
    onTableCreated();
  }

  function getTableIcon(tableName: string) {
    switch (tableName.toLowerCase()) {
      case 'users':
        return `<svg class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>`;
      case 'products':
        return `<svg class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>`;
      case 'orders':
        return `<svg class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>`;
      default:
        return `<svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>`;
    }
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold text-gray-800">Tables</h2>
    <!-- Temporarily commented out table creator button
    {#if activeConnection}
      <button
        on:click={() => showTableCreator = true}
        class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        title="Create new table"
      >
        + Table
      </button>
    {/if}
    -->
  </div>
  
  {#if tableState.isLoading}
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  {/if}
  
  {#if tableState.error}
    <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Tables Error</h3>
          <p class="text-sm text-red-700 mt-1">{tableState.error}</p>
        </div>
      </div>
    </div>
  {/if}
  
  {#if tableState.tables.length === 0 && !tableState.isLoading}
    <div class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No tables found</h3>
      <p class="mt-1 text-sm text-gray-500">The selected database has no tables or they could not be loaded.</p>
    </div>
  {/if}
  
  <div class="space-y-2">
    {#each tableState.tables as table (table.name)}
      <div
        class="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 {tableState.activeTable?.name === table.name
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'}"
        on:click={() => onTableSelect(table)}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && onTableSelect(table)}
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            {@html getTableIcon(table.name)}
            <div class="ml-3">
              <h3 class="font-medium text-gray-900 capitalize">{table.name}</h3>
              <p class="text-sm text-gray-500">
                {table.columns.length} column{table.columns.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {table.columns.filter(col => col.primaryKey).length} PK
            </span>
            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {#if tableState.activeTable?.name === table.name}
          <div class="mt-3 pt-3 border-t border-gray-200">
            <div class="space-y-1">
              {#each table.columns.slice(0, 3) as column (column.name)}
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">{column.name}</span>
                  <div class="flex items-center space-x-2">
                    <span class="text-gray-400">{column.type}</span>
                    {#if column.primaryKey}
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        PK
                      </span>
                    {/if}
                    {#if !column.nullable}
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        NOT NULL
                      </span>
                    {/if}
                  </div>
                </div>
              {/each}
              {#if table.columns.length > 3}
                <div class="text-xs text-gray-500 pt-1">
                  +{table.columns.length - 3} more columns
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<!-- Table Creator Modal -->
<!-- <TableCreator 
  connection={activeConnection}
  isVisible={showTableCreator}
  on:close={() => showTableCreator = false}
  on:tableCreated={handleTableCreated}
/> -->
