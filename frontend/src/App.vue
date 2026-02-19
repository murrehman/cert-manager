<script setup lang="ts">
import Sidebar from './components/layout/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
    <Sidebar />
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden md:mt-0 mt-16">
      <div class="flex-1 overflow-y-auto p-4 sm:p-8">
        <div class="max-w-7xl mx-auto">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@reference "./style.css";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  @apply bg-transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-slate-700 rounded-full hover:bg-slate-400 dark:hover:bg-slate-600;
}
</style>
