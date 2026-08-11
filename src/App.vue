<template>
  <div class="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans p-4 sm:p-8 relative overflow-hidden select-none">
    
    <!-- Background Glow Orbs -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[140px]"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col">
      
      <!-- HEADER -->
      <header class="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
        <div class="flex items-center gap-3">
          <h1 class="text-3xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-indigo-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            STRIKE 3D
          </h1>
          <span class="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            🎲 Live Dice Arena
          </span>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="game.state.status === 'playing' && game.state.roomCode" class="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            방 코드: {{ game.state.roomCode }}
          </div>

          <button 
            v-if="game.state.status !== 'menu'"
            @click="game.backToMenu"
            class="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-bold transition-all"
          >
            메인 메뉴로
          </button>
        </div>
      </header>

      <!-- MAIN MENU -->
      <main v-if="game.state.status === 'menu'" class="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-6 space-y-8">
        <div class="text-center space-y-3">
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">주사위 배틀 아레나 스트라이크</h2>
          <p class="text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            주사위를 던져 같은 숫자를 맞추고 상대의 주사위를 뺏으세요! 끝까지 주사위를 지키는 자가 승리합니다.
          </p>
        </div>

        <!-- Mode Select Tabs -->
        <div class="w-full bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6 backdrop-blur-xl">
          
          <div class="flex gap-2 p-1.5 bg-slate-950/70 rounded-2xl border border-slate-800">
            <button 
              @click="activeTab = 'online'"
              class="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              :class="activeTab === 'online' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'"
            >
              🌐 온라인 멀티플레이 (2인+)
            </button>
            <button 
              @click="activeTab = 'local'"
              class="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              :class="activeTab === 'local' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'"
            >
              🎮 한 기기 로컬 핫시트
            </button>
            <button 
              @click="activeTab = 'ai'"
              class="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              :class="activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'"
            >
              🤖 싱글 AI 연습 대전
            </button>
          </div>

          <!-- TAB 1: ONLINE MULTIPLAYER -->
          <div v-if="activeTab === 'online'" class="space-y-4 pt-2">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">내 닉네임</label>
              <input 
                v-model="playerName" 
                type="text" 
                placeholder="닉네임 입력" 
                class="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button @click="handleCreateRoom" class="btn-action bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white">
                ➕ 새 대기방 생성
              </button>
              
              <div class="flex gap-2">
                <input 
                  v-model="inputRoomCode" 
                  type="text" 
                  placeholder="방 코드 (예: STRIKE-1234)" 
                  class="flex-1 px-3.5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold uppercase text-white outline-none focus:border-indigo-500"
                />
                <button @click="handleJoinRoom" class="btn-action bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold px-4">
                  입장
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 2: LOCAL HOTSEAT -->
          <div v-else-if="activeTab === 'local'" class="space-y-4 pt-2">
            <p class="text-xs text-slate-400 text-center font-medium">한 기기에서 여러 명의 친구들과 번갈아가며 주사위를 던집니다.</p>
            <div class="grid grid-cols-3 gap-3">
              <button @click="game.startNewGame(2)" class="btn-mode">2인 게임 (8개씩)</button>
              <button @click="game.startNewGame(3)" class="btn-mode">3인 게임 (7개씩)</button>
              <button @click="game.startNewGame(4)" class="btn-mode">4인 게임 (6개씩)</button>
            </div>
          </div>

          <!-- TAB 3: SINGLE AI BATTLE -->
          <div v-else-if="activeTab === 'ai'" class="space-y-4 pt-2">
            <p class="text-xs text-slate-400 text-center font-medium">인공지능 AI 로봇 플레이어와 주사위 대결을 펼칩니다.</p>
            <div class="grid grid-cols-3 gap-3">
              <button @click="game.startAiGame(1)" class="btn-mode">1:1 VS AI 1명</button>
              <button @click="game.startAiGame(2)" class="btn-mode">1:2 VS AI 2명</button>
              <button @click="game.startAiGame(3)" class="btn-mode">1:3 VS AI 3명</button>
            </div>
          </div>

        </div>

        <!-- STRIKE GAME RULES BOX -->
        <div class="w-full bg-slate-900/50 p-6 rounded-2xl border border-slate-800/60 text-xs text-slate-400 space-y-2">
          <div class="font-bold text-slate-200 text-sm flex items-center gap-2">
            <span>📖</span> 스트라이크 (Strike) 공식 규칙 안내
          </div>
          <ul class="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
            <li>자신의 턴에 주사위 1개를 투기장(Arena)으로 던집니다.</li>
            <li><strong>'X' 면이 나온 주사위</strong>는 즉시 게임에서 파괴/소멸됩니다.</li>
            <li><strong>같은 숫자의 주사위(쌍/세트)</strong>가 맞춰지면 투기장의 일치하는 주사위를 모두 내 손으로 가져옵니다! (+주사위 획득)</li>
            <li>맞춘 숫자가 없을 경우: 턴을 넘기거나(Pass), 주사위를 추가로 굴릴 수 있습니다.</li>
            <li>투기장이 비어있으면 <strong>ALL IN</strong>! 내 모든 주사위를 투기장으로 굴려야 합니다.</li>
          </ul>
        </div>
      </main>

      <!-- WAITING LOBBY (FOR ONLINE MULTIPLAYER) -->
      <main v-else-if="game.state.status === 'waiting_lobby'" class="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-8 space-y-6">
        <div class="text-center space-y-2">
          <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40">ONLINE LOBBY</span>
          <h2 class="text-3xl font-extrabold">대기실 (방 코드: <span class="text-amber-400 font-mono">{{ game.state.roomCode }}</span>)</h2>
          <p class="text-slate-400 text-xs">친구에게 방 코드를 공유하여 함께 참여하세요!</p>
        </div>

        <div class="w-full bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <h3 class="font-bold text-sm text-slate-300">참여 플레이어 목록 ({{ game.state.players.length }}/4)</h3>
          
          <div class="space-y-2">
            <div 
              v-for="p in game.state.players" 
              :key="p.id"
              class="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center font-bold text-xs text-indigo-300">
                  {{ p.name.substring(0, 1) }}
                </div>
                <span class="font-bold text-sm">{{ p.name }}</span>
              </div>
              <span v-if="p.isHost" class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">방장 (HOST)</span>
            </div>
          </div>

          <button 
            @click="game.startOnlineGame"
            class="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-black text-lg text-white shadow-xl shadow-emerald-600/30 transition-transform active:scale-95 mt-4"
          >
            🚀 게임 시작 (START GAME)
          </button>
        </div>
      </main>

      <!-- GAME PLAYING VIEW -->
      <main v-else-if="game.state.status === 'playing'" class="flex-1 flex flex-col lg:flex-row gap-8 items-center lg:items-stretch justify-center max-w-7xl mx-auto w-full py-4">
        
        <!-- ARENA BOWL SECTION -->
        <div class="flex-1 flex flex-col items-center justify-center w-full max-w-2xl">
          
          <!-- Turn Banner Message -->
          <div class="mb-6 text-center min-h-[50px]">
            <transition name="fade" mode="out-in">
              <div :key="game.state.message" class="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                {{ game.state.message }}
              </div>
            </transition>
          </div>

          <!-- 3D Arena Bowl -->
          <Arena3D 
            :dice="game.state.arenaDice" 
            :is-evaluating="game.state.turnState === 'evaluating'"
            :matched-faces="game.state.matchedFaces"
            :floating-msg="game.state.floatingMsg"
          />

        </div>

        <!-- PLAYERS SIDEBAR -->
        <div class="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto max-h-[750px] pr-1">
          <PlayerDashboard 
            v-for="(player, idx) in game.state.players" 
            :key="player.id"
            :player="player"
            :is-active="idx === game.state.currentPlayerIndex"
            :is-all-in="game.isAllIn.value"
            :game-state="game.state"
            @roll="game.rollAction"
            @pass="game.passTurn"
          />
        </div>

      </main>

      <!-- GAME OVER -->
      <main v-else-if="game.state.status === 'gameover'" class="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-12">
        <h2 class="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500">
          GAME OVER
        </h2>
        
        <div class="text-8xl my-4 animate-bounce">🏆</div>

        <p class="text-2xl sm:text-3xl font-extrabold text-amber-300">{{ game.state.message }}</p>

        <button 
          @click="game.backToMenu" 
          class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-2xl font-black text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/30"
        >
          메인 메뉴로 돌아가기
        </button>
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGame } from './composables/useGame'
import Arena3D from './components/Arena3D.vue'
import PlayerDashboard from './components/PlayerDashboard.vue'

const game = useGame()
const activeTab = ref<'online' | 'local' | 'ai'>('online')
const playerName = ref('플레이어 1')
const inputRoomCode = ref('')

const handleCreateRoom = () => {
  if (!playerName.value.trim()) return alert('닉네임을 입력해주세요.')
  game.createOnlineRoom(playerName.value.trim())
}

const handleJoinRoom = () => {
  if (!playerName.value.trim()) return alert('닉네임을 입력해주세요.')
  if (!inputRoomCode.value.trim()) return alert('방 코드를 입력해주세요.')
  game.joinOnlineRoom(inputRoomCode.value.trim(), playerName.value.trim())
}
</script>

<style scoped>
.btn-action {
  @apply py-3.5 px-6 rounded-xl font-bold text-sm transition-all transform active:scale-95 flex items-center justify-center shadow-lg;
}

.btn-mode {
  @apply py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 text-center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
