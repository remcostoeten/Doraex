<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { authStore } from './stores/auth';
  import type { TDatabaseConnection, TColumnDefinition } from './types';

  type TProps = {
    connection: TDatabaseConnection | null;
    isVisible: boolean;
  };

  export let connection: TProps['connection'];
  export let isVisible: TProps['isVisible'];

  const dispatch = createEventDispatcher<{
    close: void;
    tableCreated: { tableName: string };
  }>();

  let tableName = '';
  let columns: TColumnDefinition[] = [
    { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true, autoIncrement: true }
  ];
  let isCreating = false;
  let error = '';

  function addColumn() {
    columns = [...columns, { name: '', type: 'TEXT', nullable: true, primaryKey: false }];
  }

  function removeColumn(index: number) {
    if (columns.length > 1) {
      columns = columns.filter((_, i) => i !== index);
    }
  }

  function updateColumn(index: number, field: keyof TColumnDefinition, value: string | boolean) {
    columns[index] = { ...columns[index], [field]: value };
    columns = [...columns];
  }

  async function createTable() {
    if (!connection || !tableName.trim()) {
      error = 'Table name is required';
      return;
    }

    const validColumns = columns.filter(col => col.name.trim() !== '');
    if (validColumns.length === 0) {
      error = 'At least one column is required';
      return;
    }

    isCreating = true;
    error = '';

    try {
      const auth = get(authStore);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (auth.isAuthenticated && auth.tokens?.access_token) {
        headers['Authorization'] = `Bearer ${auth.tokens.access_token}`;
      }

      // Build CREATE TABLE SQL
      const columnDefinitions = validColumns.map(col => {
        let def = `${col.name} ${col.type}`;
        if (col.primaryKey) def += ' PRIMARY KEY';
        if (col.autoIncrement) def += ' AUTOINCREMENT';
        if (!col.nullable) def += ' NOT NULL';
        if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
        return def;
      }).join(', ');

      const createTableSQL = `CREATE TABLE ${tableName} (${columnDefinitions})`;

      const response = await fetch(`http://localhost:3002/api/connections/${connection.id}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: createTableSQL })
      });

      const result = await response.json();

      if (result.success) {
        dispatch('tableCreated', { tableName });
        closeModal();
      } else {
        error = result.error || 'Failed to create table';
      }
    } catch (err) {
      error = `Failed to create table: ${err}`;
    } finally {
      isCreating = false;
    }
  }

  function closeModal() {
    tableName = '';
    columns = [
      { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true, autoIncrement: true }
    ];
    error = '';
    dispatch('close');
  }

  const columnTypes = ['TEXT', 'INTEGER', 'REAL', 'BLOB', 'NUMERIC', 'BOOLEAN', 'DATE', 'DATETIME'];
</script>

{#if isVisible}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Create New Table</h2>
        <button
          on:click={closeModal}
          class="text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={createTable}>
        <!-- Table Name -->
        <div class="mb-4">
          <label for="tableName" class="block text-sm font-medium text-gray-700 mb-2">
            Table Name
          </label>
          <input
            id="tableName"
            type="text"
            bind:value={tableName}
            placeholder="Enter table name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Columns -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">Columns</label>
            <button
              type="button"
              on:click={addColumn}
              class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Add Column
            </button>
          </div>

          <div class="space-y-2">
            {#each columns as column, index}
              <div class="flex items-center space-x-2 p-3 border border-gray-200 rounded">
                <!-- Column Name -->
                <input
                  type="text"
                  placeholder="Column name"
                  value={column.name}
                  on:input={(e) => updateColumn(index, 'name', e.currentTarget.value)}
                  class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  required={index === 0}
                  disabled={index === 0 && column.name === 'id'}
                />

                <!-- Column Type -->
                <select
                  value={column.type}
                  on:change={(e) => updateColumn(index, 'type', e.currentTarget.value)}
                  class="px-2 py-1 border border-gray-300 rounded text-sm"
                  disabled={index === 0 && column.name === 'id'}
                >
                  {#each columnTypes as type}
                    <option value={type}>{type}</option>
                  {/each}
                </select>

                <!-- Nullable -->
                <label class="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={!column.nullable}
                    on:change={(e) => updateColumn(index, 'nullable', !e.currentTarget.checked)}
                    class="mr-1"
                    disabled={index === 0 && column.name === 'id'}
                  />
                  NOT NULL
                </label>

                <!-- Primary Key -->
                <label class="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={column.primaryKey}
                    on:change={(e) => updateColumn(index, 'primaryKey', e.currentTarget.checked)}
                    class="mr-1"
                    disabled={index === 0 && column.name === 'id'}
                  />
                  PK
                </label>

                <!-- Auto Increment -->
                {#if column.type === 'INTEGER'}
                  <label class="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={column.autoIncrement}
                      on:change={(e) => updateColumn(index, 'autoIncrement', e.currentTarget.checked)}
                      class="mr-1"
                      disabled={index === 0 && column.name === 'id'}
                    />
                    AI
                  </label>
                {/if}

                <!-- Remove Button -->
                {#if columns.length > 1 && !(index === 0 && column.name === 'id')}
                  <button
                    type="button"
                    on:click={() => removeColumn(index)}
                    class="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    aria-label="Remove column"
                  >
                    ✕
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            on:click={closeModal}
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={isCreating || !tableName.trim()}
          >
            {isCreating ? 'Creating...' : 'Create Table'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
</script>
