<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import DatabaseExplorer from '$lib/database-explorer.svelte';
  import UserProfile from '$lib/auth/user-profile.svelte';
</script>

<svelte:head>
  <title>Database Explorer</title>
  <meta name="description" content="Modern database management and exploration tool" />
</svelte:head>

<!-- Vercel-style Navigation -->
<nav class="border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
  <div class="container mx-auto px-6">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="h-8 w-8 rounded-md bg-white flex items-center justify-center">
          <svg class="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7l8-4 8 4M4 7l8 4 8-4M12 11v10"/>
          </svg>
        </div>
        <span class="text-lg font-semibold text-white">Database Explorer</span>
      </div>
      
      <UserProfile />
    </div>
  </div>
</nav>

<!-- Hero Section -->
<section class="relative overflow-hidden py-20">
  <!-- Grid Background -->
  <div class="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
  
  <div class="relative container mx-auto px-6 text-center">
    <h1 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
      Modern Database
      <br class="hidden md:block" />
      Management
    </h1>
    <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
      Connect, explore, and manage your databases with a clean, intuitive interface. 
      Built for developers who value simplicity and performance.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" class="bg-white text-black hover:bg-gray-200 font-medium">
        Start Exploring
      </Button>
      <Button variant="outline" size="lg" class="border-gray-700 text-white hover:bg-gray-900 font-medium">
        View Documentation
      </Button>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="py-16">
  <div class="container mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card class="bg-gray-950/50 border-gray-800 hover:border-gray-700 transition-colors">
        <CardHeader>
          <div class="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
            <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <CardTitle class="text-white">Multi-Database</CardTitle>
          <CardDescription class="text-gray-400 leading-relaxed">
            Native support for SQLite and PostgreSQL with intelligent connection pooling and management.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card class="bg-gray-950/50 border-gray-800 hover:border-gray-700 transition-colors">
        <CardHeader>
          <div class="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
            <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-10a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <CardTitle class="text-white">Secure by Design</CardTitle>
          <CardDescription class="text-gray-400 leading-relaxed">
            JWT-based authentication, encrypted connections, and comprehensive access controls.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card class="bg-gray-950/50 border-gray-800 hover:border-gray-700 transition-colors">
        <CardHeader>
          <div class="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
            <svg class="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <CardTitle class="text-white">Lightning Fast</CardTitle>
          <CardDescription class="text-gray-400 leading-relaxed">
            Built with modern web technologies for instant responsiveness and smooth interactions.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>
</section>

<!-- Main Application -->
<section class="py-8">
  <div class="container mx-auto px-6">
    <DatabaseExplorer />
  </div>
</section>
