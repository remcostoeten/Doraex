<script lang="ts">
	import '../app.css';
	import RouteGuard from '$lib/auth/route-guard.svelte';

	let { children } = $props();
</script>

<!-- Vercel-style pure black background with auth protection -->
<div class="min-h-screen bg-black text-white font-sans antialiased">
	<RouteGuard>
		{@render children()}
	</RouteGuard>
</div>
