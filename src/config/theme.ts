/**
 * 主题配置
 * 基于CSS变量实现，支持动态切换和扩展
 */

export type ThemeMode = 'light' | 'dark'

export interface ThemeColors {
  // 背景色
  'bg-primary': string
  'bg-secondary': string
  'bg-tertiary': string

  // 文字色
  'text-primary': string
  'text-secondary': string
  'text-tertiary': string
  'text-accent': string

  // 边框色
  'border-primary': string
  'border-secondary': string

  // 强调色
  'accent-primary': string
  'accent-secondary': string

  // 状态色
  success: string
  warning: string
  error: string
  info: string

  // 卡片/容器
  'card-bg': string
  'card-hover': string

  // 导航栏
  'navbar-bg': string
  'navbar-border': string

  // Markdown渲染器
  'color-text': string
  'color-heading': string
  'color-text-muted': string
  'color-accent': string
  'color-border': string
  'color-hover': string
  'color-bg': string
  'color-code-bg': string
  'color-code-text': string
  'color-code-header-bg': string
  'color-blockquote-bg': string
  'color-table-header-bg': string
  'color-body': string
  'color-scheme': string
}

// 亮色主题
export const lightTheme: ThemeColors = {
  // 背景色
  'bg-primary': '#f8f9fa',
  'bg-secondary': '#e9ecef',
  'bg-tertiary': '#dee2e6',

  // 文字色
  'text-primary': '#1d1d1f',
  'text-secondary': '#6e6e73',
  'text-tertiary': '#86868b',
  'text-accent': '#0071e3',

  // 边框色
  'border-primary': 'rgba(0, 0, 0, 0.1)',
  'border-secondary': 'rgba(0, 0, 0, 0.05)',

  // 强调色
  'accent-primary': '#0071e3',
  'accent-secondary': '#87ceeb',

  // 状态色
  success: '#34c759',
  warning: '#ff9500',
  error: '#ff3b30',
  info: '#5ac8fa',

  // 卡片/容器
  'card-bg': 'rgba(255, 255, 255, 0.8)',
  'card-hover': 'rgba(255, 255, 255, 0.95)',

  // 导航栏
  'navbar-bg': 'rgba(255, 255, 255, 0.8)',
  'navbar-border': 'rgba(0, 0, 0, 0.1)',

  // Markdown渲染器
  'color-text': '#1d1d1f',
  'color-heading': '#1d1d1f',
  'color-text-muted': '#6e6e73',
  'color-accent': '#0071e3',
  'color-border': 'rgba(0, 0, 0, 0.1)',
  'color-hover': 'rgba(0, 0, 0, 0.05)',
  'color-bg': '#ffffff',
  'color-code-bg': '#f6f8fa',
  'color-code-text': '#24292e',
  'color-code-header-bg': '#e9ecef',
  'color-blockquote-bg': 'rgba(0, 113, 227, 0.05)',
  'color-table-header-bg': '#f6f8fa',
  'color-body': '#f8f9fa',
  'color-scheme': 'light',
}

// 暗色主题
export const darkTheme: ThemeColors = {
  // 背景色
  'bg-primary': '#0a0a0b',
  'bg-secondary': '#1c1c1e',
  'bg-tertiary': '#2c2c2e',

  // 文字色
  'text-primary': '#f0f0f0',
  'text-secondary': '#a0a0a0',
  'text-tertiary': '#6f6f6f',
  'text-accent': '#87ceeb',

  // 边框色
  'border-primary': 'rgba(255, 255, 255, 0.1)',
  'border-secondary': 'rgba(255, 255, 255, 0.05)',

  // 强调色
  'accent-primary': '#87ceeb',
  'accent-secondary': '#5fa8d3',

  // 状态色
  success: '#30d158',
  warning: '#ff9f0a',
  error: '#ff453a',
  info: '#64d2ff',

  // 卡片/容器
  'card-bg': 'rgba(255, 255, 255, 0.05)',
  'card-hover': 'rgba(255, 255, 255, 0.08)',

  // 导航栏
  'navbar-bg': 'rgba(28, 28, 30, 0.8)',
  'navbar-border': 'rgba(255, 255, 255, 0.1)',

  // Markdown渲染器
  'color-text': '#e6edf3',
  'color-heading': '#f0f0f0',
  'color-text-muted': '#8b949e',
  'color-accent': '#87ceeb',
  'color-border': 'rgba(255, 255, 255, 0.1)',
  'color-hover': 'rgba(255, 255, 255, 0.05)',
  'color-bg': '#1c1c1e',
  'color-code-bg': '#0d1117',
  'color-code-text': '#e6edf3',
  'color-code-header-bg': '#161b22',
  'color-blockquote-bg': 'rgba(135, 206, 250, 0.05)',
  'color-table-header-bg': '#161b22',
  'color-body': '#0a0a0b',
  'color-scheme': 'dark',
}

// 主题映射
export const themes: Record<ThemeMode, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
}

// 应用主题到DOM
export function applyTheme(mode: ThemeMode) {
  const theme = themes[mode]
  const root = document.documentElement

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })

  // 设置data属性，方便CSS选择器使用
  root.setAttribute('data-theme', mode)
}

// 获取系统主题偏好
export function getSystemTheme(): ThemeMode {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}
