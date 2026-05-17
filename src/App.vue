<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

import CustomScrollbar from '@/components/CustomScrollbar.vue'
import { useThemeStore } from '@/stores/modules/theme'

const themeStore = useThemeStore()

let cleanupSystemThemeWatch: (() => void) | undefined

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()

  // 监听系统主题变化
  cleanupSystemThemeWatch = themeStore.watchSystemTheme()
})

onUnmounted(() => {
  // 清理系统主题监听
  if (cleanupSystemThemeWatch) {
    cleanupSystemThemeWatch()
  }
})
</script>

<template>
  <div>
    <router-view />
    <CustomScrollbar />
  </div>
</template>

<style scoped></style>
