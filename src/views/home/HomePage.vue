<template>
  <div
    ref="containerRef"
    bg="#1c1c1e"
    relative
    flex
    justify-center
    size-screen
    style="position: relative; overflow: hidden"
    @click="createRipple"
  >
    <!-- 下落的雨滴 -->
    <div
      v-for="drop in raindrops"
      :key="'drop-' + drop.id"
      class="raindrop"
      :style="{
        '--start-x': drop.startX + 'px',
        '--end-x': drop.x + 'px',
        '--start-y': drop.startY + 'px',
        '--end-y': drop.endY + 'px',
        '--duration': drop.duration + 's',
      }"
    ></div>
    <!-- 涟漪效果 -->
    <div
      v-for="ripple in ripples"
      :key="ripple.id"
      :class="ripple.isRaindrop ? 'ripple-raindrop' : 'ripple'"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
        animationDelay: ripple.delay + 's',
      }"
    ></div>
    <div ref="profileContainerRef" class="profile-container">
      <canvas ref="avatarCanvas" width="70" height="70" style="border-radius: 50%"></canvas>
      <div gap="10px" flex flex-col items-center>
        <div text="#f0f0f0 24px" flex flex-col items-center gap="10px">
          <div ref="titleRef" font="maoken">Hi, I'm DrmrKJ😶‍🌫️.</div>
          <div ref="describeRef" font="maoken">{{ describe }}</div>
        </div>
        <div ref="subtitleRef" font="maoken" text="#6f6f6f 14px">
          A developer who loves life and coding.
        </div>
      </div>
    </div>
    <div ref="bottomTextRef" absolute bottom="10%">
      <span ref="particleTextRef" text="#505051" font="maoken">廉纤小雨池塘遍。细点看萍面。</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { onMounted, ref } from 'vue'

import avatarImg from '@/assets/images/app/avatar.jpg'

interface Ripple {
  id: number
  x: number
  y: number
  delay: number
  isRaindrop?: boolean // 标记是否为雨滴
}

interface Raindrop {
  id: number
  x: number
  startY: number
  endY: number
  duration: number
  startX: number
}

// ========== 鼠标点击涟漪配置参数 ==========
const CLICK_CONFIG = {
  throttleDelay: 300, // 点击节流延迟（毫秒）
  maxRippleGroups: 9, // 同时存在的最大涟漪组数
  ripplesPerClick: 2, // 每次点击产生的涟漪圆环数
  rippleDelay: 0.7, // 每个圆环之间的延迟间隔（秒）
  rippleDuration: 2500, // 单个涟漪持续时间（毫秒）
  rippleDelayIncrement: 500, // 每个圆环的额外延迟增量（毫秒）
  maxSize: 1200, // 涟漪最大扩散尺寸（像素）
}

// ========== 雨滴配置参数 ==========
const RAIN_CONFIG = {
  // 雨滴生成配置
  intervalSeconds: 3, // 每隔多少秒生成一批雨滴
  minDropsPerBatch: 1, // 每批最少雨滴数
  maxDropsPerBatch: 5, // 每批最多雨滴数
  maxDelayBetweenDrops: 2000, // 同一批雨滴之间的最大间隔（毫秒）

  // 雨滴下落配置
  minFallDuration: 0.8, // 最短下落时间（秒）
  maxFallDuration: 1.2, // 最长下落时间（秒）
  horizontalOffset: 100, // 水平偏移距离（像素）
  rotation: 15, // 雨滴旋转角度（度）

  // 雨滴外观配置
  width: 2, // 雨滴宽度（像素）
  height: 15, // 雨滴高度（像素）
  color: 'rgba(135, 206, 250, 0.8)', // 雨滴颜色

  // 涟漪配置
  rippleDuration: 5000, // 涟漪持续时间（毫秒）
  rippleMaxSize: 150, // 涟漪最大扩散尺寸（像素）
  rippleColor: 'rgba(135, 206, 250, 0.6)', // 涟漪颜色
}

const describe = ref(`An Frontend <Developer />`)
const containerRef = ref<HTMLElement | null>(null)
const avatarCanvas = ref<HTMLCanvasElement | null>(null)
const profileContainerRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const describeRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const bottomTextRef = ref<HTMLElement | null>(null)
const particleTextRef = ref<HTMLElement | null>(null)
const ripples = ref<Ripple[]>([])
const raindrops = ref<Raindrop[]>([])
let rippleId = 0
let raindropId = 0
let lastClickTime = 0

