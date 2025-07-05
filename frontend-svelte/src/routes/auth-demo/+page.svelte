<script lang="ts">
  import AuthWrapper from '$lib/auth/AuthWrapper.svelte';
  import UserProfile from '$lib/auth/UserProfile.svelte';
  import { authStore } from '$lib/stores/auth';

  $: authState = $authStore;
  $: isAuthenticated = authState.isAuthenticated;
</script>

<svelte:head>
  <title>Authentication Demo - Database Explorer</title>
</svelte:head>

{#if isAuthenticated}
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Authentication Demo</h1>
          <UserProfile />
        </div>
        
        <div class="space-y-6">
          <div class="bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <div>
                <h3 class="text-sm font-medium text-green-800">Authentication Successful</h3>
                <p class="mt-1 text-sm text-green-700">You are successfully authenticated and can access protected resources.</p>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-md p-4">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Current User Information</h3>
            {#if authState.user}
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Name</dt>
                  <dd class="mt-1 text-sm text-gray-900">{authState.user.name}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900">{authState.user.email}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">User ID</dt>
                  <dd class="mt-1 text-sm text-gray-900">{authState.user.id}</dd>
                </div>
                {#if authState.user.role}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Role</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {authState.user.role}
                      </span>
                    </dd>
                  </div>
                {/if}
                <div>
                  <dt class="text-sm font-medium text-gray-500">Created</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {new Date(authState.user.created_at).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {new Date(authState.user.updated_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            {/if}
          </div>

          <div class="bg-white border border-gray-200 rounded-md p-4">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Authentication Status</h3>
            <div class="space-y-2">
              <div class="flex items-center">
                <span class="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                <span class="text-sm text-gray-700">Authenticated</span>
              </div>
              {#if authState.tokens}
                <div class="flex items-center">
                  <span class="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                  <span class="text-sm text-gray-700">Valid access token</span>
                </div>
                <div class="flex items-center">
                  <span class="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                  <span class="text-sm text-gray-700">Token type: {authState.tokens.token_type}</span>
                </div>
                <div class="flex items-center">
                  <span class="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                  <span class="text-sm text-gray-700">
                    Expires in: {Math.floor(authState.tokens.expires_in / 3600)} hours
                  </span>
                </div>
              {/if}
            </div>
          </div>

          <div class="flex space-x-4">
            <a 
              href="/"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Database Explorer
            </a>
            <button
              on:click={() => authStore.logout()}
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <AuthWrapper initialMode="login" />
{/if}
