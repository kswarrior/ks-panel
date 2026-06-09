<template>
  <main id="content" class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Nodes</h1>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="node in nodes" :key="node.id" class="glass p-6 space-y-4">
           <div class="flex items-center justify-between">
              <h3 class="font-bold text-white">{{ node.name }}</h3>
              <span :class="node.status === 'Online' ? 'text-emerald-400' : 'text-red-400'" class="text-xs font-bold uppercase">{{ node.status }}</span>
           </div>
           <p class="text-sm text-neutral-400 font-mono">{{ node.address }}:{{ node.port }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const nodes = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await api.get('/admin/nodes/overview', { headers: { Accept: 'application/json' } })
    nodes.value = res.data.nodes
  } catch (e) {
    console.error('Failed to load nodes', e)
  }
})
</script>
