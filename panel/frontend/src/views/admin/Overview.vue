<template>
  <main id="content" class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold text-white">System Overview</h1>
        <p class="text-neutral-400">Manage and monitor your panel infrastructure.</p>
      </div>

      <div v-if="stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass p-6">
          <p class="text-xs font-bold text-neutral-500 uppercase tracking-widest">Users</p>
          <h2 class="text-2xl font-bold text-white">{{ stats.usersTotal }}</h2>
        </div>
        <div class="glass p-6">
          <p class="text-xs font-bold text-neutral-500 uppercase tracking-widest">Nodes</p>
          <h2 class="text-2xl font-bold text-white">{{ stats.nodesTotal }}</h2>
        </div>
        <div class="glass p-6">
          <p class="text-xs font-bold text-neutral-500 uppercase tracking-widest">Instances</p>
          <h2 class="text-2xl font-bold text-white">{{ stats.instancesTotal }}</h2>
        </div>
        <div class="glass p-6">
          <p class="text-xs font-bold text-neutral-500 uppercase tracking-widest">Requests</p>
          <h2 class="text-2xl font-bold text-white">{{ stats.totalRequests }}</h2>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const stats = ref<any>(null)

onMounted(async () => {
  try {
    const res = await api.get('/admin/overview', { headers: { Accept: 'application/json' } })
    stats.value = res.data
  } catch (e) {
    console.error('Failed to load admin stats', e)
  }
})
</script>
