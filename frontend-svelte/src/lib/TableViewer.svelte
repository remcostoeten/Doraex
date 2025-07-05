<script lang="ts">
  import type { TTableState } from './types';

  export let tableState: TTableState;
  export let onRefresh: () => void;
  export let onPageChange: (page: number) => void;

  function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  function getCellDisplayValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    const formatted = formatCellValue(value);
    return formatted.length > 100 ? formatted.substring(0, 100) + '...' : formatted;
  }

  function getCellClass(value: unknown): string {
    if (value === null || value === undefined) {
      return 'text-gray-400 italic';
    }
    if (typeof value === 'boolean') {
      return value ? 'text-green-600' : 'text-red-600';
    }
    if (typeof value === 'number') {
      return 'text-blue-600 font-mono';
    }
    return 'text-gray-900';
  }

  $: totalPages = Math.ceil(tableState.totalRows / tableState.pageSize);
  $: startRow = (tableState.currentPage - 1) * tableState.pageSize + 1;
  $: endRow = Math.min(tableState.currentPage * tableState.pageSize, tableState.totalRows);

  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (tableState.currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (tableState.currentPage >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = tableState.currentPage - 2; i <= tableState.currentPage + 2; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
</script>

<div class="bg-white rounded-lg shadow-md">
  <!-- Header -->
  <div class="px-6 py-4 border-b border-gray-200">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-800">
          {#if tableState.activeTable}
            <span class="capitalize">{tableState.activeTable.name}</span>
            <span class="text-sm font-normal text-gray-500 ml-2">
              ({tableState.totalRows} rows)
            </span>
          {:else}
            Select a table
          {/if}
        </h2>
      </div>
      <div class="flex items-center space-x-2">
        {#if tableState.activeTable}
          <button
            type="button"
            on:click={onRefresh}
            disabled={tableState.isLoading}
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg class="h-4 w-4 mr-2 {tableState.isLoading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="p-6">
    {#if tableState.isLoading}
      <div class="flex items-center justify-center py-12">
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
            <h3 class="text-sm font-medium text-red-800">Data Loading Error</h3>
            <p class="text-sm text-red-700 mt-1">{tableState.error}</p>
          </div>
        </div>
      </div>
    {/if}

    {#if !tableState.activeTable && !tableState.isLoading}
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No table selected</h3>
        <p class="mt-1 text-sm text-gray-500">Choose a table from the list to view its data.</p>
      </div>
    {/if}

    {#if tableState.activeTable && tableState.tableData.length === 0 && !tableState.isLoading && !tableState.error}
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No data</h3>
        <p class="mt-1 text-sm text-gray-500">This table is empty.</p>
      </div>
    {/if}

    {#if tableState.activeTable && tableState.tableData.length > 0 && !tableState.isLoading}
      <!-- Table -->
      <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                {#each tableState.activeTable.columns as column (column.name)}
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div class="flex items-center space-x-1">
                      <span>{column.name}</span>
                      {#if column.primaryKey}
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          PK
                        </span>
                      {/if}
                      {#if !column.nullable}
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          *
                        </span>
                      {/if}
                    </div>
                    <div class="text-xs text-gray-400 mt-1 normal-case">
                      {column.type}
                    </div>
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each tableState.tableData as row, rowIndex (rowIndex)}
                <tr class="hover:bg-gray-50">
                  {#each tableState.activeTable.columns as column (column.name)}
                    <td class="px-6 py-4 whitespace-nowrap text-sm max-w-xs">
                      <div
                        class="truncate {getCellClass(row[column.name])}"
                        title={formatCellValue(row[column.name])}
                      >
                        {getCellDisplayValue(row[column.name])}
                      </div>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              on:click={() => onPageChange(Math.max(1, tableState.currentPage - 1))}
              disabled={tableState.currentPage === 1}
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              on:click={() => onPageChange(Math.min(totalPages, tableState.currentPage + 1))}
              disabled={tableState.currentPage === totalPages}
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{startRow}</span> to{' '}
                <span class="font-medium">{endRow}</span> of{' '}
                <span class="font-medium">{tableState.totalRows}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <!-- Previous -->
                <button
                  on:click={() => onPageChange(Math.max(1, tableState.currentPage - 1))}
                  disabled={tableState.currentPage === 1}
                  aria-label="Previous page"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <!-- Page numbers -->
                {#each getPageNumbers() as pageNum (pageNum)}
                  <button
                    on:click={() => onPageChange(pageNum)}
                    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium {pageNum === tableState.currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}"
                  >
                    {pageNum}
                  </button>
                {/each}

                <!-- Next -->
                <button
                  on:click={() => onPageChange(Math.min(totalPages, tableState.currentPage + 1))}
                  disabled={tableState.currentPage === totalPages}
                  aria-label="Next page"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
