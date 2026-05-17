<template>
  <button
    class="theme-toggle"
    :class="{ transitioning: themeStore.isTransitioning }"
    :aria-label="themeStore.isDark() ? '切换到亮色模式' : '切换到暗色模式'"
    @click="handleToggle"
  >
    <div class="icon-wrapper">
      <!-- 太阳图标 (亮色模式) -->
      <svg
        v-show="themeStore.isLight()"
        class="icon sun-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="5" stroke-width="2" />
        <line x1="12" y1="1" x2="12" y2="3" stroke-width="2" />
        <line x1="12" y1="21" x2="12" y2="23" stroke-width="2" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-width="2" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-width="2" />
        <line x1="1" y1="12" x2="3" y2="12" stroke-width="2" />
        <line x1="21" y1="12" x2="23" y2="12" stroke-width="2" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-width="2" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-width="2" />
      </svg>

      <!-- 月亮图标 (暗色模式) -->
      <svg
        v-show="themeStore.isDark()"
        class="icon moon-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/modules/theme'

const themeStore = useThemeStore()

const handleToggle = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.theme-toggle:hover {
  background: var(--card-hover);
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.icon-wrapper {
  position: relative;
  width: 20px;
  height: 20px;
}

.icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.sun-icon {
  animation: rotate 20s linear infinite;
}

.moon-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
}

.transitioning .icon {
  animation: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .theme-toggle {
    width: 36px;
    height: 36px;
  }

  .icon-wrapper {
    width: 18px;
    height: 18px;
  }
}
</style>
