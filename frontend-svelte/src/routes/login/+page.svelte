<script lang="ts">
  import AuthWrapper from '$lib/auth/auth-wrapper.svelte';
</script>

<svelte:head>
  <title>Login - Database Explorer</title>
</svelte:head>

<AuthWrapper initialMode="login" />
