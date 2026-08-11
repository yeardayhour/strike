<template>
  <div class="arena-3d-wrapper w-full max-w-xl aspect-square relative flex items-center justify-center p-4">
    <!-- Outer Octagonal / Circular Rim -->
    <div 
      class="arena-bowl relative w-full h-full rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-black border-[12px] border-slate-700 shadow-[inset_0_0_80px_rgba(0,0,0,0.85),0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden transition-transform duration-200"
      :class="{ 'arena-impact-shake': isShaking }"
    >
      <!-- Arena Floor Felt Texture Overlay -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0%,rgba(15,23,42,0.9)_100%)] pointer-events-none"></div>

      <!-- Center Logo / All In Glow Badge -->
      <div v-if="dice.length === 0" class="absolute z-0 text-center select-none animate-pulse">
        <div class="text-amber-400 font-extrabold text-2xl tracking-widest opacity-80 uppercase mb-1">ARENA IS EMPTY</div>
        <div class="text-red-500 font-black text-5xl tracking-tighter drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">ALL IN STRIKE!</div>
        <p class="text-slate-400 text-sm mt-2 font-semibold">모든 주사위를 투기장으로 던져야 합니다!</p>
      </div>

      <!-- Floating Text Effect on Match / Score -->
      <Transition name="float-score">
        <div v-if="floatingMsg" class="absolute top-1/4 z-30 pointer-events-none font-black text-3xl sm:text-4xl text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)] animate-bounce">
          {{ floatingMsg }}
        </div>
      </Transition>

      <!-- Dice Grid in Arena Bowl -->
      <div class="arena-dice-container relative z-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 max-w-[80%] max-h-[80%] p-4">
        <TransitionGroup name="die-bounce">
          <Die3D
            v-for="(item, index) in diceWithOffset"
            :key="`${item.face}-${index}`"
            :face="item.face"
            :is-rolling="isRolling && index === dice.length - 1"
            :is-matched="matchedFaces.includes(item.face)"
            :is-destroyed="item.face === 'X' && isEvaluating"
            :rotation-offset="item.offset"
            :size="64"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Die3D from './Die3D.vue'
import type { DieFace } from '../composables/useGame'

const props = withDefaults(defineProps<{
  dice: DieFace[]
  isRolling?: boolean
  isEvaluating?: boolean
  matchedFaces?: DieFace[]
  floatingMsg?: string
}>(), {
  isRolling: false,
  isEvaluating: false,
  matchedFaces: () => [],
  floatingMsg: ''
})

const isShaking = ref(false)

// Trigger screen shake when new die hits the arena
watch(() => props.dice.length, (newCount, oldCount) => {
  if (newCount > oldCount) {
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 350)
  }
})

// Generate random subtle tilt offsets for natural dice arrangement inside bowl
const diceWithOffset = computed(() => {
  return props.dice.map((face, i) => {
    // Deterministic random offset based on index and face
    const seedX = (i * 37 + 13) % 40 - 20
    const seedY = (i * 29 + 17) % 40 - 20
    return {
      face,
      offset: { x: seedX, y: seedY }
    }
  })
})
</script>

<style scoped>
.arena-3d-wrapper {
  perspective: 1000px;
}

.arena-impact-shake {
  animation: bowlShake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes bowlShake {
  10%, 90% { transform: translate3d(-3px, 0, 0) rotate(-1deg); }
  20%, 80% { transform: translate3d(4px, 0, 0) rotate(1deg); }
  30%, 50%, 70% { transform: translate3d(-6px, 0, 0) rotate(-2deg); }
  40%, 60% { transform: translate3d(6px, 0, 0) rotate(2deg); }
}

/* Transition Animations */
.die-bounce-enter-active {
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.die-bounce-leave-active {
  transition: all 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}
.die-bounce-enter-from {
  opacity: 0;
  transform: translateY(-120px) scale(1.6) rotate(360deg);
}
.die-bounce-leave-to {
  opacity: 0;
  transform: scale(0.2) translateY(50px);
}

.float-score-enter-active,
.float-score-leave-active {
  transition: all 0.4s ease;
}
.float-score-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}
.float-score-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.2);
}
</style>
