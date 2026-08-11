<template>
  <div 
    class="p-5 rounded-2xl transition-all duration-300 border"
    :class="[
      isActive && !player.isEliminated 
        ? 'bg-slate-900/95 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.45)] scale-[1.02]' 
        : 'bg-slate-900/50 border-slate-800/80 opacity-75'
    ]"
  >
    <!-- Header info -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-extrabold text-base flex items-center gap-2">
        <span class="w-3 h-3 rounded-full" :class="isActive ? 'bg-amber-400 animate-ping' : 'bg-slate-600'"></span>
        <span>{{ player.name }}</span>
      </h3>
      
      <span v-if="player.isEliminated" class="px-2 py-0.5 bg-red-950/80 text-red-400 border border-red-800/60 rounded text-[10px] font-extrabold uppercase">
        Eliminated 💀
      </span>
      <span v-else class="text-amber-400 font-extrabold text-sm bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
        {{ player.diceCount }} Dice
      </span>
    </div>

    <!-- Mini Dice Inventory Display -->
    <div class="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
      <div 
        v-for="i in player.diceCount" 
        :key="i"
        class="w-6 h-6 rounded-md bg-gradient-to-br from-slate-100 to-slate-300 border border-slate-400 flex items-center justify-center text-[10px] font-black text-slate-800 shadow-sm"
      >
        🎲
      </div>
    </div>

    <!-- Action Buttons for Active Player -->
    <div v-if="isActive && !player.isEliminated" class="flex flex-col gap-2 pt-1">
      <!-- 1. Throw Die / ALL IN Button -->
      <button 
        @click="$emit('roll')" 
        :disabled="gameState.turnState === 'evaluating'"
        class="w-full py-3.5 px-4 rounded-xl font-black uppercase text-xs sm:text-sm tracking-wider text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        :class="isAllIn ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-600/40 animate-pulse' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-600/30'"
      >
        <span v-if="isAllIn">🔥 ALL IN! (모든 주사위 던지기)</span>
        <span v-else-if="gameState.turnState === 'can_pass_or_roll'">🎲 주사위 1개 추가로 던지기</span>
        <span v-else-if="gameState.turnState === 'evaluating'">판정 중...</span>
        <span v-else>🎲 주사위 1개 던지기</span>
      </button>

      <!-- 2. Pass Turn Button (ONLY ACTIVE AFTER ROLLING 1 DIE WITHOUT A MATCH) -->
      <button 
        v-if="gameState.turnState === 'can_pass_or_roll'"
        @click="$emit('pass')" 
        class="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider text-amber-300 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 transition-all active:scale-95 shadow-md animate-pulse"
      >
        ✋ 턴 넘기기 (Pass Turn)
      </button>

      <!-- Turn Hint for Player -->
      <div v-if="gameState.turnState === 'waiting_to_roll'" class="text-[11px] text-slate-400 text-center font-medium">
        💡 턴 시작 시 최소 1개 주사위를 굴려야 합니다.
      </div>
      <div v-else-if="gameState.turnState === 'can_pass_or_roll'" class="text-[11px] text-amber-400 text-center font-bold">
        💡 일치하는 숫자가 없습니다! 턴을 넘기거나 1개 더 굴릴 수 있습니다.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player, GameState } from '../composables/useGame'

defineProps<{
  player: Player
  isActive: boolean
  isAllIn: boolean
  gameState: GameState
}>()

defineEmits(['roll', 'pass'])
</script>
