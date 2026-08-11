import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  path: '/strike/socket.io'
});

const PORT = process.env.PORT || 80;

// Dice faces: 2, 3, 4, 5, 6, 'X'
const rollRandomDie = () => {
  const faces = [2, 3, 4, 5, 6, 'X'];
  return faces[Math.floor(Math.random() * faces.length)];
};

// Rooms memory store
const rooms = new Map();

function generateRoomCode() {
  return 'STRIKE-' + Math.floor(1000 + Math.random() * 9000);
}

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Create Online Room
  socket.on('create_room', ({ playerName, maxPlayers = 4 }) => {
    const roomCode = generateRoomCode();
    const roomState = {
      code: roomCode,
      status: 'waiting', // waiting, playing, gameover
      hostId: socket.id,
      maxPlayers,
      players: [
        {
          id: socket.id,
          name: playerName || 'Player 1',
          diceCount: 0,
          isEliminated: false,
          isHost: true,
          ready: true
        }
      ],
      currentPlayerIndex: 0,
      arenaDice: [],
      turnState: 'waiting_to_roll',
      message: '새로운 방이 생성되었습니다. 플레이어를 대기 중입니다.',
      winner: null
    };

    rooms.set(roomCode, roomState);
    socket.join(roomCode);

    socket.emit('room_created', { roomCode, roomState });
    console.log(`[Room] ${roomCode} created by ${playerName}`);
  });

  // Join Room
  socket.on('join_room', ({ roomCode, playerName }) => {
    const code = roomCode.toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      return socket.emit('error_msg', '존재하지 않는 방 코드입니다.');
    }
    if (room.status !== 'waiting') {
      return socket.emit('error_msg', '이미 게임이 진행 중인 방입니다.');
    }
    if (room.players.length >= room.maxPlayers) {
      return socket.emit('error_msg', '방 정원이 초과되었습니다.');
    }

    const newPlayer = {
      id: socket.id,
      name: playerName || `Player ${room.players.length + 1}`,
      diceCount: 0,
      isEliminated: false,
      isHost: false,
      ready: true
    };

    room.players.push(newPlayer);
    socket.join(code);

    io.to(code).emit('room_updated', room);
    console.log(`[Room] ${playerName} joined ${code}`);
  });

  // Start Game (Host only)
  socket.on('start_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 2) {
      return socket.emit('error_msg', '최소 2명 이상의 플레이어가 필요합니다.');
    }

    const playerCount = room.players.length;
    const dicePerPlayer = playerCount === 2 ? 8 : playerCount === 3 ? 7 : 6;

    room.players.forEach(p => {
      p.diceCount = dicePerPlayer;
      p.isEliminated = false;
    });

    room.currentPlayerIndex = 0;
    room.status = 'playing';
    room.winner = null;

    // Initial Arena Die (cannot be X)
    let initialDie = rollRandomDie();
    while (initialDie === 'X') {
      initialDie = rollRandomDie();
    }
    room.arenaDice = [initialDie];
    room.turnState = 'waiting_to_roll';
    room.message = `${room.players[0].name}의 순서입니다. 주사위를 굴리세요!`;

    io.to(roomCode).emit('game_started', room);
  });

  // Roll Die Action
  socket.on('roll_action', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'playing') return;

    const activePlayer = room.players[room.currentPlayerIndex];
    if (activePlayer.id !== socket.id) {
      return socket.emit('error_msg', '당신의 턴이 아닙니다!');
    }
    if (activePlayer.diceCount <= 0) return;

    let rolledFace = rollRandomDie();
    let isAllIn = room.arenaDice.length === 0;

    if (isAllIn) {
      // ALL IN mode: Roll all remaining dice
      const count = activePlayer.diceCount;
      activePlayer.diceCount = 0;
      const newDice = Array.from({ length: count }).map(() => rollRandomDie());
      room.arenaDice.push(...newDice);
      room.message = `🔥 ${activePlayer.name} 님이 올인(ALL IN)을 시도합니다!`;

      // Evaluate after rolling animation
      setTimeout(() => evaluateServerArena(room, roomCode, activePlayer), 1500);
    } else {
      // Single die throw
      activePlayer.diceCount--;
      room.arenaDice.push(rolledFace);
      room.message = `🎲 ${activePlayer.name} 님이 주사위를 던졌습니다!`;

      // Evaluate after rolling animation
      setTimeout(() => evaluateServerArena(room, roomCode, activePlayer), 1200);
    }

    room.turnState = 'evaluating';
    io.to(roomCode).emit('dice_rolled', { roomState: room, rolledFace, isAllIn });
  });

  // Pass Turn Action
  socket.on('pass_turn', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'playing') return;

    const activePlayer = room.players[room.currentPlayerIndex];
    if (activePlayer.id !== socket.id) return;
    if (room.turnState !== 'can_pass_or_roll') return;

    room.message = `${activePlayer.name} 님이 턴을 넘겼습니다.`;
    serverNextTurn(room, roomCode);
  });

  // Reaction / Chat Emoji
  socket.on('send_emoji', ({ roomCode, emoji }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      io.to(roomCode).emit('emoji_received', { playerId: socket.id, playerName: player.name, emoji });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    for (const [code, room] of rooms.entries()) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        if (room.players.length === 0) {
          rooms.delete(code);
        } else {
          if (room.hostId === socket.id) {
            room.hostId = room.players[0].id;
            room.players[0].isHost = true;
          }
          io.to(code).emit('room_updated', room);
        }
      }
    }
  });
});

