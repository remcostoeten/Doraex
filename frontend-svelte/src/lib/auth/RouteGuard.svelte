<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth';
  import AuthWrapper from './AuthWrapper.svelte';

  $: authState = $authStore;
  $: isAuthenticated = authState.isAuthenticated;
  $: isLoading = authState.isLoading;

  onMount(() => {
    authStore.initialize();
  });
</script>

{#if isLoading}
  <div class="min-h-screen bg-light-secondary dark:bg-dark-primary flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
      <p class="mt-4 text-light-secondary dark:text-dark-secondary">Loading...</p>
    </div>
  </div>
{:else if isAuthenticated}
  <slot />
{:else}
  <AuthWrapper />
{/if}
