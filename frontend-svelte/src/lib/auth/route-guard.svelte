<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth';
  import AuthWrapper from './auth-wrapper.svelte';
  import AuthLoading from '../components/auth-loading.svelte';

  $: authState = $authStore;
  $: isAuthenticated = authState.isAuthenticated;
  $: isLoading = authState.isLoading;

  onMount(() => {
    authStore.initialize();
  });
</script>

{#if isLoading}
  <AuthLoading />
{:else if isAuthenticated}
  <slot />
{:else}
  <AuthWrapper />
{/if}
