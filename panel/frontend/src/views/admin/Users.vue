<template>
  <main id="content" class="p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Users</h1>
      </div>
      <div class="glass overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-white/5 bg-white/5">
              <th class="p-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Username</th>
              <th class="p-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Email</th>
              <th class="p-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.userId" class="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td class="p-4 text-sm text-white font-medium">{{ user.username }}</td>
              <td class="p-4 text-sm text-neutral-400">{{ user.email }}</td>
              <td class="p-4 text-sm text-neutral-400">
                 {{ user.owner ? 'Owner' : (user.admin ? 'Admin' : 'User') }}
              </td>
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

const users = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await api.get('/admin/users', { headers: { Accept: 'application/json' } })
    users.value = res.data.users
  } catch (e) {
    console.error('Failed to load users', e)
  }
})
</script>
