import { reactive, computed } from 'vue'
import confetti from 'canvas-confetti'
import { io, Socket } from 'socket.io-client'

export type DieFace = 2 | 3 | 4 | 5 | 6 | 'X'

export interface Player {
  id: string | number
  name: string
  diceCount: number
  isEliminated: boolean
  isHost?: boolean
}

export interface GameState {
  mode: 'local' | 'online' | 'ai'
  status: 'menu' | 'waiting_lobby' | 'playing' | 'gameover'
  players: Player[]
  currentPlayerIndex: number
  arenaDice: DieFace[]
  winner: Player | null
  message: string
  turnState: 'waiting_to_roll' | 'can_pass_or_roll' | 'evaluating'
  matchedFaces: DieFace[]
  floatingMsg: string
  roomCode: string
  myPlayerId: string | number
}

const state = reactive<GameState>({
  mode: 'local',
  status: 'menu',
  players: [],
  currentPlayerIndex: 0,
  arenaDice: [],
  winner: null,
  message: '',
  turnState: 'waiting_to_roll',
  matchedFaces: [],
  floatingMsg: '',
  roomCode: '',
  myPlayerId: 1
})

let socket: Socket | null = null

// Helper to roll a single die
const rollDie = (): DieFace => {
  const faces: DieFace[] = [2, 3, 4, 5, 6, 'X']
  return faces[Math.floor(Math.random() * faces.length)]
}

// Trigger High-Dopamine Confetti Explosion
const fireConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  })
}

const checkWinCondition = () => {
  const activePlayers = state.players.filter(p => !p.isEliminated)
  if (activePlayers.length === 1) {
    state.status = 'gameover'
    state.winner = activePlayers[0]
    state.message = `🏆 ${activePlayers[0].name} 님이 최종 우승하셨습니다!`
    fireConfetti()
  } else if (activePlayers.length === 0) {
    state.status = 'gameover'
    state.winner = null
    state.message = "무승부! 모든 플레이어가 탈락했습니다."
  }
}

const getNextActivePlayerIndex = (currentIndex: number): number => {
  let nextIdx = (currentIndex + 1) % state.players.length
  while (state.players[nextIdx].isEliminated && nextIdx !== currentIndex) {
    nextIdx = (nextIdx + 1) % state.players.length
  }
  return nextIdx
}

