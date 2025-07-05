<script lang="ts">
  import { authStore } from '../stores/auth';
  import type { TLoginCredentials } from '../types';

  let credentials: TLoginCredentials = {
    email: '',
    password: ''
  };

  let formErrors: Record<string, string> = {};
  let showPassword = false;

  $: authState = $authStore;

  function validateForm(): boolean {
    formErrors = {};
    
    if (!credentials.email.trim()) {
      formErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      formErrors.email = 'Please enter a valid email address';
    }
    
    if (!credentials.password) {
      formErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
    }
    
    return Object.keys(formErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    
    await authStore.login(credentials);
  }

  function clearErrors() {
    authStore.clearError();
    formErrors = {};
  }
</script>

<div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-gray-900 text-center">Sign In</h2>
    <p class="mt-2 text-sm text-gray-600 text-center">
      Welcome back! Please sign in to your account.
    </p>
  </div>

  {#if authState.error}
    <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <p class="text-sm text-red-700">{authState.error}</p>
        <button 
          on:click={clearErrors}
          class="ml-auto text-red-400 hover:text-red-600"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        Email Address
      </label>
      <input
        id="email"
        type="email"
        bind:value={credentials.email}
        on:input={clearErrors}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {formErrors.email ? 'border-red-500' : ''}"
        placeholder="Enter your email"
        required
        autocomplete="email"
      />
      {#if formErrors.email}
        <p class="mt-1 text-sm text-red-600">{formErrors.email}</p>
      {/if}
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label>
      <div class="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          bind:value={credentials.password}
          on:input={clearErrors}
          class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {formErrors.password ? 'border-red-500' : ''}"
          placeholder="Enter your password"
          required
          autocomplete="current-password"
        />
        <button
          type="button"
          on:click={() => showPassword = !showPassword}
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          {#if showPassword}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
            </svg>
          {/if}
        </button>
      </div>
      {#if formErrors.password}
        <p class="mt-1 text-sm text-red-600">{formErrors.password}</p>
      {/if}
    </div>

    <div class="flex items-center justify-between">
      <label class="flex items-center">
        <input type="checkbox" class="mr-2 rounded">
        <span class="text-sm text-gray-600">Remember me</span>
      </label>
      <button
        type="button"
        class="text-sm text-blue-600 hover:text-blue-500"
      >
        Forgot password?
      </button>
    </div>

    <button
      type="submit"
      disabled={authState.isLoading}
      class="w-full px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {#if authState.isLoading}
        <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Signing In...
      {:else}
        Sign In
      {/if}
    </button>
  </form>

  <div class="mt-6 text-center">
    <p class="text-sm text-gray-600">
      Don't have an account?
      <button class="text-blue-600 hover:text-blue-500 font-medium">
        Sign up
      </button>
    </p>
  </div>
</div>
