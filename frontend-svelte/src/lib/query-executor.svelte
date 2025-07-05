<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { authStore } from './stores/auth';
  import type { TDatabaseConnection } from './types';

  type TProps = {
    connection: TDatabaseConnection | null;
    isVisible: boolean;
  };

  export let connection: TProps['connection'];
  export let isVisible: TProps['isVisible'];

  const dispatch = createEventDispatcher<{
    close: void;
    queryExecuted: { query: string; result: unknown };
  }>();

  let query = '';
  let result: unknown = null;
  let isExecuting = false;
  let error = '';
  let executionTime = 0;
  let queryHistory: Array<{ query: string; timestamp: string }> = [];

  // Common SQL snippets for quick access
  const snippets = [
    { name: 'Select All', sql: 'SELECT * FROM table_name LIMIT 10;' },
    { name: 'Count Rows', sql: 'SELECT COUNT(*) FROM table_name;' },
    { name: 'Create Table', sql: 'CREATE TABLE table_name (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);' },
    { name: 'Insert Row', sql: 'INSERT INTO table_name (name) VALUES (\'example\');' },
    { name: 'Update Row', sql: 'UPDATE table_name SET name = \'new_value\' WHERE id = 1;' },
    { name: 'Delete Row', sql: 'DELETE FROM table_name WHERE id = 1;' },
    { name: 'Show Tables', sql: 'SELECT name FROM sqlite_master WHERE type=\'table\';' },
    { name: 'Table Schema', sql: 'PRAGMA table_info(table_name);' }
  ];

  async function executeQuery() {
    if (!connection || !query.trim()) {
      error = 'Query is required';
      return;
    }

    isExecuting = true;
    error = '';
    result = null;
    const startTime = Date.now();

    try {
      const auth = get(authStore);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (auth.isAuthenticated && auth.tokens?.access_token) {
        headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
      }

      const response = await fetch(`http://localhost:3002/api/connections/${connection.id}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: query.trim() })
      });

      const queryResult = await response.json();
      executionTime = Date.now() - startTime;

      if (queryResult.success) {
        result = queryResult.result;
        
        // Add to query history
        queryHistory = [
          { query: query.trim(), timestamp: new Date().toLocaleString() },
          ...queryHistory.slice(0, 9) // Keep last 10 queries
        ];
        
        dispatch('queryExecuted', { query: query.trim(), result: queryResult.result });
      } else {
        error = queryResult.error || 'Query execution failed';
      }
    } catch (err) {
      error = `Failed to execute query: ${err}`;
      executionTime = Date.now() - startTime;
    } finally {
      isExecuting = false;
    }
  }

  function insertSnippet(snippet: string) {
    query = snippet;
  }

  function loadFromHistory(historicalQuery: string) {
    query = historicalQuery;
  }

  function clearQuery() {
    query = '';
    result = null;
    error = '';
    executionTime = 0;
  }

  function closeModal() {
    clearQuery();
    dispatch('close');
  }

  function formatResult(data: unknown) {
    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === 'object' && data !== null) {
      return [data];
    } else {
      return [{ result: data }];
    }
  }

  function downloadResults() {
    if (!result) return;
    
    const formattedResult = formatResult(result);
    const csv = convertToCSV(formattedResult);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function convertToCSV(data: unknown[]) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0] as object);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = (row as Record<string, unknown>)[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : String(value ?? '');
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }
</script>

{#if isVisible}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-bold">SQL Query Executor</h2>
        <button
          on:click={closeModal}
          class="text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <!-- Left Panel: Query Input -->
        <div class="w-1/2 p-6 border-r flex flex-col">
          <!-- Snippets -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Quick Snippets</label>
            <div class="grid grid-cols-2 gap-2">
              {#each snippets as snippet}
                <button
                  type="button"
                  on:click={() => insertSnippet(snippet.sql)}
                  class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-left"
                  title={snippet.sql}
                >
                  {snippet.name}
                </button>
              {/each}
            </div>
          </div>

          <!-- Query Input -->
          <div class="flex-1 flex flex-col">
            <label for="query" class="block text-sm font-medium text-gray-700 mb-2">
              SQL Query
            </label>
            <textarea
              id="query"
              bind:value={query}
              placeholder="Enter your SQL query here..."
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows="12"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between items-center mt-4">
            <div class="flex space-x-2">
              <button
                on:click={executeQuery}
                disabled={isExecuting || !query.trim()}
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isExecuting ? 'Executing...' : 'Execute Query'}
              </button>
              <button
                on:click={clearQuery}
                class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
            {#if result}
              <button
                on:click={downloadResults}
                class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Download CSV
              </button>
            {/if}
          </div>

          <!-- Query History -->
          {#if queryHistory.length > 0}
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Recent Queries</label>
              <div class="max-h-32 overflow-y-auto space-y-1">
                {#each queryHistory as historyItem}
                  <div class="flex justify-between items-start p-2 bg-gray-50 rounded text-xs">
                    <button
                      on:click={() => loadFromHistory(historyItem.query)}
                      class="text-left flex-1 text-gray-700 hover:text-blue-600 truncate"
                      title={historyItem.query}
                    >
                      {historyItem.query}
                    </button>
                    <span class="text-gray-500 ml-2">{historyItem.timestamp}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Right Panel: Results -->
        <div class="w-1/2 p-6 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Results</h3>
            {#if executionTime > 0}
              <span class="text-sm text-gray-500">Executed in {executionTime}ms</span>
            {/if}
          </div>

          {#if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          {/if}

          {#if result}
            <div class="flex-1 overflow-auto">
              {#if Array.isArray(result) && result.length > 0}
                <div class="overflow-x-auto">
                  <table class="min-w-full border border-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        {#each Object.keys(result[0]) as header}
                          <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                            {header}
                          </th>
                        {/each}
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      {#each result as row, index}
                        <tr class="hover:bg-gray-50">
                          {#each Object.values(row) as value}
                            <td class="px-3 py-2 text-sm text-gray-900 border-b">
                              {value ?? 'NULL'}
                            </td>
                          {/each}
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
                <div class="mt-2 text-sm text-gray-500">
                  {result.length} row{result.length !== 1 ? 's' : ''} returned
                </div>
              {:else if result && typeof result === 'object'}
                <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
              {:else}
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Query executed successfully. Result: {result}
                </div>
              {/if}
            </div>
          {:else if !isExecuting}
            <div class="flex-1 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2h2a2 2 0 012 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No Results</h3>
                <p class="mt-1 text-sm text-gray-500">Execute a query to see results here</p>
              </div>
            </div>
          {/if}

          {#if isExecuting}
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p class="mt-2 text-sm text-gray-500">Executing query...</p>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">
            Connected to: <strong>{connection?.name || 'Unknown'}</strong>
          </span>
          <button
            on:click={closeModal}
            class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
</script>
