<template>
  <main id="content" class="p-4 sm:p-8">
    <div v-if="startupData" class="max-w-7xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-white">Startup Settings</h1>
      <div class="glass p-6">
         <!-- Simplified startup view -->
         <p class="text-neutral-400">Manage startup command and variables.</p>
         <div class="mt-4">
            <label class="block text-sm font-medium text-neutral-400 mb-1">Startup Command</label>
            <input :value="startupData.startup" type="text" class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white">
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
const startupData = ref<any>(null)

onMounted(async () => {
  try {
    const res = await api.get(`/instance/${route.params.id}/startup`, { headers: { Accept: 'application/json' } })
    startupData.value = res.data
  } catch (e) {
    console.error(e)
  }
})
</script>
