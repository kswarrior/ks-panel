<template>
  <main id="content">
    <div class="flex items-center justify-between px-4 sm:px-8 pt-4 flex-wrap gap-4">
      <h1 class="text-base font-medium text-white">Instances</h1>
    </div>
    <div class="px-4 sm:px-6 lg:px-8 mt-8">
      <div v-if="instances.length === 0" class="text-center mt-32 sm:mt-64 px-4">
        <h3 class="mt-4 text-md font-medium text-white">No Instances</h3>
      </div>
      <div v-else class="instances-container grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6">
        <div v-for="instance in instances" :key="instance.Id" class="instance-card group cursor-pointer bg-white/5 rounded-2xl p-5 border border-white/10 hover:bg-white/[0.08] transition-all duration-300">
           <h3 class="font-semibold text-white text-base">{{ instance.Name }}</h3>
           <p class="text-xs text-neutral-400">{{ instance.Id }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'

const instances = ref<any[]>([])

onMounted(async () => {
  try {
    const response = await api.get('/instances')
    instances.value = response.data
  } catch (error) {
    console.error('Failed to fetch instances:', error)
  }
})
</script>
