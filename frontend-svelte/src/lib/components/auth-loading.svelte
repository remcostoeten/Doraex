<script lang="ts">
  import { onMount } from 'svelte';
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

<!-- Vercel-style Authentication Loading Screen -->
<div class="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
  <!-- Grid Background -->
  <div class="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
  
  <!-- Loading Content -->
  <div class="relative z-10 text-center">
    <!-- Logo -->
    <div class="flex justify-center mb-8">
      <div class="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
        <svg class="h-7 w-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7l8-4 8 4M4 7l8 4 8-4M12 11v10"/>
        </svg>
      </div>
    </div>
    
    <!-- Loading Spinner -->
    <div class="relative mb-6">
      <!-- Outer ring -->
      <div class="w-16 h-16 border-2 border-gray-800 rounded-full mx-auto"></div>
      
      <!-- Spinning ring -->
      <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
      
      <!-- Inner pulse -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
    </div>
    
    <!-- Loading Text -->
    <h2 class="text-xl font-semibold text-white mb-2">
      Authenticating
    </h2>
    <p class="text-gray-400 text-sm animate-pulse">
      Verifying your credentials...
    </p>
    
    <!-- Progress dots -->
    <div class="flex justify-center mt-6 space-x-1">
      <div class="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style="animation-delay: 0ms"></div>
      <div class="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style="animation-delay: 150ms"></div>
      <div class="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style="animation-delay: 300ms"></div>
    </div>
  </div>
  
  <!-- Bottom fade effect -->
  <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
</div>

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
</style>
