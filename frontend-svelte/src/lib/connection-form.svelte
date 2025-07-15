<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { authStore } from './stores/auth';
  import { connectionsStore } from './stores/connections';
  import type { TDatabaseConnection } from './types';

  type TConnectionFormData = {
    name: string;
    type: 'postgresql' | 'sqlite';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    url: string;
  };

  const dispatch = createEventDispatcher<{
    submit: TConnectionFormData & { connectionId?: string };
    close: void;
  }>();

  export let isOpen = false;
  export let isLoading = false;
  export let error: string | null = null;

  let formData: TConnectionFormData = {
    name: '',
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
    url: ''
  };

  let useConnectionString = false;
  let isTestingConnection = false;
  let testResult: { success: boolean; message: string } | null = null;

  function resetForm() {
    formData = {
      name: '',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: '',
      url: ''
    };
    useConnectionString = false;
    testResult = null;
    error = null;
  }

  function handleClose() {
    resetForm();
    dispatch('close');
  }

  async function testConnection() {
    isTestingConnection = true;
    testResult = null;

    try {
      let testConfig: any;
      let type: string;
      
      if (formData.type === 'sqlite') {
        testConfig = { path: formData.database };
        type = 'sqlite';
      } else {
        testConfig = useConnectionString 
          ? { url: formData.url }
          : {
              host: formData.host,
              port: formData.port,
              database: formData.database,
              user: formData.username,
              password: formData.password
            };
        type = 'postgres';
      }

      const auth = get(authStore);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (auth.isAuthenticated && auth.tokens?.access_token) {
        headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
      }
      
      const response = await fetch('http://localhost:3002/api/test-connection', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type,
          config: testConfig
        })
      });

      const result = await response.json();
      testResult = result;
    } catch (err) {
      testResult = {
        success: false,
        message: 'Connection test failed: ' + (err instanceof Error ? err.message : 'Unknown error')
      };
    } finally {
      isTestingConnection = false;
    }
  }

  function handleSubmit() {
    if (!formData.name.trim()) {
      error = 'Connection name is required';
      return;
    }

    if (formData.type === 'sqlite') {
      if (!formData.database.trim()) {
        error = 'Database path is required';
        return;
      }
      
      // For SQLite, save to localStorage instead of sending to server
      const connectionId = connectionsStore.addConnection({
        name: formData.name,
        type: 'sqlite',
        path: formData.database
      });
      
      // Still dispatch to notify parent component
      dispatch('submit', { ...formData, connectionId });
      return;
    }

    // For PostgreSQL connections
    if (useConnectionString) {
      if (!formData.url.trim()) {
        error = 'Connection URL is required';
        return;
      }
    } else {
      if (!formData.host.trim() || !formData.database.trim() || !formData.username.trim()) {
        error = 'Host, database, and username are required';
        return;
      }
    }

    dispatch('submit', formData);
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">Add New Connection</h2>
          <button
            on:click={handleClose}
            class="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {#if error}
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-700">{error}</p>
          </div>
        {/if}

        {#if testResult}
          <div class="mb-4 p-3 border rounded-md {testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}">
            <p class="text-sm {testResult.success ? 'text-green-700' : 'text-red-700'}">{testResult.message}</p>
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Connection Name
            </label>
            <input
              id="name"
              type="text"
              bind:value={formData.name}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My PostgreSQL Database"
              required
            />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
              Database Type
            </label>
            <select
              id="type"
              bind:value={formData.type}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="sqlite">SQLite</option>
            </select>
          </div>

          {#if formData.type === 'postgresql'}
            <div class="space-y-4">
              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    bind:checked={useConnectionString}
                    class="mr-2"
                  />
                  <span class="text-sm text-gray-700">Use connection string</span>
                </label>
              </div>

              {#if useConnectionString}
                <div>
                  <label for="url" class="block text-sm font-medium text-gray-700 mb-1">
                    Connection URL
                  </label>
                  <input
                    id="url"
                    type="text"
                    bind:value={formData.url}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="postgresql://username:password@host:port/database"
                    required={useConnectionString}
                  />
                </div>
              {:else}
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="host" class="block text-sm font-medium text-gray-700 mb-1">
                      Host
                    </label>
                    <input
                      id="host"
                      type="text"
                      bind:value={formData.host}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="localhost"
                      required={!useConnectionString}
                    />
                  </div>
                  <div>
                    <label for="port" class="block text-sm font-medium text-gray-700 mb-1">
                      Port
                    </label>
                    <input
                      id="port"
                      type="number"
                      bind:value={formData.port}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5432"
                      min="1"
                      max="65535"
                      required={!useConnectionString}
                    />
                  </div>
                </div>

                <div>
                  <label for="database" class="block text-sm font-medium text-gray-700 mb-1">
                    Database
                  </label>
                  <input
                    id="database"
                    type="text"
                    bind:value={formData.database}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="my_database"
                    required={!useConnectionString}
                  />
                </div>

                <div>
                  <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    bind:value={formData.username}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="postgres"
                    required={!useConnectionString}
                  />
                </div>

                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    bind:value={formData.password}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              {/if}
            </div>
          {:else}
            <div>
              <label for="database" class="block text-sm font-medium text-gray-700 mb-1">
                Database Path
              </label>
              <input
                id="database"
                type="text"
                bind:value={formData.database}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="/path/to/database.db"
                required
              />
            </div>
          {/if}

          <div class="flex justify-between pt-4">
            <button
              type="button"
              on:click={testConnection}
              disabled={isTestingConnection}
              class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {#if isTestingConnection}
                <svg class="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              {:else}
                Test Connection
              {/if}
            </button>

            <div class="flex space-x-3">
              <button
                type="button"
                on:click={handleClose}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {#if isLoading}
                  <svg class="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                {:else}
                  Add Connection
                {/if}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}
