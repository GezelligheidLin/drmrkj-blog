<template>
  <div
    v-if="!isMobile"
    ref="scrollbarRef"
    class="custom-scrollbar"
    :style="{
      height: scrollbarHeight + 'px',
      top: scrollbarTop + 'px',
      opacity: isVisible ? 1 : 0,
    }"
    @mousedown="handleMouseDown"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const scrollbarRef = ref<HTMLElement | null>(null)
const scrollbarHeight = ref(0)
const scrollbarTop = ref(0)
const isVisible = ref(false)
const isDragging = ref(false)
const startY = ref(0)
const startScrollTop = ref(0)
const isMobile = ref(false)

let hideTimer: number | null = null

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 计算滚动条高度和位置
const updateScrollbar = () => {
  // 移动端不显示滚动条
  if (isMobile.value) {
    isVisible.value = false
    return
  }

  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.scrollY || document.documentElement.scrollTop

  // 如果内容高度小于等于窗口高度，不显示滚动条
  if (documentHeight <= windowHeight) {
    isVisible.value = false
    return
  }

  // 计算滚动条高度（按比例）
  const ratio = windowHeight / documentHeight
  scrollbarHeight.value = Math.max(windowHeight * ratio, 50) // 最小高度50px

  // 计算滚动条位置
  const maxScrollTop = documentHeight - windowHeight
  const scrollRatio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0
  const maxScrollbarTop = windowHeight - scrollbarHeight.value
  scrollbarTop.value = scrollRatio * maxScrollbarTop

  // 显示滚动条
  showScrollbar()
}

// 显示滚动条
const showScrollbar = () => {
  isVisible.value = true

  // 清除之前的隐藏定时器
  if (hideTimer) {
    clearTimeout(hideTimer)
  }
}

// 隐藏滚动条
const hideScrollbar = () => {
  if (!isDragging.value) {
    isVisible.value = false
  }
}

// 鼠标进入页面
const handleMouseEnter = () => {
  showScrollbar()
}

// 鼠标离开页面
const handleMouseLeave = () => {
  hideScrollbar()
}

// 鼠标按下
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  startY.value = e.clientY
  startScrollTop.value = window.scrollY || document.documentElement.scrollTop

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  e.preventDefault()
}

// 鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return

  const deltaY = e.clientY - startY.value
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const maxScrollTop = documentHeight - windowHeight
  const maxScrollbarTop = windowHeight - scrollbarHeight.value

  // 计算滚动距离
  const scrollRatio = deltaY / maxScrollbarTop
  const scrollDistance = scrollRatio * maxScrollTop

  window.scrollTo({
    top: startScrollTop.value + scrollDistance,
    behavior: 'auto',
  })
}

// 鼠标释放
const handleMouseUp = () => {
  isDragging.value = false

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 释放后2秒隐藏
  hideTimer = window.setTimeout(() => {
    isVisible.value = false
  }, 2000)
}

// 监听滚动事件
const handleScroll = () => {
  updateScrollbar()
}

// 监听窗口大小变化
const handleResize = () => {
  checkMobile()
  updateScrollbar()
}

onMounted(() => {
  // 检测是否为移动端
  checkMobile()

  // 延迟计算，等待页面内容完全渲染和动画完成
  setTimeout(() => {
    updateScrollbar()
  }, 100)

  // 再次延迟计算，确保动画完成后更新
  setTimeout(() => {
    updateScrollbar()
  }, 1000)

  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  document.addEventListener('mouseenter', handleMouseEnter)
  document.addEventListener('mouseleave', handleMouseLeave)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mouseenter', handleMouseEnter)
  document.removeEventListener('mouseleave', handleMouseLeave)
  if (hideTimer) {
    clearTimeout(hideTimer)
  }
})
</script>

<style scoped>
.custom-scrollbar {
  position: fixed;
  right: 4px;
  width: 8px;
  background: linear-gradient(
    45deg,
    #ff6b6b 0%,
    #feca57 12.5%,
    #48dbfb 25%,
    #1dd1a1 37.5%,
    #5f27cd 50%,
    #ff9ff3 62.5%,
    #54a0ff 75%,
    #feca57 87.5%,
    #ff6b6b 100%
  );
  background-size: 200% 200%;
  border-radius: 4px;
  cursor: pointer;
  z-index: 9999;
  transition: opacity 0.3s ease;
  animation: scrollbar-gradient 3s ease infinite;
  user-select: none;
}

.custom-scrollbar:hover {
  animation-duration: 1.5s;
}

.custom-scrollbar:active {
  animation-duration: 0.8s;
  cursor: grabbing;
}

@keyframes scrollbar-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
