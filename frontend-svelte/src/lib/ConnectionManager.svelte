<script lang="ts">
  import type { TDatabaseConnection, TConnectionState } from './types';

  export let connectionState: TConnectionState;
  export let onConnectionChange: (connection: TDatabaseConnection) => void;
</script>

<div class="bg-light-primary dark:bg-dark-secondary rounded-lg shadow-md p-6 border border-light-primary dark:border-dark-primary">
  <h2 class="text-xl font-bold mb-4 text-light-primary dark:text-dark-primary">Database Connections</h2>
  
  {#if connectionState.isLoading}
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
    </div>
  {/if}
  
  {#if connectionState.error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Connection Error</h3>
          <p class="text-sm text-red-700 dark:text-red-300 mt-1">{connectionState.error}</p>
        </div>
      </div>
    </div>
  {/if}
  
  {#if connectionState.connections.length === 0 && !connectionState.isLoading}
    <div class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-light-tertiary dark:text-dark-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-light-primary dark:text-dark-primary">No connections</h3>
      <p class="mt-1 text-sm text-light-secondary dark:text-dark-secondary">Get started by adding a database connection.</p>
    </div>
  {/if}
  
  <div class="space-y-3">
    {#each connectionState.connections as connection (connection.id)}
      <div
        class="p-4 border rounded-lg cursor-pointer transition-colors {connectionState.activeConnection?.id === connection.id
          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-light-primary dark:border-dark-primary hover:border-light-secondary dark:hover:border-dark-secondary'}"
        on:click={() => onConnectionChange(connection)}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && onConnectionChange(connection)}
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="h-3 w-3 rounded-full mr-3 {connection.isConnected ? 'bg-green-500' : 'bg-red-500'}"></div>
            <div>
              <h3 class="font-medium text-light-primary dark:text-dark-primary">{connection.name}</h3>
              <p class="text-sm text-light-secondary dark:text-dark-secondary">
                {connection.type} • {connection.database}
              </p>
            </div>
          </div>
          <div class="flex items-center">
            {#if connection.host}
              <span class="text-xs text-light-tertiary dark:text-dark-tertiary">
                {connection.host}:{connection.port}
              </span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
  
  <div class="mt-6 pt-4 border-t border-light-primary dark:border-dark-primary">
    <button
      type="button"
      class="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Add Connection
    </button>
  </div>
</div>
