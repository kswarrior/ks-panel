<template>
  <main id="content" class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-white">Notifications</h1>
      <div v-if="users" class="glass p-6">
         <p class="text-neutral-400">Send notifications to users.</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const users = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await api.get('/admin/notifications', { headers: { Accept: 'application/json' } })
    users.value = res.data.users
  } catch (e) {
    console.error(e)
  }
})
</script>
