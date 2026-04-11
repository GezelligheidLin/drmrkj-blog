<template>
  <div class="h-screen w-screen cursor-none overflow-hidden" @mousemove="handleMouseMove">
    <div ref="pointerWrapperRef" class="pointer-wrapper">
      <div
        ref="pointerBoxRef"
        class="pointer-box"
        :style="{
          width: `${pointerWidth}`,
          height: `${pointerHeight}`,
          marginLeft: `calc(-1 * ${pointerWidth} / 2)`,
          marginTop: `calc(-1 * ${pointerHeight} / 2)`,
        }"
      >
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="_target" absolute top="1/2" left="1/2" w="200px" h="50px" bg="blue"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

const pointerWrapperRef = useTemplateRef('pointerWrapperRef')
const pointerBoxRef = useTemplateRef('pointerBoxRef')
const defaultPointerSiz = '2rem'
const pointerWidth = ref(defaultPointerSiz)
const pointerHeight = ref(defaultPointerSiz)
const currentTarget = ref<HTMLElement | null>(null)

// 旋转状态追踪
let animationFrameId: number | null = null
let currentRotation = 0 // 当前实际角度（累加，不取模）
let lastTimestamp: number | null = null
const rotationSpeed = 1000 / 3500 // deg/ms，对应 3.5s 一圈

const SHRINK_DISTANCE = 80 // 离开中心超过此距离才收缩（px）
let pendingShrinkTarget: { cx: number; cy: number } | null = null

function startRotation() {
  if (animationFrameId !== null) return
  lastTimestamp = null
  function tick(ts: number) {
    if (lastTimestamp !== null) {
      const delta = ts - lastTimestamp
      currentRotation += rotationSpeed * delta
    }
    lastTimestamp = ts
    applyRotation(currentRotation)
    animationFrameId = requestAnimationFrame(tick)
  }
  animationFrameId = requestAnimationFrame(tick)
}

function stopRotation() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
    lastTimestamp = null
  }
}

function applyRotation(deg: number) {
  if (!pointerBoxRef.value) return
  pointerBoxRef.value.style.transform = `rotate(${deg}deg)`
}

/** 找到距当前角度最近的 90° 倍数 */
function nearestRight90(deg: number): number {
  return Math.round(deg / 90) * 90
}

/** 就近旋转到正方形状态，返回对齐后的角度（瞬间跳转，无过渡动画） */
function snapToSquare(): number {
  stopRotation()

  const target = nearestRight90(currentRotation)
  currentRotation = target

  const box = pointerBoxRef.value!
  // 临时禁用 transform transition，瞬间到位
  box.style.transition = 'width 0.3s ease-out, height 0.3s ease-out'
  applyRotation(currentRotation)

  return target
}

const handleMouseMove = (e: MouseEvent) => {
  if (!pointerWrapperRef.value) return
  let x = e.clientX
  let y = e.clientY

  if (currentTarget.value) {
    const rect = currentTarget.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x = centerX + (x - centerX) * 0.3
    y = centerY + (y - centerY) * 0.3
  } else if (pendingShrinkTarget) {
    const dx = e.clientX - pendingShrinkTarget.cx
    const dy = e.clientY - pendingShrinkTarget.cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist >= SHRINK_DISTANCE) {
      pendingShrinkTarget = null
      pointerWidth.value = defaultPointerSiz
      pointerHeight.value = defaultPointerSiz
      startRotation()
    }
  }

  pointerWrapperRef.value.style.transform = `translate(${x}px, ${y}px)`
}

function bindTargetsEvents() {
  ;[...document.querySelectorAll<HTMLElement>('._target')].forEach((target) => {
    target.addEventListener('mouseenter', () => {
      const snappedDeg = snapToSquare()
      // 立即展开包裹，旋转对齐动画并行进行
      currentTarget.value = target
      const rect = target.getBoundingClientRect()
      // 奇数倍 90° 时元素被旋转了 90°/270°，宽高需互换
      const isVertical = Math.round(snappedDeg / 90) % 2 !== 0
      pointerWidth.value = (isVertical ? rect.height + 20 : rect.width + 35) + 'px'
      pointerHeight.value = (isVertical ? rect.width + 35 : rect.height + 20) + 'px'
    })
    target.addEventListener('mouseleave', () => {
      const rect = target.getBoundingClientRect()
      pendingShrinkTarget = {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      }
      currentTarget.value = null
    })
  })
}

onMounted(() => {
  bindTargetsEvents()
  startRotation()
})

onUnmounted(() => {
  stopRotation()
})
</script>

<style scoped lang="scss">
.pointer-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  pointer-events: none;
  transition: transform 0.2s ease-out;
  z-index: 9999;
}

@keyframes pointer-box-animation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pointer-box {
  position: relative;
  transition:
    width 0.2s ease-out,
    height 0.2s ease-out;

  div {
    position: absolute;
    width: 0.4rem;
    height: 0.4rem;
    border: 0.2rem solid #17f;
  }
  div:nth-child(1) {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
  }
  div:nth-child(2) {
    top: 0;
    right: 0;
    border-left: none;
    border-bottom: none;
  }
  div:nth-child(3) {
    bottom: 0;
    left: 0;
    border-right: none;
    border-top: none;
  }
  div:nth-child(4) {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
  }
}
</style>
