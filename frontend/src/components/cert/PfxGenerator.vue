<script setup lang="ts">
import { ref } from 'vue'
import { Download, RefreshCcw } from 'lucide-vue-next'
import forge from 'node-forge'

const certPem = ref('')
const keyPem = ref('')
const password = ref('')
const isGenerating = ref(false)
const error = ref<string | null>(null)

const generatePFX = async () => {
    isGenerating.value = true
    error.value = null
    try {
        if (!certPem.value || !keyPem.value) {
            throw new Error('Certificate and Private Key are required.')
        }

        // Parse PEMs
        let cert: forge.pki.Certificate
        let key: forge.pki.PrivateKey
        
        try {
            cert = forge.pki.certificateFromPem(certPem.value)
        } catch { throw new Error('Invalid Certificate PEM') }
        
        try {
            key = forge.pki.privateKeyFromPem(keyPem.value)
        } catch { throw new Error('Invalid Private Key PEM') }

        // Create PKCS12
        // Async usually not needed for PFX packing in forge, it's sync
        const p12Asn1 = forge.pkcs12.toPkcs12Asn1(key, [cert], password.value, {
            algorithm: '3des' // standard compatibility
        })
        
        const p12Der = forge.asn1.toDer(p12Asn1).getBytes()
        
        // Download
        const blob = new Blob([new Uint8Array(p12Der.split('').map(c => c.charCodeAt(0)))], { type: 'application/x-pkcs12' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'certificate.pfx'
        a.click()
        URL.revokeObjectURL(url)

    } catch (e: any) {
        error.value = e.message || 'Failed to generate PFX'
    } finally {
        isGenerating.value = false
    }
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-slate-800 dark:text-white">PFX / PKCS#12 Generator</h2>
    
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Certificate (PEM)</label>
                <textarea v-model="certPem" class="w-full h-40 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none" placeholder="-----BEGIN CERTIFICATE-----..."></textarea>
            </div>
             <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Private Key (PEM)</label>
                <textarea v-model="keyPem" class="w-full h-40 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none" placeholder="-----BEGIN PRIVATE KEY-----..."></textarea>
            </div>
        </div>
        
        <div class="mb-6 max-w-sm">
             <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PFX Password (Optional)</label>
             <input v-model="password" type="password" placeholder="Export Password" class="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        
        <button 
            @click="generatePFX" 
            :disabled="isGenerating"
            class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <RefreshCcw v-if="isGenerating" class="w-5 h-5 animate-spin" />
            <Download v-else class="w-5 h-5" />
            <span>Download .pfx File</span>
        </button>

        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
  </div>
</template>