// 检测移动端
const isMobile = /Android|iPhone/i.test(navigator.userAgent)

const createRipple = (event: MouseEvent) => {
  if (!containerRef.value) return

  // 节流：限制点击频率
  const now = Date.now()
  if (now - lastClickTime < CLICK_CONFIG.throttleDelay) return
  lastClickTime = now

  // 手机端：如果有点击产生的波纹正在播放，禁止新的点击
  const clickRipples = ripples.value.filter((r) => !r.isRaindrop)
  if (isMobile && clickRipples.length > 0) return

  // 限制同时存在的涟漪组数，避免性能问题
  if (ripples.value.length > CLICK_CONFIG.maxRippleGroups) return

  const rect = containerRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 创建多个涟漪圆环
  for (let i = 0; i < CLICK_CONFIG.ripplesPerClick; i++) {
    const id = rippleId++
    ripples.value.push({
      id,
      x,
      y,
      delay: i * CLICK_CONFIG.rippleDelay,
      isRaindrop: false,
    })

    setTimeout(
      () => {
        ripples.value = ripples.value.filter((r) => r.id !== id)
      },
      CLICK_CONFIG.rippleDuration + i * CLICK_CONFIG.rippleDelayIncrement,
    )
  }
}

// 创建雨滴涟漪
const createRaindrop = () => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const endX = Math.random() * rect.width
  const endY = Math.random() * rect.height
  const startY = -20 // 从屏幕上方开始
  const duration =
    RAIN_CONFIG.minFallDuration +
    Math.random() * (RAIN_CONFIG.maxFallDuration - RAIN_CONFIG.minFallDuration)

  // 计算起始X位置，让雨滴斜着下落（从右上到左下，与旋转方向一致）
  const startX = endX + RAIN_CONFIG.horizontalOffset

  // 创建下落的雨滴
  const dropId = raindropId++
  raindrops.value.push({
    id: dropId,
    x: endX,
    startX,
    startY,
    endY,
    duration,
  })

  // 雨滴下落完成后，创建涟漪并移除雨滴
  setTimeout(() => {
    // 移除雨滴
    raindrops.value = raindrops.value.filter((d) => d.id !== dropId)

    // 创建涟漪
    const rippleIdValue = rippleId++
    ripples.value.push({
      id: rippleIdValue,
      x: endX,
      y: endY,
      delay: 0,
      isRaindrop: true,
    })

    // 雨滴涟漪持续时间
    setTimeout(() => {
      ripples.value = ripples.value.filter((r) => r.id !== rippleIdValue)
    }, RAIN_CONFIG.rippleDuration)
  }, duration * 1000)
}

// 开始下雨
const startRain = () => {
  const rainInterval = () => {
    // 每批随机生成指定数量的雨滴
    const dropCount =
      Math.floor(
        Math.random() * (RAIN_CONFIG.maxDropsPerBatch - RAIN_CONFIG.minDropsPerBatch + 1),
      ) + RAIN_CONFIG.minDropsPerBatch

    for (let i = 0; i < dropCount; i++) {
      // 每滴雨之间随机间隔
      setTimeout(() => {
        createRaindrop()
      }, Math.random() * RAIN_CONFIG.maxDelayBetweenDrops)
    }
  }

  // 立即执行一次
  rainInterval()

  // 按配置的间隔执行
  setInterval(rainInterval, RAIN_CONFIG.intervalSeconds * 1000)
}

