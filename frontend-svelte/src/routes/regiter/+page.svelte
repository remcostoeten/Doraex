<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // Immediately redirect to the correct register page
  onMount(() => {
    goto('/register', { replaceState: true });
  });
</script>

<svelte:head>
  <title>Redirecting...</title>
</svelte:head>

<div class="min-h-screen bg-black flex items-center justify-center">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
    <p class="mt-4 text-white">Redirecting to register page...</p>
  </div>
</div>