// Server Arena Evaluation Logic
function evaluateServerArena(room, roomCode, activePlayer) {
  // 1. Remove 'X's
  const initialCount = room.arenaDice.length;
  room.arenaDice = room.arenaDice.filter(d => d !== 'X');
  const xRemovedCount = initialCount - room.arenaDice.length;

  // 2. Count matching faces
  const counts = {};
  room.arenaDice.forEach(d => {
    counts[d] = (counts[d] || 0) + 1;
  });

  let matchedDiceCount = 0;
  const remainingDice = [];

  room.arenaDice.forEach(d => {
    if (counts[d] > 1) {
      matchedDiceCount++;
    } else {
      remainingDice.push(d);
    }
  });

  room.arenaDice = remainingDice;

  if (matchedDiceCount > 0) {
    activePlayer.diceCount += matchedDiceCount;
    room.message = `🎉 ${activePlayer.name} 님이 주사위 ${matchedDiceCount}개 획득 성공! (+${matchedDiceCount})`;
    io.to(roomCode).emit('arena_evaluated', { roomState: room, matchedCount: matchedDiceCount, xCount: xRemovedCount });
    
    setTimeout(() => {
      serverNextTurn(room, roomCode);
    }, 1800);
  } else {
    if (xRemovedCount > 0) {
      room.message = `💥 'X' 주사위 ${xRemovedCount}개가 파괴되었습니다!`;
    } else {
      room.message = `⚡ 일치하는 숫자가 없습니다!`;
    }

    if (activePlayer.diceCount > 0) {
      room.turnState = 'can_pass_or_roll';
    } else {
      setTimeout(() => {
        serverNextTurn(room, roomCode);
      }, 1500);
    }

    io.to(roomCode).emit('arena_evaluated', { roomState: room, matchedCount: 0, xCount: xRemovedCount });
  }
}

function serverNextTurn(room, roomCode) {
  const currentPlayer = room.players[room.currentPlayerIndex];
  if (currentPlayer.diceCount <= 0 && !currentPlayer.isEliminated) {
    currentPlayer.isEliminated = true;
    room.message = `💀 ${currentPlayer.name} 님이 모든 주사위를 잃고 탈락했습니다!`;
  }

  // Check Winner
  const activePlayers = room.players.filter(p => !p.isEliminated);
  if (activePlayers.length === 1) {
    room.status = 'gameover';
    room.winner = activePlayers[0];
    room.message = `🏆 ${activePlayers[0].name} 님이 최종 우승하셨습니다!`;
    return io.to(roomCode).emit('game_over', room);
  } else if (activePlayers.length === 0) {
    room.status = 'gameover';
    room.winner = null;
    room.message = '무승부! 모든 플레이어가 탈락했습니다.';
    return io.to(roomCode).emit('game_over', room);
  }

  // Move to next active player
  let nextIdx = (room.currentPlayerIndex + 1) % room.players.length;
  while (room.players[nextIdx].isEliminated && nextIdx !== room.currentPlayerIndex) {
    nextIdx = (nextIdx + 1) % room.players.length;
  }

  room.currentPlayerIndex = nextIdx;
  room.turnState = 'waiting_to_roll';
  const nextPlayer = room.players[room.currentPlayerIndex];

  if (room.arenaDice.length === 0) {
    room.message = `🔥 경기장이 비었습니다! ${nextPlayer.name} 님은 올인(ALL IN)해야 합니다!`;
  } else {
    room.message = `🎲 ${nextPlayer.name} 님의 차례입니다. 주사위를 굴리세요!`;
  }

  io.to(roomCode).emit('turn_changed', room);
}

// Serve Static Frontend
const distPath = path.join(__dirname, '../dist');
app.use('/strike', express.static(distPath));
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`[Strike] Game Server running on port ${PORT}`);
});
