<template>
  <div 
    class="die-3d-scene" 
    :style="{ width: `${size}px`, height: `${size}px` }"
    :class="{ 'is-matched': isMatched, 'is-destroyed': isDestroyed }"
  >
    <div 
      class="die-3d-cube" 
      :class="{ 'animate-roll-3d': isRolling }"
      :style="cubeTransformStyle"
    >
      <!-- Face 1: X (Red Cross) -->
      <div class="cube-face face-1">
        <div class="face-x-mark">✕</div>
      </div>

      <!-- Face 2: 2 Dots -->
      <div class="cube-face face-2">
        <span class="dot top-left"></span>
        <span class="dot bottom-right"></span>
      </div>

      <!-- Face 3: 3 Dots -->
      <div class="cube-face face-3">
        <span class="dot top-left"></span>
        <span class="dot center"></span>
        <span class="dot bottom-right"></span>
      </div>

      <!-- Face 4: 4 Dots -->
      <div class="cube-face face-4">
        <span class="dot top-left"></span>
        <span class="dot top-right"></span>
        <span class="dot bottom-left"></span>
        <span class="dot bottom-right"></span>
      </div>

      <!-- Face 5: 5 Dots -->
      <div class="cube-face face-5">
        <span class="dot top-left"></span>
        <span class="dot top-right"></span>
        <span class="dot center"></span>
        <span class="dot bottom-left"></span>
        <span class="dot bottom-right"></span>
      </div>

      <!-- Face 6: 6 Dots -->
      <div class="cube-face face-6">
        <span class="dot top-left"></span>
        <span class="dot top-right"></span>
        <span class="dot mid-left"></span>
        <span class="dot mid-right"></span>
        <span class="dot bottom-left"></span>
        <span class="dot bottom-right"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DieFace } from '../composables/useGame'

const props = withDefaults(defineProps<{
  face: DieFace
  size?: number
  isRolling?: boolean
  isMatched?: boolean
  isDestroyed?: boolean
  rotationOffset?: { x: number; y: number }
}>(), {
  size: 64,
  isRolling: false,
  isMatched: false,
  isDestroyed: false,
  rotationOffset: () => ({ x: 0, y: 0 })
})

// Calculate exact 3D rotation angles for target face
const cubeTransformStyle = computed(() => {
  if (props.isRolling) return {}

  const halfSize = props.size / 2
  let rx = 0
  let ry = 0

  switch (props.face) {
    case 'X': // Face 1 (Front)
      rx = 0; ry = 0;
      break
    case 2: // Face 2 (Right)
      rx = 0; ry = -90;
      break
    case 3: // Face 3 (Left)
      rx = 0; ry = 90;
      break
    case 4: // Face 4 (Top)
      rx = -90; ry = 0;
      break
    case 5: // Face 5 (Bottom)
      rx = 90; ry = 0;
      break
    case 6: // Face 6 (Back)
      rx = 0; ry = 180;
      break
  }

  // Add subtle tilt for realism inside bowl
  rx += props.rotationOffset.x
  ry += props.rotationOffset.y

  return {
    transform: `translateZ(-${halfSize}px) rotateX(${rx}deg) rotateY(${ry}deg)`
  }
})
</script>

<style scoped>
.die-3d-scene {
  perspective: 600px;
  position: relative;
  display: inline-block;
  user-select: none;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.die-3d-scene.is-matched {
  animation: pulseGold 0.8s infinite alternate ease-in-out;
  transform: scale(1.15);
  z-index: 20;
}

.die-3d-scene.is-destroyed {
  animation: vaporize 0.5s forwards ease-out;
}

@keyframes pulseGold {
  0% { filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.8)); }
  100% { filter: drop-shadow(0 0 25px rgba(251, 191, 36, 1)); }
}

@keyframes vaporize {
  0% { opacity: 1; transform: scale(1); filter: contrast(2) drop-shadow(0 0 15px rgba(239, 68, 68, 1)); }
  50% { opacity: 0.8; transform: scale(1.4) rotate(45deg); filter: blur(4px); }
  100% { opacity: 0; transform: scale(0) rotate(90deg); filter: blur(10px); }
}

.die-3d-cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.animate-roll-3d {
  animation: roll3DAnimation 1.1s cubic-bezier(0.15, 0.85, 0.35, 1) infinite;
}

@keyframes roll3DAnimation {
  0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-40px); }
  25% { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg) translateY(0); }
  50% { transform: rotateX(720deg) rotateY(360deg) rotateZ(180deg) translateY(-20px); }
  75% { transform: rotateX(1080deg) rotateY(540deg) rotateZ(270deg) translateY(0); }
  100% { transform: rotateX(1440deg) rotateY(720deg) rotateZ(360deg) translateY(0); }
}

.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%);
  border: 2px solid #cbd5e1;
  border-radius: 14px;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.3);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  padding: 8px;
  box-sizing: border-box;
}

/* Face positions in 3D */
.face-1 { transform: rotateY(0deg) translateZ(32px); background: linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%); border-color: #ef4444; }
.face-2 { transform: rotateY(90deg) translateZ(32px); }
.face-3 { transform: rotateY(-90deg) translateZ(32px); }
.face-4 { transform: rotateX(90deg) translateZ(32px); }
.face-5 { transform: rotateX(-90deg) translateZ(32px); }
.face-6 { transform: rotateY(180deg) translateZ(32px); }

/* Face 1 X Cross */
.face-x-mark {
  grid-column: 1 / span 3;
  grid-row: 1 / span 3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  font-size: 2.2rem;
  font-weight: 900;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

/* Dots Layout */
.dot {
  width: 11px;
  height: 11px;
  background: radial-gradient(circle at 35% 35%, #1e293b 0%, #0f172a 100%);
  border-radius: 50%;
  justify-self: center;
  align-self: center;
  box-shadow: inset 0 2px 3px rgba(255,255,255,0.4);
}

.top-left { grid-column: 1; grid-row: 1; }
.top-right { grid-column: 3; grid-row: 1; }
.mid-left { grid-column: 1; grid-row: 2; }
.center { grid-column: 2; grid-row: 2; }
.mid-right { grid-column: 3; grid-row: 2; }
.bottom-left { grid-column: 1; grid-row: 3; }
.bottom-right { grid-column: 3; grid-row: 3; }
</style>
