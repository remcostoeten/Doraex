<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
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

<!-- Clean form without wrapper - wrapper styling is handled by AuthWrapper -->
{#if authState.error}
  <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
    <div class="flex items-center">
      <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <p class="text-sm text-red-300">{authState.error}</p>
      <button 
        on:click={clearErrors}
        class="ml-auto text-red-400 hover:text-red-300"
        aria-label="Close error message"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  </div>
{/if}

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div class="space-y-2">
    <Label for="email" class="text-white">Email</Label>
    <Input
      id="email"
      type="email"
      bind:value={credentials.email}
      on:input={clearErrors}
      class="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white focus:ring-white {formErrors.email ? 'border-red-500' : ''}"
      placeholder="Enter your email"
      required
      autocomplete="email"
    />
    {#if formErrors.email}
      <p class="text-sm text-red-400">{formErrors.email}</p>
    {/if}
  </div>

  <div class="space-y-2">
    <Label for="password" class="text-white">Password</Label>
    <div class="relative">
      <Input
        id="password"
        type={showPassword ? 'text' : 'password'}
        bind:value={credentials.password}
        on:input={clearErrors}
        class="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white focus:ring-white pr-10 {formErrors.password ? 'border-red-500' : ''}"
        placeholder="Enter your password"
        required
        autocomplete="current-password"
      />
      <button
        type="button"
        on:click={() => showPassword = !showPassword}
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
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
      <p class="text-sm text-red-400">{formErrors.password}</p>
    {/if}
  </div>

  <div class="flex items-center justify-between text-sm">
    <label class="flex items-center text-gray-400">
      <input type="checkbox" class="mr-2 rounded border-gray-600 bg-gray-900">
      Remember me
    </label>
    <button
      type="button"
      class="text-gray-400 hover:text-white transition-colors"
    >
      Forgot password?
    </button>
  </div>

  <Button
    type="submit"
    disabled={authState.isLoading}
    class="w-full bg-white text-black hover:bg-gray-200 font-medium"
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
  </Button>
</form>
