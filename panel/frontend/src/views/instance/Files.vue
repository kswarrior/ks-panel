<template>
  <main id="content" class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Files</h1>
      </div>
      <div class="glass overflow-hidden">
        <div v-for="file in files" :key="file.name" class="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors">
           <div class="flex items-center gap-3">
              <span class="text-xl">{{ file.isDirectory ? '📁' : '📄' }}</span>
              <span class="text-sm text-white font-medium">{{ file.name }}</span>
           </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const files = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await api.get(`/instance/${route.params.id}/files`, { headers: { Accept: 'application/json' } })
    files.value = res.data.files
  } catch (e) {
    console.error('Failed to load files', e)
  }
})
</script>
