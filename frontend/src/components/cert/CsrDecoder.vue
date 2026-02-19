<script setup lang="ts">
import { ref } from 'vue'
import { FileSearch } from 'lucide-vue-next'
import forge from 'node-forge'

const pem = ref('')
const decoded = ref<any>(null)
const error = ref<string | null>(null)

const decode = () => {
    error.value = null
    decoded.value = null
    try {
        if (!pem.value) return
        
        const csr = forge.pki.certificationRequestFromPem(pem.value)
        
        // Extract Subject
        const subject: Record<string, any> = {}
        csr.subject.attributes.forEach(attr => {
            const key = attr.shortName || attr.name;
            if (key) subject[key] = attr.value
        })
        
        // Extract Extensions (SANs)
        const extensions = (csr.getAttribute({name: 'extensionRequest'}) as any)?.extensions || []
        const sans = extensions.find((e: any) => e.name === 'subjectAltName' || e.id === '2.5.29.17')
        const sanValues = sans ? (sans as any).altNames.map((a: any) => a.value) : []

        decoded.value = {
            subject,
            sans: sanValues,
            publicKey: {
                bitSize: (csr.publicKey as any).n.bitLength(),
                type: 'RSA' // Simplified
            },
            signature: csr.signatureOid
        }

    } catch (e: any) {
        error.value = 'Invalid CSR PEM format'
    }
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-slate-800 dark:text-white">CSR Decoder</h2>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4">
             <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paste CSR PEM</label>
                <textarea v-model="pem" class="w-full h-64 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none" placeholder="-----BEGIN CERTIFICATE REQUEST-----..."></textarea>
                <button @click="decode" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Decode</button>
                <p v-if="error" class="text-red-500 mt-2 text-sm">{{ error }}</p>
             </div>
        </div>

        <div v-if="decoded" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in">
             <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileSearch class="w-5 h-5 text-blue-500" />
                Decoded Information
            </h3>
            
            <div class="space-y-4 text-sm">
                <div>
                    <h4 class="font-medium text-slate-500 uppercase text-xs tracking-wider mb-2">Subject</h4>
                    <div class="grid grid-cols-2 gap-y-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                        <div class="text-slate-500">Common Name (CN)</div>
                        <div class="font-mono">{{ decoded.subject.CN }}</div>
                        
                        <div class="text-slate-500">Organization (O)</div>
                        <div class="font-mono">{{ decoded.subject.O || '-' }}</div>
                        
                        <div class="text-slate-500">Department (OU)</div>
                        <div class="font-mono">{{ decoded.subject.OU || '-' }}</div>
                        
                        <div class="text-slate-500">Location</div>
                        <div class="font-mono">{{ decoded.subject.L }}, {{ decoded.subject.ST }}, {{ decoded.subject.C }}</div>
                    </div>
                </div>
                
                <div v-if="decoded.sans.length">
                    <h4 class="font-medium text-slate-500 uppercase text-xs tracking-wider mb-2">Subject Alternative Names</h4>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="san in decoded.sans" :key="san" class="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono">{{ san }}</span>
                    </div>
                </div>

                <div>
                    <h4 class="font-medium text-slate-500 uppercase text-xs tracking-wider mb-2">Public Key Info</h4>
                    <div class="grid grid-cols-2 gap-y-2">
                        <div class="text-slate-500">Algorithm</div>
                        <div class="font-mono">{{ decoded.publicKey.type }}</div>
                        <div class="text-slate-500">Key Size</div>
                        <div class="font-mono">{{ decoded.publicKey.bitSize }} bits</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
