<template>
  <main id="content" class="p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <header class="mb-12">
        <h1 class="text-4xl font-black text-white tracking-tight">Deploy New Instance</h1>
        <p class="text-neutral-400 mt-2 font-medium">Select a template and node to launch your server instantly.</p>
      </header>

      <div v-if="formData" class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl">
        <form @submit.prevent="handleDeploy" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Instance Name</label>
              <input v-model="name" type="text" class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="e.g. My Website">
            </div>
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Software Template</label>
              <select v-model="template" class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none transition-all">
                <option value="">-- Choose Template --</option>
                <option v-for="t in formData.templates" :key="t.filename" :value="t.filename">
                  {{ t.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Select Node</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <p v-if="formData.nodes.length === 0" class="col-span-full text-red-400 text-sm italic">No online nodes available at this time.</p>
              <label v-for="node in formData.nodes" :key="node.id" class="cursor-pointer group">
                <input v-model="nodeId" type="radio" name="nodeId" :value="node.id" class="peer sr-only">
                <div class="p-5 rounded-3xl bg-white/5 border border-white/10 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all group-hover:bg-white/[0.08]">
                  <p class="font-bold text-white group-hover:text-blue-400 transition-colors">{{ node.name }}</p>
                  <p class="text-[10px] text-neutral-500 uppercase mt-1 font-black">{{ node.location }}</p>
                </div>
              </label>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-3">
              <span>DEPLOY INSTANCE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const formData = ref<any>(null)
const name = ref('')
const template = ref('')
const nodeId = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/dashboard/create', { headers: { Accept: 'application/json' } })
    formData.value = res.data
  } catch (e) {
    console.error(e)
  }
})

async function handleDeploy() {
  if (!name.value || !template.value || !nodeId.value) return alert('All fields required')
  try {
    const res = await api.post('/dashboard/create', { name: name.value, template: template.value, nodeId: nodeId.value })
    if (res.data.success) {
      router.push('/instances')
    }
  } catch (e: any) {
    alert(e.response?.data?.error || 'Deploy failed')
  }
}
</script>
