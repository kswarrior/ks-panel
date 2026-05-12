<template>
  <div class="h-full group" :class="{ 'collapsed': sidebarCollapsed }">
    <!-- Sidebar -->
    <aside id="pc-sidebar" :style="{ width: sidebarCollapsed ? '5rem' : '16rem' }" class="sidebar transition-all duration-300 ease-in-out fixed inset-y-0 z-50 flex flex-col lg:w-64 glass border-r border-white/5" :class="{ 'open': mobileSidebarOpen }">
      <div class="flex flex-col h-full">
        <!-- User Profile -->
        <div v-if="user" class="p-6 border-b border-white/5">
          <div class="flex items-center gap-4">
            <div class="relative">
              <img class="w-10 h-10 rounded-xl object-cover border border-white/10" :src="`https://mc-heads.net/avatar/${user.username}/64`" alt="Profile">
              <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full"></div>
            </div>
            <div class="flex flex-col overflow-hidden transition-all duration-300" :class="{ 'w-0 opacity-0': sidebarCollapsed }">
              <span class="text-sm font-bold text-white truncate">{{ user.username }}</span>
              <span class="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">{{ userRole }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          <div>
            <p class="px-4 mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]" :class="{ 'hidden': sidebarCollapsed }">Main</p>
            <router-link to="/instances" class="nav-link group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white" active-class="active">
               <svg class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
               <span :class="{ 'hidden': sidebarCollapsed }">Instances</span>
            </router-link>
          </div>

          <div v-if="permissions.anyAdmin" class="space-y-4">
             <p class="px-4 mb-2 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]" :class="{ 'hidden': sidebarCollapsed }">Administration</p>
             <router-link v-if="permissions.manage_users" to="/admin/users" class="nav-link group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white" active-class="active">
                <svg class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span :class="{ 'hidden': sidebarCollapsed }">Users</span>
             </router-link>
             <router-link v-if="permissions.manage_nodes" to="/admin/nodes/overview" class="nav-link group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white" active-class="active">
                <svg class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                </svg>
                <span :class="{ 'hidden': sidebarCollapsed }">Nodes</span>
             </router-link>
          </div>
        </nav>

        <!-- Bottom Actions -->
        <div v-if="user" class="p-4 mt-auto border-t border-white/5">
           <div class="flex items-center justify-between gap-2" :class="{ 'flex-col items-center': sidebarCollapsed }">
              <router-link to="/account" class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all" :class="{ 'hidden': sidebarCollapsed }">
                 <span>Account</span>
              </router-link>
              <a href="/auth/logout" class="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="Logout">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                 </svg>
              </a>
           </div>
        </div>
      </div>
    </aside>

    <!-- Main Layout -->
    <div id="colcont" class="transition-all duration-300 ease-in-out" :style="{ paddingLeft: isLargeScreen ? (sidebarCollapsed ? '5rem' : '16rem') : '0' }">
       <header class="fixed top-0 z-40 h-16 glass border-b border-white/5 px-4 sm:px-6 lg:px-8 flex items-center justify-between" :style="{ left: isLargeScreen ? (sidebarCollapsed ? '5rem' : '16rem') : '0', right: '0' }">
          <div class="flex items-center gap-4">
             <button @click="mobileSidebarOpen = !mobileSidebarOpen" class="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
             </button>
             <button @click="toggleSidebar" class="hidden lg:flex p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path v-if="!sidebarCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                   <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
             </button>
             <div class="flex items-center gap-2 sm:gap-3">
                <img :src="settings.logo || '/assets/logo.webp'" class="w-6 h-6 sm:w-7 sm:h-7 object-contain" alt="Logo">
                <h1 class="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[100px] sm:max-w-none">{{ settings.name }}</h1>
             </div>
          </div>
       </header>

       <div id="page-container" class="relative theme-typography pt-16">
          <slot></slot>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  user: any,
  permissions: any,
  settings: any
}>()

const sidebarCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
const mobileSidebarOpen = ref(false)
const isLargeScreen = ref(window.innerWidth >= 1024)

const userRole = computed(() => {
  if (!props.user) return ''
  return props.user.owner ? 'Owner' : (props.user.admin ? 'Administrator' : 'User')
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebar-collapsed', sidebarCollapsed.value.toString())
}

function handleResize() {
  isLargeScreen.value = window.innerWidth >= 1024
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
