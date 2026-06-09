<template>
  <main id="content" class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-white">API Access</h1>
      <div v-if="apiKeys" class="glass overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-white/5 bg-white/5">
              <th class="p-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Key Name</th>
              <th class="p-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Identifier</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="key in apiKeys" :key="key.id" class="border-b border-white/5">
              <td class="p-4 text-sm text-white">{{ key.name }}</td>
              <td class="p-4 text-sm text-neutral-400 font-mono">{{ key.id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const apiKeys = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await api.get('/admin/apikeys', { headers: { Accept: 'application/json' } })
    apiKeys.value = res.data.apiKeys
  } catch (e) {
    console.error(e)
  }
})
</script>
