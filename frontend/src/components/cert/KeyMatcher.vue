<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle, XCircle } from 'lucide-vue-next'
// import { useCrypto } from '../../composables/useCrypto' // Not strictly using composable for logic here since it's simple verify, but nice to have.
// Actually I defined matchKeyCert in useCrypto.
import forge from 'node-forge'

const privateKey = ref('')
const certificate = ref('')
const matchResult = ref<{ match: boolean, message: string } | null>(null)

const checkMatch = () => {
    matchResult.value = null
    try {
        if (!privateKey.value || !certificate.value) {
            matchResult.value = { match: false, message: 'Please provide both keys.' }
            return
        }

        const key = forge.pki.privateKeyFromPem(privateKey.value)
        // Try decoding as cert first, then CSR
        let pubKeyObj: any = null
        let type = 'Certificate'
        
        try {
            const cert = forge.pki.certificateFromPem(certificate.value)
            pubKeyObj = cert.publicKey
        } catch (e) {
            // Try CSR
            try {
                const csr = forge.pki.certificationRequestFromPem(certificate.value)
                pubKeyObj = csr.publicKey
                type = 'CSR'
            } catch (e2) {
                throw new Error('Invalid Certificate or CSR PEM')
            }
        }

        // Compare modulus for RSA
        if (key.n && pubKeyObj.n) {
            if (key.n.compareTo(pubKeyObj.n) === 0 && key.e.compareTo(pubKeyObj.e) === 0) {
                 matchResult.value = { match: true, message: `Private Key matches the ${type}!` }
            } else {
                 matchResult.value = { match: false, message: `Mismatch: Private Key does not correspond to this ${type}.` }
            }
        } else {
             // For EC or others, we might need different comparison
             matchResult.value = { match: false, message: 'Only RSA keys supported for matching in this version.' }
        }

    } catch (e: any) {
        matchResult.value = { match: false, message: e.message || 'Error processing keys' }
    }
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Key Matcher</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Private Key (PEM)</label>
        <textarea v-model="privateKey" class="w-full h-48 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none" placeholder="-----BEGIN PRIVATE KEY-----..."></textarea>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Certificate or CSR (PEM)</label>
        <textarea v-model="certificate" class="w-full h-48 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none" placeholder="-----BEGIN CERTIFICATE-----..."></textarea>
      </div>
    </div>

    <div class="flex flex-col items-center gap-4">
        <button @click="checkMatch" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
            Check Match
        </button>

        <div v-if="matchResult" :class="['flex items-center gap-2 px-4 py-3 rounded-lg border', matchResult.match ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300']">
            <CheckCircle v-if="matchResult.match" class="w-5 h-5" />
            <XCircle v-else class="w-5 h-5" />
            <span class="font-medium">{{ matchResult.message }}</span>
        </div>
    </div>
  </div>
</template>
