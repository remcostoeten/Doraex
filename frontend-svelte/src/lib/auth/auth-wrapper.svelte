<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { authStore } from '../stores/auth';
  import LoginForm from './login-form.svelte';
  import RegisterForm from './register-form.svelte';

  export let initialMode: 'login' | 'register' = 'login';
  
  let currentMode = initialMode;
  
  $: authState = $authStore;

  onMount(() => {
    authStore.initialize();
  });

  function switchMode() {
    currentMode = currentMode === 'login' ? 'register' : 'login';
    authStore.clearError();
  }
</script>

<!-- Vercel-style Auth Page -->
<div class="min-h-screen bg-black flex flex-col">
  <!-- Subtle Grid Background -->
  <div class="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
  
  <div class="relative flex flex-col justify-center flex-1 px-6 py-12 lg:px-8">
    <!-- Header -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-8">
        <div class="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
          <svg class="h-7 w-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7l8-4 8 4M4 7l8 4 8-4M12 11v10"/>
          </svg>
        </div>
      </div>
      
      <h1 class="text-3xl font-bold text-center text-white mb-2">
        {currentMode === 'login' ? 'Welcome back' : 'Create account'}
      </h1>
      <p class="text-center text-gray-400 text-sm">
        {currentMode === 'login' 
          ? 'Sign in to your account to continue'
          : 'Get started with Database Explorer'
        }
      </p>
    </div>

    <!-- Auth Form -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-gray-950/50 border border-gray-800 rounded-xl px-8 py-8 backdrop-blur">
        {#if currentMode === 'login'}
          <LoginForm />
        {:else}
          <RegisterForm />
        {/if}
        
        <!-- Mode Switcher -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-800"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-gray-950 px-3 text-gray-400">or</span>
            </div>
          </div>
          
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-400">
              {currentMode === 'login' ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button 
              variant="ghost"
              class="mt-2 text-white hover:bg-gray-900 font-medium"
              on:click={switchMode}
            >
              {currentMode === 'login' ? 'Create account' : 'Sign in'}
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Demo Credentials -->
      {#if currentMode === 'login'}
        <div class="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h3 class="text-sm font-medium text-blue-400 mb-2">Demo Credentials</h3>
          <div class="text-xs text-blue-300/80 space-y-1">
            <p><strong>Email:</strong> admin@example.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center">
      <p class="text-xs text-gray-500">
        © 2024 Database Explorer. Built with security in mind.
      </p>
    </div>
  </div>
</div>
