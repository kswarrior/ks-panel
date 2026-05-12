<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full glass p-8 space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white">Login</h1>
        <p class="text-neutral-400">Sign in to your account</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-400 mb-1">Username or Email</label>
          <input v-model="username" type="text" required class="w-full" placeholder="admin">
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-400 mb-1">Password</label>
          <input v-model="password" type="password" required class="w-full" placeholder="••••••••">
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Sign In</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '../services/api'

const username = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await api.post('/auth/login', { username: username.value, password: password.value })
    window.location.href = '/instances'
  } catch (e) {
    alert('Login failed')
  }
}
</script>
