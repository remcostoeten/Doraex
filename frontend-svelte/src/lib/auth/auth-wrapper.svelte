<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth';
  import LoginForm from './login-form.svelte';
  import RegisterForm from './register-form.svelte';
  import ThemeToggle from '../components/theme-toggle.svelte';

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

<div class="min-h-screen bg-light-secondary dark:bg-dark-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <div class="flex justify-center items-center">
      <div class="bg-blue-600 dark:bg-blue-500 rounded-lg p-3 mr-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7l8-4 8 4M4 7l8 4 8-4M12 11v10"/>
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-light-primary dark:text-dark-primary">
        Database Explorer
      </h1>
      <div class="ml-auto">
        <ThemeToggle />
      </div>
    </div>
    <p class="mt-2 text-center text-sm text-light-secondary dark:text-dark-secondary">
      Professional database management made simple
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-light-primary dark:bg-dark-secondary py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-light-primary dark:border-dark-primary">
      {#if currentMode === 'login'}
        <LoginForm />
        <div class="mt-6 text-center">
          <p class="text-sm text-light-secondary dark:text-dark-secondary">
            Don't have an account?
            <button 
              on:click={switchMode}
              class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      {:else}
        <RegisterForm />
        <div class="mt-6 text-center">
          <p class="text-sm text-light-secondary dark:text-dark-secondary">
            Already have an account?
            <button 
              on:click={switchMode}
              class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      {/if}
    </div>
  </div>

  <div class="mt-8 text-center space-y-4">
    <p class="text-xs text-light-tertiary dark:text-dark-tertiary">
      © 2024 Database Explorer. All rights reserved.
    </p>
  </div>
</div>
