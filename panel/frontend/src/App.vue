<template>
  <Layout v-if="initialized" :user="user" :permissions="permissions" :settings="settings">
    <router-view v-if="user"></router-view>
    <div v-else>
       <!-- Auth views will be here if we move them to SPA -->
       <router-view></router-view>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Layout from './components/Layout.vue'
import api from './services/api'

const user = ref(null)
const permissions = ref({})
const settings = ref({ name: 'KS Panel' })
const initialized = ref(false)

onMounted(async () => {
  try {
    const [meRes, settingsRes] = await Promise.all([
      api.get('/me').catch(() => ({ data: { user: null } })),
      api.get('/settings')
    ])
    user.value = meRes.data.user
    permissions.value = meRes.data.permissions || {}
    settings.value = settingsRes.data
  } catch (e) {
    console.error('Initialization failed', e)
  } finally {
    initialized.value = true
  }
})
</script>
