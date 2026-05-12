<template>
  <main id="content" class="min-h-screen pb-20 p-4 sm:p-8">
    <div v-if="userData" class="max-w-7xl mx-auto space-y-8">
       <!-- Account Settings Card -->
       <div class="glass p-6 sm:p-8 space-y-8">
          <div class="flex items-center justify-between border-b border-white/5 pb-4">
             <div class="flex items-center gap-3">
                <h2 class="text-xl font-bold text-white">Update Account</h2>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-600/30 text-neutral-400 border border-white/5">
                   {{ userData.username }}
                </span>
             </div>
             <span v-if="userData.twoFAEnabled" class="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                2FA Enabled
             </span>
          </div>

          <!-- Username Update -->
          <div class="space-y-4">
             <h3 class="text-sm font-bold text-neutral-500 uppercase tracking-widest">Profile Information</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label class="block text-sm font-medium text-neutral-300 mb-1">Username</label>
                   <input v-model="newUsername" type="text" class="w-full" :placeholder="userData.username">
                </div>
                <div>
                   <label class="block text-sm font-medium text-neutral-300 mb-1">Email (Locked)</label>
                   <input :value="userData.email" type="email" disabled class="w-full opacity-50 cursor-not-allowed">
                </div>
             </div>
             <button @click="updateUsername" :disabled="!newUsername || newUsername === userData.username" class="bg-white text-black px-6 py-2 rounded-lg font-bold disabled:opacity-50">
                Update Username
             </button>
          </div>

          <!-- Password Update -->
          <div class="pt-8 border-t border-white/5 space-y-4">
             <h3 class="text-sm font-bold text-neutral-500 uppercase tracking-widest">Security</h3>
             <div class="space-y-4 max-w-md">
                <div>
                   <label class="block text-sm font-medium text-neutral-300 mb-1">Current Password</label>
                   <input v-model="currentPassword" type="password" class="w-full">
                </div>
                <div>
                   <label class="block text-sm font-medium text-neutral-300 mb-1">New Password</label>
                   <input v-model="newPassword" type="password" class="w-full">
                </div>
             </div>
             <button @click="updatePassword" :disabled="!currentPassword || !newPassword" class="bg-white text-black px-6 py-2 rounded-lg font-bold disabled:opacity-50">
                Update Password
             </button>
          </div>
       </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'

const userData = ref<any>(null)
const newUsername = ref('')
const currentPassword = ref('')
const newPassword = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/account', { headers: { Accept: 'application/json' } })
    // In our refactored backend, /account returns { users }.
    // We actually need the current user, but App.vue already has it.
    // For this view, we'll fetch the specific details.
    const me = await api.get('/me')
    userData.value = me.data.user
  } catch (e) {
    console.error(e)
  }
})

async function updateUsername() {
  try {
    await api.post('/update-username', { currentUsername: userData.value.username, newUsername: newUsername.value })
    alert('Username updated. Logging out...')
    window.location.href = '/login'
  } catch (e: any) {
    alert(e.response?.data || 'Failed to update username')
  }
}

async function updatePassword() {
  try {
    await api.post('/change-password', { currentPassword: currentPassword.value, newPassword: newPassword.value })
    alert('Password updated. Logging out...')
    window.location.href = '/login'
  } catch (e: any) {
    alert(e.response?.data || 'Failed to update password')
  }
}
</script>
