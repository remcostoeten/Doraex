<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { authStore } from './stores/auth';

  const dispatch = createEventDispatcher();

  export let isOpen = false;

  type TConnectionForm = {
    name: string;
    type: 'sqlite' | 'postgres';
    // SQLite fields
    path?: string;
    // PostgreSQL fields
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    // Connection URL field (alternative to individual fields)
    url?: string;
  };

  let form: TConnectionForm = {
    name: '',
    type: 'sqlite',
    port: 5432,
    ssl: true
  };

  let useUrl = false;
  let isLoading = false;
  let error = '';
  let testResult: { success: boolean; message: string } | null = null;

  function resetForm() {
    form = {
      name: '',
      type: 'sqlite',
      port: 5432,
      ssl: true
    };
    useUrl = false;
    error = '';
    testResult = null;
    isLoading = false;
  }

  function closeModal() {
    isOpen = false;
    resetForm();
  }

  async function testConnection() {
    isLoading = true;
    error = '';
    testResult = null;

    try {
      const auth = get(authStore);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (auth.isAuthenticated && auth.tokens?.access_token) {
        headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
      }

      let testData;
      
      if (form.type === 'sqlite') {
        testData = {
          type: 'sqlite',
          config: { path: form.path }
        };
      } else if (form.type === 'postgres') {
        if (useUrl && form.url) {
          testData = {
            type: 'postgres',
            config: { url: form.url }
          };
        } else {
          testData = {
            type: 'postgres',
            config: {
              host: form.host,
              port: form.port,
              database: form.database,
              user: form.username,
              password: form.password,
              ssl: form.ssl
            }
          };
        }
      }

      const response = await fetch('http://localhost:3002/api/test-connection', {
        method: 'POST',
        headers,
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      testResult = result;
      
      if (!result.success) {
        error = result.error || result.message || 'Connection test failed';
      }
    } catch (err) {
      error = `Connection test failed: ${err}`;
    } finally {
      isLoading = false;
    }
  }

  async function createConnection() {
    if (!testResult?.success) {
      error = 'Please test the connection first';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const auth = get(authStore);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (auth.isAuthenticated && auth.tokens?.access_token) {
        headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
      }

      let createData;
      
      if (form.type === 'sqlite') {
        createData = {
          name: form.name,
          type: 'sqlite',
          config: { path: form.path }
        };
      } else if (form.type === 'postgres') {
        if (useUrl && form.url) {
          createData = {
            name: form.name,
            type: 'postgres',
            config: { url: form.url }
          };
        } else {
          createData = {
            name: form.name,
            type: 'postgres',
            config: {
              host: form.host,
              port: form.port,
              database: form.database,
              user: form.username,
              password: form.password,
              ssl: form.ssl
            }
          };
        }
      }

      const response = await fetch('http://localhost:3002/api/connections', {
        method: 'POST',
        headers,
        body: JSON.stringify(createData)
      });

      const result = await response.json();
      
      if (result.id) {
        dispatch('connectionCreated', result);
        closeModal();
      } else {
        error = result.error || 'Failed to create connection';
      }
    } catch (err) {
      error = `Failed to create connection: ${err}`;
    } finally {
      isLoading = false;
    }
  }

  // Cloud provider presets
  function applyCloudPreset(provider: string) {
    switch (provider) {
      case 'supabase':
        form.host = '';
        form.port = 5432;
        form.ssl = true;
        form.database = 'postgres';
        break;
      case 'neon':
        form.host = '';
        form.port = 5432;
        form.ssl = true;
        break;
      case 'railway':
        form.host = '';
        form.port = 5432;
        form.ssl = true;
        break;
      case 'render':
        form.host = '';
        form.port = 5432;
        form.ssl = true;
        break;
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Add Database Connection</h2>
          <button
            on:click={closeModal}
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Error Display -->
        {#if error}
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-700">{error}</p>
          </div>
        {/if}

        <!-- Test Result -->
        {#if testResult}
          <div class="mb-4 p-3 {testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-md">
            <p class="text-sm {testResult.success ? 'text-green-700' : 'text-red-700'}">{testResult.message}</p>
          </div>
        {/if}

        <!-- Form -->
        <form on:submit|preventDefault={createConnection} class="space-y-4">
          <!-- Connection Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Connection Name
            </label>
            <input
              id="name"
              type="text"
              bind:value={form.name}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="My Database"
              required
            />
          </div>

          <!-- Database Type -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Database Type
            </label>
            <select
              id="type"
              bind:value={form.type}
              on:change={() => { testResult = null; useUrl = false; }}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="sqlite">SQLite</option>
              <option value="postgres">PostgreSQL</option>
            </select>
          </div>

          {#if form.type === 'sqlite'}
            <!-- SQLite Configuration -->
            <div>
              <label for="path" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Database File Path
              </label>
              <input
                id="path"
                type="text"
                bind:value={form.path}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="./database.db"
                required
              />
            </div>
          {/if}

          {#if form.type === 'postgres'}
            <!-- Cloud Provider Presets -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cloud Provider Presets
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  on:click={() => applyCloudPreset('supabase')}
                  class="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                >
                  Supabase
                </button>
                <button
                  type="button"
                  on:click={() => applyCloudPreset('neon')}
                  class="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200"
                >
                  Neon
                </button>
                <button
                  type="button"
                  on:click={() => applyCloudPreset('railway')}
                  class="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                >
                  Railway
                </button>
                <button
                  type="button"
                  on:click={() => applyCloudPreset('render')}
                  class="px-3 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200"
                >
                  Render
                </button>
              </div>
            </div>

            <!-- Connection Method Toggle -->
            <div>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  bind:checked={useUrl}
                  on:change={() => testResult = null}
                  class="mr-2"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Use connection URL instead of individual fields</span>
              </label>
            </div>

            {#if useUrl}
              <!-- Connection URL -->
              <div>
                <label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Connection URL
                </label>
                <input
                  id="url"
                  type="text"
                  bind:value={form.url}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="postgresql://user:password@host:5432/database?sslmode=require"
                  required
                />
                <p class="mt-1 text-xs text-gray-500">
                  Example: postgresql://user:password@host:5432/database?sslmode=require
                </p>
              </div>
            {:else}
              <!-- Individual PostgreSQL Fields -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="host" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Host
                  </label>
                  <input
                    id="host"
                    type="text"
                    bind:value={form.host}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="localhost"
                    required
                  />
                </div>
                <div>
                  <label for="port" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Port
                  </label>
                  <input
                    id="port"
                    type="number"
                    bind:value={form.port}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label for="database" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Database Name
                </label>
                <input
                  id="database"
                  type="text"
                  bind:value={form.database}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="mydb"
                  required
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    bind:value={form.username}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="postgres"
                    required
                  />
                </div>
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    bind:value={form.password}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    bind:checked={form.ssl}
                    class="mr-2"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Enable SSL (recommended for cloud databases)</span>
                </label>
              </div>
            {/if}
          {/if}

          <!-- Actions -->
          <div class="flex justify-between pt-6">
            <button
              type="button"
              on:click={testConnection}
              disabled={isLoading}
              class="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50"
            >
              {#if isLoading}
                <svg class="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              {/if}
              Test Connection
            </button>

            <div class="space-x-3">
              <button
                type="button"
                on:click={closeModal}
                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !testResult?.success}
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {#if isLoading}
                  <svg class="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                {/if}
                Create Connection
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}
