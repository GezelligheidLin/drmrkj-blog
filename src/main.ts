// uno.css样式引入
import 'virtual:uno.css'
// 自定义全局样式引入
import './assets/styles/index.scss'

import { createApp } from 'vue'

import { applyTheme, getSystemTheme, type ThemeMode } from '@/config/theme'
import { piniaRegister } from '@/stores'

import App from './App.vue'
import directive from './directive' // directive
// directive
import router from './router'

// 在应用挂载前初始化主题，避免闪烁
const THEME_STORAGE_KEY = 'app-theme-mode'
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
const initialTheme = savedTheme || getSystemTheme()
applyTheme(initialTheme)

const app = createApp(App)

app.use(piniaRegister)
app.use(router)

directive(app)

app.mount('#app')
