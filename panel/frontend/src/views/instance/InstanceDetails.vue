<template>
  <main v-if="instance" id="content" class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">{{ instance.Name }}</h1>
          <p class="text-neutral-400 font-mono text-sm">{{ instance.Id }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Console -->
        <div class="lg:col-span-2 glass p-6 min-h-[400px] flex flex-col">
          <h3 class="text-lg font-bold text-white mb-4">Console</h3>
          <div ref="terminal" class="flex-1 bg-black rounded-lg overflow-hidden"></div>
        </div>

        <!-- Sidebar Stats -->
        <div class="space-y-6">
           <div class="glass p-6">
              <h3 class="text-lg font-bold text-white mb-4">Status</h3>
              <p class="text-white">{{ instance.InternalState }}</p>
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
const instance = ref<any>(null)
const terminal = ref(null)

onMounted(async () => {
  try {
    const res = await api.get(`/instance/${route.params.id}`, { headers: { Accept: 'application/json' } })
    instance.value = res.data.instance
  } catch (e) {
    console.error('Failed to load instance', e)
  }
})
</script>
