import { defineStore } from 'pinia'
import { ref } from 'vue'

import { applyTheme, getSystemTheme, type ThemeMode } from '@/config/theme'

const THEME_STORAGE_KEY = 'app-theme-mode'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const mode = ref<ThemeMode>('dark')
  const isTransitioning = ref(false)

  // 初始化主题
  function initTheme() {
    // 1. 尝试从localStorage读取
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null

    // 2. 如果有保存的主题，使用保存的；否则使用系统主题
    const initialTheme = savedTheme || getSystemTheme()

    // 3. 应用主题
    setTheme(initialTheme, false)
  }

  // 设置主题
  function setTheme(newMode: ThemeMode, withTransition = true) {
    if (mode.value === newMode) return

    if (withTransition) {
      isTransitioning.value = true
    }

    mode.value = newMode
    applyTheme(newMode)

    // 保存到localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newMode)

    if (withTransition) {
      setTimeout(() => {
        isTransitioning.value = false
      }, 300)
    }
  }

  // 切换主题
  function toggleTheme() {
    const newMode = mode.value === 'light' ? 'dark' : 'light'
    setTheme(newMode)
  }

  // 监听系统主题变化
  function watchSystemTheme() {
    if (!window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在没有手动设置过主题时才跟随系统
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }

  // Getters
  const isDark = () => mode.value === 'dark'
  const isLight = () => mode.value === 'light'

  return {
    // 状态
    mode,
    isTransitioning,

    // 方法
    initTheme,
    setTheme,
    toggleTheme,
    watchSystemTheme,

    // Getters
    isDark,
    isLight,
  }
})
