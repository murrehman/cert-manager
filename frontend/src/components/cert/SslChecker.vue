<script setup lang="ts">
import { ref } from 'vue'
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-vue-next'

const url = ref('')
const detailed = ref(false)
const result = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const check = async () => {
    if (!url.value) return 
    
    // Clean URL
    let target = url.value.replace(/^https?:\/\//, '')
    
    loading.value = true
    error.value = null
    result.value = null
    
    try {
        const query = new URLSearchParams({ url: target, detailed: String(detailed.value) })
        const apiBase = import.meta.env.VITE_API_URL || ''
        const res = await fetch(`${apiBase}/api/check-ssl?${query.toString()}`)
        
        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Failed to check SSL')
        }
        
        result.value = await res.json()
    } catch (e: any) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-500 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full'
    if (grade === 'B') return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full'
    if (grade === 'C' || grade === 'D') return 'text-amber-500 bg-amber-100 dark:bg-amber-900/20 px-3 py-1 rounded-full'
    return 'text-red-500 bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-full'
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-slate-800 dark:text-white">SSL/TLS Checker</h2>
    
    <!-- Input Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <form @submit.prevent="check" class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex-1 w-full">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hostname / URL</label>
                <div class="relative">
                    <input v-model="url" type="text" placeholder="example.com" class="w-full px-4 py-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none pl-10" required />
                    <ShieldCheck class="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                </div>
            </div>
            
            <div class="flex items-center gap-2 mb-3 px-2">
                <input v-model="detailed" type="checkbox" id="detailed" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600">
                <label for="detailed" class="text-sm text-slate-700 dark:text-slate-300">Detailed Check</label>
            </div>
            
            <button type="submit" :disabled="loading" class="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]">
                <span v-if="loading" class="animate-pulse">Checking...</span>
                <span v-else>Check SSL</span>
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4 text-sm">{{ error }}</p>
    </div>

    <!-- Results -->
    <div v-if="result" class="space-y-6 animate-fade-in">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                 <span class="text-xs text-slate-500 uppercase font-semibold">Overall Grade</span>
                 <div class="text-4xl font-bold mt-2" :class="getGradeColor(result.grade)">{{ result.grade }}</div>
             </div>
             
             <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                 <span class="text-xs text-slate-500 uppercase font-semibold">Valid?</span>
                 <div class="mt-2">
                     <CheckCircle v-if="result.valid" class="w-10 h-10 text-green-500" />
                     <XCircle v-else class="w-10 h-10 text-red-500" />
                 </div>
                 <span v-if="!result.valid" class="text-xs text-red-500 mt-1">Invalid / Expired</span>
             </div>

             <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                 <span class="text-xs text-slate-500 uppercase font-semibold">Expiry</span>
                 <div class="text-lg font-bold text-slate-800 dark:text-white mt-1">{{ new Date(result.expiry).toLocaleDateString() }}</div>
                 <span class="text-xs text-slate-500">{{ result.daysRemaining }} days left</span>
             </div>
             
             <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                 <span class="text-xs text-slate-500 uppercase font-semibold">Protocol</span>
                 <div class="text-lg font-bold text-slate-800 dark:text-white mt-1">{{ result.protocol }}</div>
                 <span class="text-xs text-slate-500 px-2 break-all">{{ result.cipher }}</span>
             </div>
        </div>
        
        <!-- Issues List -->
        <div v-if="result.issues && result.issues.length > 0" class="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4">
            <h3 class="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2 mb-2">
                <AlertTriangle class="w-5 h-5" />
                Identified Issues
            </h3>
            <ul class="list-disc list-inside text-sm text-amber-900 dark:text-amber-100 ml-1">
                <li v-for="issue in result.issues" :key="issue">{{ issue }}</li>
            </ul>
        </div>

        <!-- Details -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-lg font-semibold mb-4">Certificate Details</h3>
            <div class="space-y-3 text-sm">
                <div class="grid grid-cols-1 sm:grid-cols-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <span class="text-slate-500 font-medium">Common Name</span>
                    <span class="col-span-2 font-mono text-slate-800 dark:text-slate-200">{{ result.subject }}</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <span class="text-slate-500 font-medium">Issuer</span>
                    <span class="col-span-2 font-mono text-slate-800 dark:text-slate-200">{{ result.issuer }}</span>
                </div>
                 <div class="grid grid-cols-1 sm:grid-cols-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <span class="text-slate-500 font-medium">Cipher Suite</span>
                    <span class="col-span-2 font-mono text-slate-800 dark:text-slate-200">{{ result.cipher }}</span>
                </div>
            </div>
            
            <div v-if="result.chain && result.chain.length > 0" class="mt-6">
                <h4 class="font-semibold mb-2">Chain of Trust</h4>
                <div class="space-y-2">
                    <div v-for="(cert, idx) in result.chain" :key="idx" class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex flex-col gap-1 text-xs">
                        <div class="flex justify-between font-mono font-bold text-slate-700 dark:text-slate-300">
                            <span>{{ cert.subject }}</span>
                            <span class="text-slate-400">#{{ (idx as number) + 1 }}</span>
                        </div>
                        <div class="text-slate-500">Issuer: {{ cert.issuer }}</div>
                        <div class="text-slate-400">Fingerprint: {{ cert.fingerprint }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
