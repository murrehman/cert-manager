<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { 
  FileKey, 
  KeyRound, 
  FileLock, 
  FileSearch, 
  ShieldCheck, 
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-vue-next'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const navigation = [
  { name: 'CSR Generation', href: '/csr-generator', icon: FileKey },
  { name: 'Key/CSR Matcher', href: '/matcher', icon: KeyRound },
  { name: 'PFX Generator', href: '/pfx-generator', icon: FileLock },
  { name: 'CSR Decoder', href: '/csr-decoder', icon: FileSearch },
  { name: 'Certificate Decoder', href: '/cert-decoder', icon: FileSearch },
  { name: 'SSL/TLS Checker', href: '/ssl-checker', icon: ShieldCheck },
]

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  // Check local storage or system preference
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
})
</script>

<template>
  <div>
    <!-- Mobile menu button -->
    <div class="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 px-4 py-3 flex items-center justify-between text-white shadow-md">
      <span class="font-bold text-xl flex items-center gap-2">
        <ShieldCheck class="w-6 h-6 text-blue-500" />
        Cert Manager
      </span>
      <button @click="toggleMobileMenu" class="p-2 rounded-md hover:bg-slate-800">
        <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </div>

    <!-- Sidebar backdrop for mobile -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen shadow-xl flex flex-col',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex items-center gap-3 p-6 border-b border-slate-800">
        <ShieldCheck class="w-8 h-8 text-blue-500" />
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">Cert Manager</h1>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group"
          :class="[
            route.path === item.href
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          ]"
        >
          <component 
            :is="item.icon" 
            class="w-5 h-5 transition-colors"
            :class="route.path === item.href ? 'text-white' : 'text-slate-500 group-hover:text-white'"
          />
          {{ item.name }}
        </RouterLink>
      </nav>
      <div class="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; {{ new Date().getFullYear() }} Cert Manager
        <br>Secure & Self-Hosted
      </div>
    </aside>
  </div>
</template>
