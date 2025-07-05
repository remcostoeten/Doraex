<script lang="ts">
  import RouteGuard from '$lib/auth/RouteGuard.svelte';
  import DatabaseExplorer from '$lib/DatabaseExplorer.svelte';
  import UserProfile from '$lib/auth/UserProfile.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
</script>

<svelte:head>
  <title>Database Table Explorer - Svelte</title>
  <meta name="description" content="Database Table Explorer built with Svelte" />
</svelte:head>

<RouteGuard>
  <div class="min-h-screen bg-light-secondary dark:bg-dark-primary">
    <header class="bg-light-primary dark:bg-dark-secondary shadow-sm border-b border-light-primary dark:border-dark-primary">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="bg-blue-600 dark:bg-blue-500 rounded-lg p-2 mr-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7l8-4 8 4M4 7l8 4 8-4M12 11v10"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-light-primary dark:text-dark-primary">Database Explorer</h1>
              <p class="text-sm text-light-secondary dark:text-dark-secondary">Svelte Implementation</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DatabaseExplorer />
      </div>
    </main>
  </div>
</RouteGuard>
