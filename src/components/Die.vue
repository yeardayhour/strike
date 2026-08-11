<template>
  <div 
    class="relative w-16 h-16 rounded-xl shadow-lg border-2 border-slate-700 bg-white flex items-center justify-center font-bold text-3xl select-none"
    :class="[
      isX ? 'text-red-500 bg-red-50 border-red-500' : 'text-slate-800',
      isRolling ? 'animate-bounce' : 'transition-transform hover:scale-105'
    ]"
  >
    <span v-if="face === 'X'">✕</span>
    <span v-else>{{ face }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DieFace } from '../composables/useGame'

const props = defineProps<{
  face: DieFace
  isRolling?: boolean
}>()

const isX = computed(() => props.face === 'X')
</script>
