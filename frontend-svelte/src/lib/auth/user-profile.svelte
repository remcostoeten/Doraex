<script lang="ts">
  import { authStore } from '../stores/auth';
  
  let showDropdown = false;
  
  $: authState = $authStore;
  $: user = authState.user;

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function closeDropdown() {
    showDropdown = false;
  }

  async function handleLogout(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    closeDropdown();
    console.log('Attempting to logout...');
    try {
      await authStore.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
</script>

<svelte:window on:click={closeDropdown} />

{#if user}
  <div class="relative">
    <button
      on:click|stopPropagation={toggleDropdown}
      class="flex items-center space-x-3 p-2 rounded-lg hover:bg-light-tertiary dark:hover:bg-dark-tertiary transition-colors"
    >
      <div class="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {getInitials(user.name)}
      </div>
      <div class="text-left">
        <p class="text-sm font-medium text-light-primary dark:text-dark-primary">{user.name}</p>
        <p class="text-xs text-light-secondary dark:text-dark-secondary">{user.email}</p>
      </div>
      <svg 
        class="w-4 h-4 text-light-tertiary dark:text-dark-tertiary transition-transform {showDropdown ? 'rotate-180' : ''}" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    {#if showDropdown}
      <div class="absolute right-0 mt-2 w-48 bg-light-primary dark:bg-dark-secondary rounded-md shadow-lg ring-1 ring-light-primary dark:ring-dark-primary ring-opacity-5 z-50 border border-light-primary dark:border-dark-primary">
        <div class="py-1">
          <div class="px-4 py-2 border-b border-light-primary dark:border-dark-primary">
            <p class="text-sm font-medium text-light-primary dark:text-dark-primary">{user.name}</p>
            <p class="text-xs text-light-secondary dark:text-dark-secondary">{user.email}</p>
            {#if user.role}
              <span class="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {user.role}
              </span>
            {/if}
          </div>
          
          <button
            on:click|stopPropagation={() => {}}
            class="w-full text-left px-4 py-2 text-sm text-light-primary dark:text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary flex items-center"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Profile Settings
          </button>
          
          <button
            on:click|stopPropagation={() => {}}
            class="w-full text-left px-4 py-2 text-sm text-light-primary dark:text-dark-primary hover:bg-light-tertiary dark:hover:bg-dark-tertiary flex items-center"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Preferences
          </button>
          
          <div class="border-t border-light-primary dark:border-dark-primary">
            <button
              on:click|stopPropagation={handleLogout}
              class="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
