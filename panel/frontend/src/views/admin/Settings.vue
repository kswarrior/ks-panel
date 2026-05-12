<template>
  <main id="content" class="p-4 sm:p-8">
    <div v-if="settings" class="max-w-7xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-white">General Settings</h1>
      <div class="glass p-6 space-y-4">
         <div>
            <label class="block text-sm font-medium text-neutral-400 mb-1">Panel Name</label>
            <input v-model="settings.name" type="text" class="w-full">
         </div>
         <button @click="saveSettings" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Save Changes</button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const settings = ref<any>(null)

onMounted(async () => {
  try {
    const res = await api.get('/admin/settings', { headers: { Accept: 'application/json' } })
    settings.value = res.data.settings
  } catch (e) {
    console.error(e)
  }
})

async function saveSettings() {
  try {
    await api.post('/admin/settings', settings.value)
    alert('Settings saved')
  } catch (e) {
    alert('Save failed')
  }
}
</script>