// 初始化进入动画
const initEnterAnimations = () => {
  const timeline = gsap.timeline()

  // 1. 头像从下方渐入到当前位置
  if (avatarCanvas.value) {
    gsap.set(avatarCanvas.value, {
      y: 100,
      opacity: 0,
    })
    timeline.to(avatarCanvas.value, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    })
  }

  // 2. 头像旁边的文字从左淡出到右（缓慢显示）
  if (titleRef.value && describeRef.value && subtitleRef.value) {
    gsap.set([titleRef.value, describeRef.value, subtitleRef.value], {
      x: -50,
      opacity: 0,
    })
    timeline.to(
      titleRef.value,
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
      },
      '-=0.5',
    )
    timeline.to(
      describeRef.value,
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
      },
      '-=0.9',
    )
    timeline.to(
      subtitleRef.value,
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
      },
      '-=0.9',
    )
  }

  // 3. 页面下方的文字由粒子凝聚效果
  if (particleTextRef.value) {
    const text = particleTextRef.value.textContent || ''
    particleTextRef.value.textContent = ''

    // 将文字拆分成单个字符
    const chars = text.split('').map((char) => {
      const span = document.createElement('span')
      span.textContent = char
      span.style.display = 'inline-block'
      span.style.opacity = '0'
      particleTextRef.value?.appendChild(span)
      return span
    })

    // 为每个字符添加粒子凝聚动画
    timeline.to(
      chars,
      {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        stagger: {
          each: 0.05,
          from: 'random',
        },
        ease: 'back.out(1.7)',
        onStart: function () {
          // 动画开始前设置初始状态
          chars.forEach((char) => {
            gsap.set(char, {
              x: gsap.utils.random(-50, 50),
              y: gsap.utils.random(-50, 50),
              scale: 0,
              opacity: 0,
            })
          })
        },
      },
      '-=0.5',
    )
  }
}

onMounted(() => {
  if (!avatarCanvas.value) return

  const canvas = avatarCanvas.value
  const ctx = canvas.getContext('2d', { willReadFrequently: false })
  if (!ctx) return

  // 获取设备像素比，实现高清显示
  const dpr = window.devicePixelRatio || 1
  const size = 70

  // 设置canvas实际像素大小
  canvas.width = size * dpr
  canvas.height = size * dpr

  // 设置canvas显示大小
  canvas.style.width = size + 'px'
  canvas.style.height = size + 'px'

  // 缩放绘图上下文以匹配设备像素比
  ctx.scale(dpr, dpr)

  // 禁用右键菜单
  canvas.addEventListener('contextmenu', (e) => e.preventDefault())

  // 加载图片
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    // 绘制圆形裁剪
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    // 使用高质量图像平滑
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(img, 0, 0, size, size)
    ctx.restore()
  }
  img.src = avatarImg

  // 启动雨滴效果
  startRain()

  // 启动进入动画
  initEnterAnimations()
})
</script>

<style scoped>
.profile-container {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: -200px;
}

@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
    gap: 15px;
    margin-top: 200px;
  }
}

.raindrop {
  position: absolute;
  width: 2px;
  height: 15px;
  background: linear-gradient(to bottom, transparent, rgba(135, 206, 250, 0.8));
  border-radius: 50%;
  pointer-events: none;
  animation: raindrop-fall var(--duration) linear;
  left: var(--start-x);
  top: var(--start-y);
  transform: rotate(15deg);
  will-change: left, top;
}

@keyframes raindrop-fall {
  0% {
    left: var(--start-x);
    top: var(--start-y);
    opacity: 0.8;
  }
  100% {
    left: var(--end-x);
    top: var(--end-y);
    opacity: 1;
  }
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: transparent;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: ripple-animation 3.5s ease-out;
  will-change: width, height, opacity;
}

@keyframes ripple-animation {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
  10% {
    opacity: 0.6;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
  25% {
    opacity: 0.5;
    box-shadow: 0 0 0 1.8px rgba(255, 255, 255, 0.4);
  }
  50% {
    opacity: 0.3;
    box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.3);
  }
  80% {
    opacity: 0.1;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  100% {
    width: 1200px;
    height: 1200px;
    opacity: 0;
    box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0);
  }
}

.ripple-raindrop {
  position: absolute;
  border-radius: 50%;
  background: transparent;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: raindrop-animation 5s ease-out;
  will-change: width, height, opacity;
}

@keyframes raindrop-animation {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
    box-shadow: 0 0 0 1.5px rgba(135, 206, 250, 0.6);
  }
  15% {
    opacity: 0.5;
    box-shadow: 0 0 0 1.5px rgba(135, 206, 250, 0.5);
  }
  30% {
    opacity: 0.4;
    box-shadow: 0 0 0 1.2px rgba(135, 206, 250, 0.4);
  }
  50% {
    opacity: 0.25;
    box-shadow: 0 0 0 1px rgba(135, 206, 250, 0.3);
  }
  75% {
    opacity: 0.1;
    box-shadow: 0 0 0 0.8px rgba(135, 206, 250, 0.15);
  }
  100% {
    width: 150px;
    height: 150px;
    opacity: 0;
    box-shadow: 0 0 0 0.5px rgba(135, 206, 250, 0);
  }
}
</style>