export const useGame = () => {
  const nextTurn = () => {
    const currentPlayer = state.players[state.currentPlayerIndex]
    if (currentPlayer.diceCount <= 0 && !currentPlayer.isEliminated) {
      currentPlayer.isEliminated = true
      state.message = `💀 ${currentPlayer.name} 님이 탈락했습니다!`
    }
    
    checkWinCondition()
    if (state.status === 'gameover') return

    state.currentPlayerIndex = getNextActivePlayerIndex(state.currentPlayerIndex)
    state.turnState = 'waiting_to_roll'
    state.matchedFaces = []
    state.floatingMsg = ''

    const nextPlayer = state.players[state.currentPlayerIndex]
    if (state.arenaDice.length === 0) {
      state.message = `🔥 투기장이 비었습니다! ${nextPlayer.name} 님은 올인(ALL IN)해야 합니다!`
    } else {
      state.message = `🎲 ${nextPlayer.name} 님의 차례입니다. 주사위를 굴리세요!`
    }

    // Handle AI Player Turn automatically
    if (state.mode === 'ai' && nextPlayer.name.includes('AI') && !nextPlayer.isEliminated) {
      setTimeout(handleAiTurn, 1200)
    }
  }

  const evaluateArena = (currentPlayer: Player) => {
    state.turnState = 'evaluating'

    // 1. Remove 'X's
    const initialCount = state.arenaDice.length
    state.arenaDice = state.arenaDice.filter(d => d !== 'X')
    const xCount = initialCount - state.arenaDice.length

    // 2. Count matches
    const counts: Record<string, number> = {}
    state.arenaDice.forEach(d => {
      counts[d] = (counts[d] || 0) + 1
    })

    let matchedDiceAmount = 0
    const matchedFacesList: DieFace[] = []
    const remainingDice: DieFace[] = []

    state.arenaDice.forEach(d => {
      if (counts[d] > 1) {
        matchedDiceAmount++
        if (!matchedFacesList.includes(d)) matchedFacesList.push(d)
      } else {
        remainingDice.push(d)
      }
    })

    state.matchedFaces = matchedFacesList

    if (matchedDiceAmount > 0) {
      currentPlayer.diceCount += matchedDiceAmount
      state.arenaDice = remainingDice
      state.message = `🎉 ${currentPlayer.name} 님이 ${matchedDiceAmount}개의 주사위를 획득했습니다!`
      state.floatingMsg = `+${matchedDiceAmount} DICE MATCH!`
      fireConfetti()

      setTimeout(() => {
        nextTurn()
      }, 1600)
    } else {
      if (xCount > 0) {
        state.message = `💥 'X' 주사위 ${xCount}개가 파괴되었습니다!`
      } else {
        state.message = `⚡ 일치하는 숫자가 없습니다!`
      }
      
      if (currentPlayer.diceCount > 0) {
        state.turnState = 'can_pass_or_roll'
        if (state.mode === 'ai' && currentPlayer.name.includes('AI')) {
          setTimeout(handleAiDecision, 1000)
        }
      } else {
        setTimeout(() => {
          nextTurn()
        }, 1400)
      }
    }
  }

  // AI Player Logic
  const handleAiTurn = () => {
    if (state.status !== 'playing') return
    const currentP = state.players[state.currentPlayerIndex]
    if (!currentP || !currentP.name.includes('AI') || currentP.diceCount <= 0) return

    rollAction()
  }

  const handleAiDecision = () => {
    if (state.status !== 'playing' || state.turnState !== 'can_pass_or_roll') return
    const currentP = state.players[state.currentPlayerIndex]

    if (state.arenaDice.length >= 3 && currentP.diceCount >= 3 && Math.random() < 0.45) {
      rollAction()
    } else {
      passTurn()
    }
  }

  // 1. Local Hotseat Game
  const startNewGame = (playerCount: number) => {
    state.mode = 'local'
    const dicePerPlayer = playerCount === 2 ? 8 : playerCount === 3 ? 7 : 6
    state.players = Array.from({ length: playerCount }).map((_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      diceCount: dicePerPlayer,
      isEliminated: false
    }))
    
    state.currentPlayerIndex = 0
    state.winner = null
    state.status = 'playing'
    state.turnState = 'waiting_to_roll'
    state.matchedFaces = []
    
    // Initial arena setup (no X)
    let initialDie = rollDie()
    while (initialDie === 'X') {
      initialDie = rollDie()
    }
    state.arenaDice = [initialDie]
    state.message = `${state.players[0].name} 님의 차례입니다. 주사위를 굴리세요!`
  }

  // 2. Single Player VS AI Game
  const startAiGame = (aiCount: number = 2) => {
    state.mode = 'ai'
    const totalPlayers = aiCount + 1
    const dicePerPlayer = totalPlayers === 2 ? 8 : totalPlayers === 3 ? 7 : 6
    
    state.players = [
      { id: 1, name: '나 (Player 1)', diceCount: dicePerPlayer, isEliminated: false },
      ...Array.from({ length: aiCount }).map((_, i) => ({
        id: i + 2,
        name: `AI 로봇 ${i + 1}`,
        diceCount: dicePerPlayer,
        isEliminated: false
      }))
    ]

    state.currentPlayerIndex = 0
    state.winner = null
    state.status = 'playing'
    state.turnState = 'waiting_to_roll'
    state.matchedFaces = []

    let initialDie = rollDie()
    while (initialDie === 'X') {
      initialDie = rollDie()
    }
    state.arenaDice = [initialDie]
    state.message = `AI 대전 시작! 주사위를 던지세요!`
  }

  // 3. Roll Action (Local & AI)
  const rollAction = () => {
    if (state.status !== 'playing' || state.turnState === 'evaluating') return

    if (state.mode === 'online' && socket) {
      return socket.emit('roll_action', { roomCode: state.roomCode })
    }

    const currentPlayer = state.players[state.currentPlayerIndex]
    if (currentPlayer.diceCount <= 0) return

    if (state.arenaDice.length === 0) {
      // ALL IN
      const rolledDice = Array.from({ length: currentPlayer.diceCount }).map(() => rollDie())
      currentPlayer.diceCount = 0
      state.arenaDice.push(...rolledDice)
      state.message = `🔥 ${currentPlayer.name} 님이 올인(ALL IN)했습니다!`
      setTimeout(() => evaluateArena(currentPlayer), 1200)
    } else {
      // Single Roll
      currentPlayer.diceCount--
      const newDie = rollDie()
      state.arenaDice.push(newDie)
      setTimeout(() => evaluateArena(currentPlayer), 800)
    }
    
    state.turnState = 'evaluating'
  }

  // 4. Pass Turn Action (Local & AI)
  const passTurn = () => {
    if (state.status !== 'playing' || state.turnState !== 'can_pass_or_roll') return

    if (state.mode === 'online' && socket) {
      return socket.emit('pass_turn', { roomCode: state.roomCode })
    }

    state.message = `${state.players[state.currentPlayerIndex].name} 님이 턴을 넘겼습니다.`
    nextTurn()
  }

  // 5. Online Socket.IO Multiplayer Integration
  const initOnlineSocket = () => {
    if (socket) return
    socket = io({
      path: '/strike/socket.io'
    })

    socket.on('connect', () => {
      if (socket && socket.id) {
        state.myPlayerId = socket.id
      }
    })

    socket.on('room_created', ({ roomCode, roomState }) => {
      state.mode = 'online'
      state.roomCode = roomCode
      state.status = 'waiting_lobby'
      updateFromOnlineRoom(roomState)
    })

    socket.on('room_updated', (roomState) => {
      updateFromOnlineRoom(roomState)
    })

    socket.on('game_started', (roomState) => {
      state.status = 'playing'
      updateFromOnlineRoom(roomState)
    })

    socket.on('dice_rolled', ({ roomState }) => {
      updateFromOnlineRoom(roomState)
    })

    socket.on('arena_evaluated', ({ roomState, matchedCount }) => {
      updateFromOnlineRoom(roomState)
      if (matchedCount > 0) {
        fireConfetti()
      }
    })

    socket.on('turn_changed', (roomState) => {
      updateFromOnlineRoom(roomState)
    })

    socket.on('game_over', (roomState) => {
      state.status = 'gameover'
      updateFromOnlineRoom(roomState)
      if (roomState.winner) fireConfetti()
    })

    socket.on('error_msg', (msg: string) => {
      alert(msg)
    })
  }

  const updateFromOnlineRoom = (roomState: any) => {
    state.players = roomState.players
    state.currentPlayerIndex = roomState.currentPlayerIndex
    state.arenaDice = roomState.arenaDice
    state.turnState = roomState.turnState
    state.message = roomState.message
    state.winner = roomState.winner
  }

  const createOnlineRoom = (playerName: string) => {
    initOnlineSocket()
    socket!.emit('create_room', { playerName })
  }

  const joinOnlineRoom = (roomCode: string, playerName: string) => {
    initOnlineSocket()
    socket!.emit('join_room', { roomCode, playerName })
  }

  const startOnlineGame = () => {
    if (socket && state.roomCode) {
      socket.emit('start_game', { roomCode: state.roomCode })
    }
  }

  const backToMenu = () => {
    state.status = 'menu'
  }

  return {
    state,
    startNewGame,
    startAiGame,
    rollAction,
    passTurn,
    backToMenu,
    createOnlineRoom,
    joinOnlineRoom,
    startOnlineGame,
    activePlayer: computed(() => state.players[state.currentPlayerIndex]),
    isAllIn: computed(() => state.arenaDice.length === 0)
  }
}
