<script lang="ts">
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/stores/theme';
	import '../app.css';

	let { children } = $props();
	
	onMount(() => {
		themeStore.initializeTheme();
	});
</script>

<div class="bg-light-primary dark:bg-dark-primary text-light-primary dark:text-dark-primary min-h-screen transition-colors duration-200">
	{@render children()}
</div>
