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
        
        const cert = forge.pki.certificateFromPem(pem.value)
        
        // Subject & Issuer
        const subject: Record<string, any> = {}
        cert.subject.attributes.forEach(attr => {
            const key = attr.shortName || attr.name;
            if (key) subject[key] = attr.value;
        })
        
        const issuer: Record<string, any> = {}
        cert.issuer.attributes.forEach(attr => {
            const key = attr.shortName || attr.name;
            if (key) issuer[key] = attr.value;
        })

        // SANs
        const ext = cert.getExtension('subjectAltName') as any
        const sans = ext && ext.altNames ? ext.altNames.map((a: any) => a.value) : []

        decoded.value = {
            subject,
            issuer,
            validFrom: cert.validity.notBefore.toISOString().split('T')[0],
            validTo: cert.validity.notAfter.toISOString().split('T')[0],
            sans,
            serial: cert.serialNumber,
            fingerprint: forge.pki.getPublicKeyFingerprint(cert.publicKey, {encoding: 'hex'}).match(/.{1,2}/g)?.join(':').toUpperCase()
        }

    } catch (e: any) {
        error.value = 'Invalid Certificate PEM format'
    }
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Certificate Decoder</h2>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4">
             <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paste Certificate PEM</label>
                <textarea v-model="pem" class="w-full h-64 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none" placeholder="-----BEGIN CERTIFICATE-----..."></textarea>
                <button @click="decode" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Decode</button>
                <p v-if="error" class="text-red-500 mt-2 text-sm">{{ error }}</p>
             </div>
        </div>

        <div v-if="decoded" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in">
             <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileSearch class="w-5 h-5 text-blue-500" />
                Decoded Information
            </h3>
            
            <div class="space-y-6 text-sm">
                <div>
                     <h4 class="font-medium text-slate-500 uppercase text-xs tracking-wider mb-2">Subject (Issued To)</h4>
                     <div class="font-mono text-lg font-semibold text-slate-800 dark:text-white">{{ decoded.subject.CN }}</div>
                     <div class="text-slate-600 dark:text-slate-400">{{ decoded.subject.O }}</div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-medium text-slate-500 uppercase text-xs tracking-wider mb-1">Valid From</h4>
                        <div class="font-mono">{{ decoded.validFrom }}</div>
                    </div>
                     <div>
                        <h4 class="font-medium text-slate-500 uppercase text-xs tracking-wider mb-1">Valid To</h4>
                        <div class="font-mono">{{ decoded.validTo }}</div>
                    </div>
                </div>

                <div>
                     <h4 class="font-medium text-slate-500 uppercase text-xs tracking-wider mb-2">Issuer (Issued By)</h4>
                     <div class="font-mono text-slate-800 dark:text-white">{{ decoded.issuer.CN }}</div>
                     <div class="text-slate-600 dark:text-slate-400">{{ decoded.issuer.O }}</div>
                </div>
                
                <div v-if="decoded.sans.length">
                    <h4 class="font-medium text-slate-500 uppercase text-xs tracking-wider mb-2">SANs</h4>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="san in decoded.sans" :key="san" class="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono">{{ san }}</span>
                    </div>
                </div>

                <div>
                     <h4 class="font-medium text-slate-500 uppercase text-xs tracking-wider mb-1">Fingerprint (SHA1)</h4>
                     <div class="font-mono text-xs break-all text-slate-600 dark:text-slate-400">{{ decoded.fingerprint }}</div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
