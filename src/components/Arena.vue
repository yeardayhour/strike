<template>
  <div class="relative w-full max-w-lg aspect-square bg-slate-800 rounded-full border-8 border-slate-600 shadow-inner overflow-hidden flex items-center justify-center p-8">
    <!-- Inner Bowl -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 rounded-full pointer-events-none"></div>
    
    <div v-if="dice.length === 0" class="text-slate-400 font-bold text-xl uppercase tracking-widest text-center">
      Arena Empty<br/>
      <span class="text-red-400 text-3xl">ALL IN!</span>
    </div>

    <!-- Dice -->
    <div class="flex flex-wrap justify-center gap-4 z-10">
      <TransitionGroup name="die-list">
        <Die 
          v-for="(face, index) in dice" 
          :key="`${face}-${index}`" 
          :face="face" 
          class="rotate-[-10deg] odd:rotate-12"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import Die from './Die.vue'
import type { DieFace } from '../composables/useGame'

defineProps<{
  dice: DieFace[]
}>()
</script>

<style scoped>
.die-list-enter-active,
.die-list-leave-active {
  transition: all 0.5s ease;
}
.die-list-enter-from {
  opacity: 0;
  transform: translateY(-50px) scale(0.5) rotate(-180deg);
}
.die-list-leave-to {
  opacity: 0;
  transform: scale(1.5);
}
</style>
