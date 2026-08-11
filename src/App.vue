<template>
  <div class="min-h-screen flex flex-col bg-[#050811] text-slate-100 font-sans p-3 sm:p-8 relative overflow-hidden select-none">
    
    <!-- Background Ambient Light Mesh & Orbs -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] bg-indigo-600/25 rounded-full blur-[150px] animate-pulse"></div>
      <div class="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[150px] animate-pulse" style="animation-delay: -3s;"></div>
      <div class="absolute top-[40%] right-[30%] w-[350px] h-[350px] bg-cyan-500/15 rounded-full blur-[130px]"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col">
      
      <!-- HEADER -->
      <header class="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div class="flex items-center gap-3">
          <h1 class="text-3xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-indigo-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">
            STRIKE 3D
          </h1>
          <span class="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-widest shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            🎲 Live Dice Arena
          </span>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="game.state.status === 'playing' && game.state.roomCode" class="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300 flex items-center gap-2 shadow-lg">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
            방 코드: {{ game.state.roomCode }}
          </div>

          <button 
            v-if="game.state.status !== 'menu'"
            @click="game.backToMenu"
            class="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            메인 메뉴로
          </button>
        </div>
      </header>

      <!-- MAIN MENU -->
      <main v-if="game.state.status === 'menu'" class="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-4 space-y-8">
        <div class="text-center space-y-3">
          <div class="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-1">
            Official Strike Boardgame Remake
          </div>
          <h2 class="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
            주사위 배틀 아레나 스트라이크 3D
          </h2>
          <p class="text-slate-400 max-w-lg mx-auto text-sm sm:text-base font-medium leading-relaxed">
            투기장으로 주사위를 던져 숫자를 맞추고 상대의 주사위를 뺏으세요! 마지막까지 주사위를 지키는 승리자가 되세요.
          </p>
        </div>

        <!-- Mode Select Tabs -->
        <div class="w-full bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6 backdrop-blur-2xl">
          
          <div class="flex gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button 
              @click="activeTab = 'online'"
              class="flex-1 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              :class="activeTab === 'online' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/30' : 'text-slate-400 hover:text-white'"
            >
              🌐 온라인 멀티 (2인+)
            </button>
            <button 
              @click="activeTab = 'local'"
              class="flex-1 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              :class="activeTab === 'local' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/30' : 'text-slate-400 hover:text-white'"
            >
              🎮 로컬 핫시트
            </button>
            <button 
              @click="activeTab = 'ai'"
              class="flex-1 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              :class="activeTab === 'ai' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/30' : 'text-slate-400 hover:text-white'"
            >
              🤖 AI 로봇 대전
            </button>
          </div>

          <!-- TAB 1: ONLINE MULTIPLAYER -->
          <div v-if="activeTab === 'online'" class="space-y-4 pt-2">
            <div class="space-y-2">
              <label class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">내 닉네임</label>
              <input 
                v-model="playerName" 
                type="text" 
                placeholder="닉네임 입력" 
                class="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button @click="handleCreateRoom" class="btn-action bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/30">
                ➕ 멀티플레이 방 생성
              </button>
              
              <div class="flex gap-2">
                <input 
                  v-model="inputRoomCode" 
                  type="text" 
                  placeholder="방 코드 (예: STRIKE-1234)" 
                  class="flex-1 px-3.5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold uppercase text-white outline-none focus:border-indigo-500"
                />
                <button @click="handleJoinRoom" class="btn-action bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold px-5 border border-indigo-500/30">
                  입장
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 2: LOCAL HOTSEAT -->
          <div v-else-if="activeTab === 'local'" class="space-y-4 pt-2">
            <p class="text-xs text-slate-400 text-center font-medium">한 기기에서 번갈아가며 턴을 진행합니다.</p>
            <div class="grid grid-cols-3 gap-3">
              <button @click="game.startNewGame(2)" class="btn-mode">2인 게임 (8개씩)</button>
              <button @click="game.startNewGame(3)" class="btn-mode">3인 게임 (7개씩)</button>
              <button @click="game.startNewGame(4)" class="btn-mode">4인 게임 (6개씩)</button>
            </div>
          </div>

          <!-- TAB 3: SINGLE AI BATTLE -->
          <div v-else-if="activeTab === 'ai'" class="space-y-4 pt-2">
            <p class="text-xs text-slate-400 text-center font-medium">지능형 AI 로봇과 주사위 획득 대결을 벌입니다.</p>
            <div class="grid grid-cols-3 gap-3">
              <button @click="game.startAiGame(1)" class="btn-mode">1:1 VS AI 1명</button>
              <button @click="game.startAiGame(2)" class="btn-mode">1:2 VS AI 2명</button>
              <button @click="game.startAiGame(3)" class="btn-mode">1:3 VS AI 3명</button>
            </div>
          </div>

        </div>

        <!-- STRIKE GAME RULES EXPLANATION BOX -->
        <div class="w-full bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-3 shadow-xl backdrop-blur-xl">
          <div class="font-extrabold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <span class="text-amber-400">📖</span> 스트라이크 (Strike) 공식 규칙 & Pass 안내
          </div>
          <ul class="list-disc list-inside space-y-1.5 text-slate-300 leading-relaxed font-medium">
            <li><strong>턴 시작 시:</strong> 내 차례가 되면 <strong>반드시 주사위 최소 1개</strong>를 투기장으로 굴려야 합니다. (Pass 불가)</li>
            <li><strong>'X' 면이 나온 주사위:</strong> 투기장에서 즉시 제거되며 파괴됩니다.</li>
            <li><strong>숫자 짝/세트 매칭 시:</strong> 같은 숫자의 주사위는 내 손으로 모두 회수되며 <strong>턴이 자동으로 종료</strong>됩니다.</li>
            <li><strong>매칭 실패 시:</strong> 주사위 1개를 굴린 후 일치하는 숫자가 없을 때 비로소 <strong>[턴 넘기기 (Pass)]</strong> 또는 <strong>[주사위 추가 굴리기]</strong>를 선택할 수 있습니다!</li>
            <li><strong>투기장이 빈 경우:</strong> 경기장에 주사위가 0개면 <strong>ALL IN STRIKE!</strong> (내 주사위를 모두 던져야 함).</li>
          </ul>
        </div>
      </main>

      <!-- WAITING LOBBY (FOR ONLINE MULTIPLAYER) -->
      <main v-else-if="game.state.status === 'waiting_lobby'" class="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-8 space-y-6">
        <div class="text-center space-y-2">
          <span class="px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold border border-indigo-500/40">ONLINE LOBBY</span>
          <h2 class="text-3xl font-black">대기실 (방 코드: <span class="text-amber-400 font-mono">{{ game.state.roomCode }}</span>)</h2>
          <p class="text-slate-400 text-xs font-medium">친구에게 방 코드를 공유하여 함께 참여하세요!</p>
        </div>

        <div class="w-full bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4 backdrop-blur-2xl">
          <h3 class="font-bold text-sm text-slate-300">참여 플레이어 목록 ({{ game.state.players.length }}/4)</h3>
          
          <div class="space-y-2">
            <div 
              v-for="p in game.state.players" 
              :key="p.id"
              class="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center font-extrabold text-xs text-indigo-300 shadow-md">
                  {{ p.name.substring(0, 1) }}
                </div>
                <span class="font-extrabold text-sm">{{ p.name }}</span>
              </div>
              <span v-if="p.isHost" class="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black">방장 (HOST)</span>
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
              <div :key="game.state.message" class="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
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
        <h2 class="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">
          GAME OVER
        </h2>
        
        <div class="text-9xl my-4 animate-bounce">🏆</div>

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
  @apply py-3.5 px-6 rounded-xl font-extrabold text-sm transition-all transform active:scale-95 flex items-center justify-center shadow-lg;
}

.btn-mode {
  @apply py-3.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 text-center shadow-md;
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
