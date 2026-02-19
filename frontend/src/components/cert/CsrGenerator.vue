<script setup lang="ts">
import { ref, reactive } from 'vue'
import { FileKey, Download, Copy, RefreshCcw, AlertTriangle } from 'lucide-vue-next'
import { useCrypto, type CSRData } from '../../composables/useCrypto'

const { generateCSR, isGenerating, error } = useCrypto()

const form = reactive<CSRData>({
  commonName: '',
  organization: '',
  organizationalUnit: '',
  city: '',
  state: '',
  country: 'US', // Default
  sans: [],
  keySize: 2048,
  algorithm: 'RSA',
  signatureAlg: 'SHA256'
})

const sanInput = ref('')
const result = ref<{ privateKeyPem: string, csrPem: string } | null>(null)

const addSan = () => {
  if (sanInput.value && !form.sans.includes(sanInput.value)) {
    form.sans.push(sanInput.value)
    sanInput.value = ''
  }
}

const removeSan = (san: string) => {
  form.sans = form.sans.filter(s => s !== san)
}

const generate = async () => {
  try {
    const res = await generateCSR({...form})
    result.value = {
      privateKeyPem: res.privateKeyPem,
      csrPem: res.csrPem
    }
  } catch (e) {
    console.error(e)
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  // detailed toast could go here
}

const download = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IN', 'JP', 'CN', 'BR'] // Simplified list
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white">CSR Generation</h2>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Form Card -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileKey class="w-5 h-5 text-blue-500" />
          Certificate Details
        </h3>
        
        <form @submit.prevent="generate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Common Name (Domain)</label>
            <input v-model="form.commonName" type="text" placeholder="example.com" required class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization</label>
              <input v-model="form.organization" type="text" placeholder="Acme Corp" required class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department (OU)</label>
              <input v-model="form.organizationalUnit" type="text" placeholder="IT" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City/Locality</label>
              <input v-model="form.city" type="text" required class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State/Province</label>
              <input v-model="form.state" type="text" required class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
             <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
             <select v-model="form.country" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none">
               <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
             </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SANs (Subject Alternative Names)</label>
            <div class="flex gap-2 mb-2">
               <input v-model="sanInput" @keydown.enter.prevent="addSan" type="text" placeholder="www.example.com" class="flex-1 px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
               <button type="button" @click="addSan" class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg text-sm font-medium transition-colors">Add</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="san in form.sans" :key="san" class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                {{ san }}
                <button @click="removeSan(san)" class="hover:text-red-500">&times;</button>
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Algorithm</label>
              <select v-model="form.algorithm" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="RSA">RSA</option>
                <!-- <option value="EC">ECDSA</option> Disabled for stability -->
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Size</label>
              <select v-model="form.keySize" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none">
                <option :value="2048">2048 bits</option>
                <option :value="4096">4096 bits</option>
              </select>
            </div>
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              :disabled="isGenerating"
              class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              <RefreshCcw v-if="isGenerating" class="w-5 h-5 animate-spin" />
              <span v-else>Generate CSR & Private Key</span>
            </button>
            <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
          </div>
        </form>
      </div>

      <!-- Result Card -->
      <div v-if="result" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full animate-fade-in">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download class="w-5 h-5 text-green-500" />
          Generated Files
        </h3>
        <div class="space-y-4 flex-1">
          <!-- CSR -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">CSR (Certificate Signing Request)</label>
              <div class="flex gap-2">
                <button @click="copyToClipboard(result.csrPem)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500" title="Copy"><Copy class="w-4 h-4" /></button>
                <button @click="download('request.csr', result.csrPem)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500" title="Download"><Download class="w-4 h-4" /></button>
              </div>
            </div>
            <textarea readonly :value="result.csrPem" class="w-full h-32 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-600 dark:text-slate-400 focus:outline-none resize-none"></textarea>
          </div>

          <!-- Private Key -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Private Key</label>
               <div class="flex gap-2">
                <button @click="copyToClipboard(result.privateKeyPem)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500" title="Copy"><Copy class="w-4 h-4" /></button>
                <button @click="download('private.key', result.privateKeyPem)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500" title="Download"><Download class="w-4 h-4" /></button>
              </div>
            </div>
            <textarea readonly :value="result.privateKeyPem" class="w-full h-32 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-600 dark:text-slate-400 focus:outline-none resize-none"></textarea>
          </div>
        </div>
      </div>
      
      <!-- Placeholder when no result -->
      <div v-else class="hidden lg:flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-slate-400 text-center">
        <div>
          <FileKey class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Fill out the form to generate your<br>CSR and Private Key</p>
        </div>
      </div>
    </div>
  </div>
</template>
