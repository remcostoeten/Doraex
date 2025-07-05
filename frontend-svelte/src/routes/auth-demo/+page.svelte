<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Separator } from '$lib/components/ui/separator';
  import AuthWrapper from '$lib/auth/auth-wrapper.svelte';
  import UserProfile from '$lib/auth/user-profile.svelte';
  import { authStore } from '$lib/stores/auth';

  $: authState = $authStore;
  $: isAuthenticated = authState.isAuthenticated;
</script>

<svelte:head>
  <title>Authentication Demo - Database Explorer</title>
</svelte:head>

{#if isAuthenticated}
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <header class="border-b border-gray-800">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 rounded-md bg-green-500 flex items-center justify-center">
              <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-semibold text-white">Authentication Demo</h1>
              <p class="text-sm text-gray-400">Secure session management</p>
            </div>
          </div>
          <UserProfile />
        </div>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Success Banner -->
        <Card class="bg-green-500/10 border-green-500/20">
          <CardHeader>
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <CardTitle class="text-green-400">Authentication Successful</CardTitle>
                <CardDescription class="text-green-300/80">
                  You are successfully authenticated and can access protected resources.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <!-- User Information -->
        <Card class="bg-gray-950/50 border-gray-800">
          <CardHeader>
            <CardTitle class="text-white">User Information</CardTitle>
            <CardDescription class="text-gray-400">
              Current session details and user profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {#if authState.user}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1">
                  <p class="text-sm text-gray-400">Name</p>
                  <p class="text-white font-medium">{authState.user.name}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm text-gray-400">Email</p>
                  <p class="text-white font-medium">{authState.user.email}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm text-gray-400">User ID</p>
                  <p class="text-white font-medium font-mono text-sm">{authState.user.id}</p>
                </div>
                {#if authState.user.role}
                  <div class="space-y-1">
                    <p class="text-sm text-gray-400">Role</p>
                    <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {authState.user.role}
                    </span>
                  </div>
                {/if}
                <div class="space-y-1">
                  <p class="text-sm text-gray-400">Member Since</p>
                  <p class="text-white">{new Date(authState.user.created_at).toLocaleDateString()}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm text-gray-400">Last Updated</p>
                  <p class="text-white">{new Date(authState.user.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            {/if}
          </CardContent>
        </Card>

        <!-- Session Status -->
        <Card class="bg-gray-950/50 border-gray-800">
          <CardHeader>
            <CardTitle class="text-white">Session Status</CardTitle>
            <CardDescription class="text-gray-400">
              Authentication and token information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="h-2 w-2 bg-green-400 rounded-full"></div>
                <span class="text-white">Authenticated</span>
              </div>
              {#if authState.tokens}
                <div class="flex items-center space-x-3">
                  <div class="h-2 w-2 bg-blue-400 rounded-full"></div>
                  <span class="text-white">Valid access token</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="h-2 w-2 bg-blue-400 rounded-full"></div>
                  <span class="text-white">Token type: {authState.tokens.token_type}</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="h-2 w-2 bg-yellow-400 rounded-full"></div>
                  <span class="text-white">
                    Expires in: {Math.floor(authState.tokens.expires_in / 3600)} hours
                  </span>
                </div>
              {/if}
            </div>
          </CardContent>
        </Card>

        <!-- Actions -->
        <Card class="bg-gray-950/50 border-gray-800">
          <CardContent class="pt-6">
            <div class="flex flex-col sm:flex-row gap-4">
              <Button asChild class="bg-white text-black hover:bg-gray-200">
                <a href="/">Go to Database Explorer</a>
              </Button>
              <Button 
                variant="outline" 
                class="border-gray-700 text-white hover:bg-gray-900"
                on:click={() => authStore.logout()}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
{:else}
  <AuthWrapper initialMode="login" />
{/if}
