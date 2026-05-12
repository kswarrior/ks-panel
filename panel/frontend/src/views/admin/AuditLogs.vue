<template>
  <main id="content" class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-white">Audit Logs</h1>
      <div v-if="auditData" class="glass overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-white/5 bg-white/5">
              <th class="p-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">User</th>
              <th class="p-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Action</th>
              <th class="p-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">IP</th>
              <th class="p-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in auditData.audits" :key="log.timestamp" class="border-b border-white/5">
              <td class="p-4 text-sm text-white">{{ log.username }}</td>
              <td class="p-4 text-sm text-neutral-400">{{ log.action }}</td>
              <td class="p-4 text-sm text-neutral-400">{{ log.ip }}</td>
              <td class="p-4 text-sm text-neutral-400">{{ new Date(log.timestamp).toLocaleString() }}</td>
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

const auditData = ref<any>(null)

onMounted(async () => {
  try {
    const res = await api.get('/admin/auditlogs', { headers: { Accept: 'application/json' } })
    auditData.value = res.data
  } catch (e) {
    console.error(e)
  }
})
</script>
