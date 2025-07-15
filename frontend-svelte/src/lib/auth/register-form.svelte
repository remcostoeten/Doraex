<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { authStore } from '../stores/auth';
  import type { TRegisterData } from '../types';

  let formData: TRegisterData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  let formErrors: Record<string, string> = {};
  let showPassword = false;
  let showConfirmPassword = false;

  $: authState = $authStore;

  function validateForm(): boolean {
    formErrors = {};
    
    if (!formData.name.trim()) {
      formErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      formErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      formErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      formErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      formErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      formErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      formErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      formErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
    }
    
    return Object.keys(formErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    
    const result = await authStore.register(formData);
    
    if (result.success) {
      // Show success feedback and clear form
      formData = {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      };
      formErrors = {};
      // The RouteGuard will automatically redirect since auth state changed
    }
    // Error handling is done by the auth store and displayed via authState.error
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
    <Label for="name" class="text-white">Full Name</Label>
    <Input
      id="name"
      type="text"
      bind:value={formData.name}
      on:input={clearErrors}
      class="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white focus:ring-white {formErrors.name ? 'border-red-500' : ''}"
      placeholder="Enter your full name"
      required
      autocomplete="name"
    />
    {#if formErrors.name}
      <p class="text-sm text-red-400">{formErrors.name}</p>
    {/if}
  </div>

  <div class="space-y-2">
    <Label for="email" class="text-white">Email</Label>
    <Input
      id="email"
      type="email"
      bind:value={formData.email}
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
        bind:value={formData.password}
        on:input={clearErrors}
        class="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white focus:ring-white pr-10 {formErrors.password ? 'border-red-500' : ''}"
        placeholder="Create a strong password"
        required
        autocomplete="new-password"
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
    <p class="text-xs text-gray-400">
      Must contain uppercase, lowercase, and number (8+ characters)
    </p>
  </div>

  <div class="space-y-2">
    <Label for="confirmPassword" class="text-white">Confirm Password</Label>
    <div class="relative">
      <Input
        id="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        bind:value={formData.confirmPassword}
        on:input={clearErrors}
        class="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white focus:ring-white pr-10 {formErrors.confirmPassword ? 'border-red-500' : ''}"
        placeholder="Confirm your password"
        required
        autocomplete="new-password"
      />
      <button
        type="button"
        on:click={() => showConfirmPassword = !showConfirmPassword}
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
      >
        {#if showConfirmPassword}
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
    {#if formErrors.confirmPassword}
      <p class="text-sm text-red-400">{formErrors.confirmPassword}</p>
    {/if}
  </div>

  <div class="flex items-start space-x-2 text-sm">
    <input id="terms" type="checkbox" required class="mt-1 rounded border-gray-600 bg-gray-900 text-white">
    <label for="terms" class="text-gray-400 leading-relaxed">
      I agree to the 
      <button type="button" class="text-white hover:text-gray-300 underline">Terms of Service</button>
      and 
      <button type="button" class="text-white hover:text-gray-300 underline">Privacy Policy</button>
    </label>
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
      Creating Account...
    {:else}
      Create Account
    {/if}
  </Button>
</form>
