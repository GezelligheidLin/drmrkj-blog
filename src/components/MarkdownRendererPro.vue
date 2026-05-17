<template>
  <div class="markdown-renderer-pro" :class="{ 'dark-mode': isDark }">
    <!-- 阅读进度条 -->
    <div class="reading-progress" :style="{ width: `${readingProgress}%` }"></div>

    <!-- 浮动操作按钮 -->
    <div class="floating-actions">
      <button
        class="action-btn"
        :class="{ active: showFloatingToc }"
        title="目录"
        @click="showFloatingToc = !showFloatingToc"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
      <button class="action-btn" title="主题切换" @click="toggleTheme">
        <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
      <button v-if="readingProgress > 20" class="action-btn" title="回到顶部" @click="scrollToTop">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
      <div class="progress-indicator">{{ Math.round(readingProgress) }}%</div>
    </div>

    <!-- 浮动目录 -->
    <transition name="slide-fade">
      <aside v-if="showFloatingToc && headings.length > 0" class="floating-toc">
        <div class="toc-header">
          <h3>目录</h3>
          <button class="close-btn" @click="showFloatingToc = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <TableOfContents :headings="headings" :active-id="activeHeadingId" />
      </aside>
    </transition>

    <!-- 文章容器 -->
    <div class="article-container">
      <!-- 文章头部 -->
      <header v-if="title" class="article-header">
        <h1 class="article-title">{{ title }}</h1>
        <div v-if="tags && tags.length > 0" class="article-tags">
          <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div v-if="metadata" class="article-metadata">
          <span v-if="metadata.date" class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {{ metadata.date }}
          </span>
          <span v-if="metadata.readTime" class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ metadata.readTime }}
          </span>
          <span v-if="metadata.author" class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {{ metadata.author }}
          </span>
        </div>
      </header>

      <!-- Markdown 内容 -->
      <article ref="contentRef" class="markdown-content">
        <div @click="handleContentClick" v-html="renderedHtml"></div>
      </article>
    </div>

    <!-- 图片预览 -->
    <ImagePreview :src="previewImage" @close="previewImage = null" />
  </div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js'
import { marked } from 'marked'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import ImagePreview from './ImagePreview.vue'
import TableOfContents from './TableOfContents.vue'

interface Heading {
  id: string
  level: number
  text: string
}

interface Metadata {
  date?: string
  readTime?: string
  author?: string
}

interface Props {
  content: string
  title?: string
  tags?: string[]
  metadata?: Metadata
  theme?: 'light' | 'dark' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'auto',
})

const emit = defineEmits<{
  themeChange: [theme: 'light' | 'dark']
}>()

const contentRef = ref<HTMLElement | null>(null)
const headings = ref<Heading[]>([])
const activeHeadingId = ref<string>('')
const previewImage = ref<string | null>(null)
const isDark = ref(false)
const readingProgress = ref(0)
const showFloatingToc = ref(false)
const renderedHtml = ref('')

// 配置 marked
const renderer = new marked.Renderer()
let headingIndex = 0

renderer.heading = ({ text, depth }) => {
  const id = `heading-${headingIndex++}`
  const level = depth
  headings.value.push({ id, level, text })
  return `<h${level} id="${id}">${text}</h${level}>`
}

renderer.code = ({ text, lang }) => {
  const language = lang || 'plaintext'
  let highlighted = text

  try {
    if (language && hljs.getLanguage(language)) {
      highlighted = hljs.highlight(text, { language }).value
    } else {
      highlighted = hljs.highlightAuto(text).value
    }
  } catch (e) {
    console.error('Highlight error:', e)
  }

  return `
    <div class="code-block">
      <div class="code-header">
        <span class="code-language">${language}</span>
        <button class="copy-btn" data-code="${encodeURIComponent(text)}">
          <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          复制
        </button>
      </div>
      <pre><code class="hljs language-${language}">${highlighted}</code></pre>
    </div>
  `
}

renderer.image = ({ href, title, text }) => {
  return `<img src="${href}" alt="${text}" title="${title || ''}" class="markdown-image" data-preview="${href}" loading="lazy" />`
}

renderer.link = ({ href, title, text }) => {
  const isExternal = href.startsWith('http')
  const target = isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''
  return `<a href="${href}" title="${title || ''}" ${target}>${text}</a>`
}

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
})

const renderMarkdown = () => {
  headings.value = []
  headingIndex = 0

  // 在 Markdown 解析前，先替换首行缩进语法为占位符
  const content = props.content.replace(/>>(.+?)>>/g, '〔INDENT〕$1〔/INDENT〕')

  let html = marked(content) as string

  // 处理自定义语法：点击切换 {{显示文字|隐藏文字}}
  html = html.replace(/\{\{([^|]+)\|([^}]+)\}\}/g, (_match, show, hide) => {
    const showText = show.trim()
    const hideText = hide.trim()
    // 使用较长的文字来计算宽度
    const longerText = showText.length > hideText.length ? showText : hideText
    return `<span class="toggle-text-wrapper">
      <span class="toggle-text" data-show="${showText}" data-hide="${hideText}">
        <span class="toggle-front">${showText}</span>
        <span class="toggle-back">${hideText}</span>
        <span class="toggle-spacer" aria-hidden="true">${longerText}</span>
      </span>
    </span>`
  })

  // 处理自定义语法：悬浮显示 [[遮罩文字]]
  html = html.replace(/\[\[([^\]]+)\]\]/g, (_match, text) => {
    return `<span class="hover-reveal">${text.trim()}</span>`
  })

  // 处理自定义语法：首字下沉 ::文本::
  html = html.replace(/::(.*?)::/g, (_match, text) => {
    const trimmedText = text.trim()
    if (trimmedText.length === 0) return text
    const firstChar = trimmedText[0]
    const restText = trimmedText.slice(1)
    return `<span class="drop-cap-wrapper"><span class="drop-cap">${firstChar}</span>${restText}</span>`
  })

  // 处理自定义语法：首行缩进 - 将占位符替换为带样式的段落
  html = html.replace(/<p>〔INDENT〕([\s\S]+?)〔\/INDENT〕<\/p>/g, (_match, text) => {
    return `<p class="text-indent">${text.trim()}</p>`
  })
  // 处理列表项中的首行缩进
  html = html.replace(/〔INDENT〕([\s\S]+?)〔\/INDENT〕/g, (_match, text) => {
    return `<span class="text-indent-inline">${text.trim()}</span>`
  })

  renderedHtml.value = html
}

const updateTheme = () => {
  if (props.theme === 'auto') {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  } else {
    isDark.value = props.theme === 'dark'
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  emit('themeChange', isDark.value ? 'dark' : 'light')
}

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
const handleThemeChange = () => {
  if (props.theme === 'auto') {
    updateTheme()
  }
}

const handleScroll = () => {
  if (!contentRef.value) return

  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight

  // 修复 NaN 问题：当文档高度小于视口高度时，进度为 100%
  if (docHeight <= 0) {
    readingProgress.value = 100
  } else {
    readingProgress.value = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
  }

  const headingElements = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const scrollPosition = scrollTop + 100

  for (let i = headingElements.length - 1; i >= 0; i--) {
    const element = headingElements[i] as HTMLElement
    if (element.offsetTop <= scrollPosition) {
      activeHeadingId.value = element.id
      break
    }
  }
}

const scrollToTop = () => {
  const start = window.scrollY
  const duration = 800
  const startTime = performance.now()

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = easeInOutCubic(progress)

    window.scrollTo(0, start * (1 - easeProgress))

    if (progress < 1) {
      requestAnimationFrame(animateScroll)
    }
  }

  requestAnimationFrame(animateScroll)
}

const handleContentClick = (e: Event) => {
  const target = e.target as HTMLElement

  if (target.tagName === 'IMG' && target.dataset.preview) {
    e.preventDefault()
    previewImage.value = target.dataset.preview
    return
  }

  // 处理点击切换文字
  if (target.classList.contains('toggle-text') || target.closest('.toggle-text')) {
    e.preventDefault()
    const toggleEl = target.classList.contains('toggle-text')
      ? target
      : (target.closest('.toggle-text') as HTMLElement)

    toggleEl.classList.toggle('flipped')
    return
  }

  if (target.closest('.copy-btn')) {
    e.preventDefault()
    const btn = target.closest('.copy-btn') as HTMLElement
    const code = decodeURIComponent(btn.dataset.code || '')

    void navigator.clipboard.writeText(code).then(() => {
      const originalText = btn.innerHTML
      btn.innerHTML = `
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        已复制
      `
      setTimeout(() => {
        btn.innerHTML = originalText
      }, 2000)
    })
  }
}

// 处理链接下划线动画
const setupLinkUnderlines = () => {
  if (!contentRef.value) return

  // 查找 v-html 渲染的 div 内的所有链接
  const container = contentRef.value.querySelector('div')
  if (!container) return

  const links = container.querySelectorAll('a')

  links.forEach((link) => {
    // 避免重复添加
    if (link.querySelector('.link-underline')) return

    // 创建下划线
    const underline = document.createElement('span')
    underline.className = 'link-underline'
    link.appendChild(underline)

    link.addEventListener('mouseenter', () => {
      underline.style.width = '0'
      underline.style.left = '0'
      underline.style.right = 'auto'
      underline.style.transition = 'none'
      // 强制重排以确保初始状态生效
      void underline.offsetWidth
      underline.style.transition = 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)'
      underline.style.width = '100%'
    })

    link.addEventListener('mouseleave', () => {
      underline.style.left = 'auto'
      underline.style.right = '0'
      underline.style.width = '100%'
      underline.style.transition = 'none'
      // 强制重排
      void underline.offsetWidth
      underline.style.transition = 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)'
      underline.style.width = '0'
      // 等待退出动画完成后，重置为左对齐
      setTimeout(() => {
        underline.style.transition = 'none'
        underline.style.left = '0'
        underline.style.right = 'auto'
      }, 400)
    })
  })
}

watch(() => props.theme, updateTheme)
watch(
  () => props.content,
  async () => {
    renderMarkdown()
    await nextTick()
    // 等待 DOM 完全渲染后再计算
    setTimeout(() => {
      handleScroll()
      setupLinkUnderlines()
    }, 100)
  },
  { immediate: true },
)

onMounted(() => {
  updateTheme()
  mediaQuery.addEventListener('change', handleThemeChange)
  window.addEventListener('scroll', handleScroll)
  // 等待 DOM 完全渲染后再计算进度
  void nextTick(() => {
    setTimeout(() => {
      handleScroll()
      setupLinkUnderlines()
    }, 100)
  })
})

onUnmounted(() => {
  mediaQuery.removeEventListener('change', handleThemeChange)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

.markdown-renderer-pro {
  /* 亮色模式 - 可爱风格 */
  --color-primary: #2d3748;
  --color-secondary: #4a5568;
  --color-accent: #f472b6;
  --color-accent-light: #fce7f3;
  --color-bg: #fef3f8;
  --color-bg-secondary: #fce7f3;
  --color-bg-hover: #fbcfe8;
  --color-text: #374151;
  --color-text-muted: #6b7280;
  --color-border: #fce7f3;
  --color-code-bg: #fff5fb;
  --color-hover: #fce7f3;

  font-family:
    'Nunito',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
  transition:
    background-color 200ms,
    color 200ms !important;
}

.markdown-renderer-pro.dark-mode {
  /* 暗色模式 - 专业高级风格 */
  --color-primary: #e2e8f0;
  --color-secondary: #94a3b8;
  --color-accent: #60a5fa;
  --color-accent-light: #1e3a5f;
  --color-bg: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-hover: #334155;
  --color-text: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-border: #334155;
  --color-code-bg: #1e293b;
  --color-hover: #334155;
}

/* 阅读进度条 */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-accent), #f472b6);
  z-index: 1000;
  transition: width 150ms ease-out;
}

/* 浮动操作按钮 */
.floating-actions {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 100;
}

.action-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-text);
  cursor: pointer;
  transition:
    all 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 200ms ease !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 400ms ease backwards;
}

.action-btn:nth-child(1) {
  animation-delay: 100ms;
}

.action-btn:nth-child(2) {
  animation-delay: 200ms;
}

.action-btn:nth-child(3) {
  animation-delay: 300ms;
}

.action-btn:nth-child(4) {
  animation-delay: 400ms;
}

.action-btn:hover {
  background: var(--color-hover);
  border-color: var(--color-accent);
  color: var(--color-accent);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 20px rgba(244, 114, 182, 0.3);
}

.action-btn:active {
  transform: translateY(-2px) scale(1.02);
}

.action-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  animation: pulse 600ms ease;
}

.action-btn svg {
  width: 20px;
  height: 20px;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

.action-btn:hover svg {
  transform: scale(1.1) rotate(5deg);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.progress-indicator {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 浮动目录 */
.floating-toc {
  position: fixed;
  right: 2rem;
  top: 6rem;
  width: 280px;
  max-height: calc(100vh - 12rem);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  overflow-y: auto;
  z-index: 99;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.toc-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 200ms !important;
}

.close-btn:hover {
  color: var(--color-text);
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

/* 文章容器 */
.article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

/* 文章头部 */
.article-header {
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.article-title {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 1.5rem 0;
  color: var(--color-text);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--color-hover);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  transition:
    all 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 200ms ease !important;
  animation: fadeInScale 400ms ease backwards;
}

.tag:nth-child(1) {
  animation-delay: 100ms;
}

.tag:nth-child(2) {
  animation-delay: 150ms;
}

.tag:nth-child(3) {
  animation-delay: 200ms;
}

.tag:nth-child(4) {
  animation-delay: 250ms;
}

.tag:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(244, 114, 182, 0.3);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.article-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-item svg {
  width: 16px;
  height: 16px;
}

/* Markdown 内容样式 */
.markdown-content {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--color-text);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-family: 'Quicksand', 'Nunito', sans-serif;
  font-weight: 700;
  line-height: 1.4;
  margin-top: 2em;
  margin-bottom: 0.75em;
  scroll-margin-top: 4rem;
  color: var(--color-primary);
}

.markdown-content :deep(h1) {
  font-size: 1.875rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 700;
}

.markdown-content :deep(h4) {
  font-size: 1.125rem;
  font-weight: 600;
}

.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-size: 1rem;
  font-weight: 600;
}

.markdown-content :deep(p) {
  margin: 1.5em 0;
  line-height: 1.75;
}

.markdown-content :deep(a) {
  color: var(--color-accent);
  text-decoration: none;
  position: relative;
  transition: color 200ms !important;
}

.markdown-content :deep(.link-underline) {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #ec4899, #f472b6, #a855f7, #3b82f6);
  pointer-events: none;
  display: block;
  transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 2em;
  margin: 1.5em 0;
}

.markdown-content :deep(li) {
  margin: 0.5em 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-accent);
  padding-left: 1.5rem;
  margin: 2em 0;
  color: var(--color-text-muted);
  font-style: italic;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1em 0;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 2em 0;
  overflow-x: auto;
  display: block;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--color-border);
  padding: 0.75rem 1rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background: var(--color-hover);
  font-weight: 600;
}

.markdown-content :deep(code) {
  background: var(--color-code-bg);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.markdown-content :deep(.code-block) {
  margin: 2em 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-code-bg);
}

.markdown-content :deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-hover);
  border-bottom: 1px solid var(--color-border);
}

.markdown-content :deep(.code-language) {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.markdown-content :deep(.copy-btn) {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 200ms !important;
}

.markdown-content :deep(.copy-btn:hover) {
  background: var(--color-bg);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.markdown-content :deep(.copy-icon) {
  width: 16px;
  height: 16px;
}

.markdown-content :deep(.code-block pre) {
  margin: 0;
  padding: 1.25rem;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.6;
}

.markdown-content :deep(.code-block code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-content :deep(.markdown-image) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 2em 0;
  cursor: pointer;
  transition:
    transform 200ms,
    box-shadow 200ms !important;
  display: block;
}

.markdown-content :deep(.markdown-image:hover) {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 自定义语法：点击切换文字 - 3D 翻转效果 */
.markdown-content :deep(.toggle-text-wrapper) {
  display: inline;
  perspective: 1000px;
}

.markdown-content :deep(.toggle-text) {
  display: inline-block;
  position: relative;
  cursor: pointer;
  user-select: none;
  transform-style: preserve-3d;
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1) !important;
  vertical-align: baseline;
  will-change: transform;
  -webkit-transform-style: preserve-3d;
}

.markdown-content :deep(.toggle-spacer) {
  display: inline;
  visibility: hidden;
  white-space: nowrap;
}

.markdown-content :deep(.toggle-front),
.markdown-content :deep(.toggle-back) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: inline-block;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  white-space: nowrap;
  text-align: center;
  text-decoration: underline;
  text-decoration-style: dashed;
  text-decoration-color: var(--color-accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  transition: all 250ms !important;
}

.markdown-content :deep(.toggle-front) {
  color: inherit;
}

.markdown-content :deep(.toggle-back) {
  color: var(--color-text-muted);
  transform: rotateX(180deg);
  text-decoration-style: dotted;
}

.markdown-content :deep(.toggle-text:hover .toggle-front),
.markdown-content :deep(.toggle-text:hover .toggle-back) {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

.markdown-content :deep(.toggle-text.flipped) {
  transform: rotateX(180deg);
  -webkit-transform: rotateX(180deg);
}

/* 自定义语法：悬浮显示 */
.markdown-content :deep(.hover-reveal) {
  display: inline-block;
  background: var(--color-text);
  color: var(--color-text);
  border-radius: 4px;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
  user-select: none;
}

.markdown-content :deep(.hover-reveal:hover) {
  background: var(--color-accent-light);
  color: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 114, 182, 0.2);
}

/* 自定义语法：首字下沉 */
.markdown-content :deep(.drop-cap-wrapper) {
  display: inline;
}

.markdown-content :deep(.drop-cap) {
  float: left;
  font-size: 2.5em;
  line-height: 0.8;
  margin-right: 0.1em;
  margin-top: 0.1em;
  font-family: 'Quicksand', sans-serif;
}

/* 自定义语法：首行缩进 */
.markdown-content :deep(.text-indent) {
  text-indent: 2em;
}

.markdown-content :deep(.text-indent-inline) {
  display: inline-block;
  text-indent: 2em;
}

/* 过渡动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 300ms ease;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1280px) {
  .floating-toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-container {
    padding: 2rem 1rem;
  }

  .article-title {
    font-size: 1.75rem;
  }

  .floating-actions {
    right: 1rem;
    bottom: 1rem;
  }

  .action-btn,
  .progress-indicator {
    width: 40px;
    height: 40px;
  }

  .action-btn svg {
    width: 18px;
    height: 18px;
  }

  .progress-indicator {
    font-size: 0.625rem;
  }

  .markdown-content {
    font-size: 1rem;
  }

  .markdown-content :deep(h1) {
    font-size: 1.5rem;
  }

  .markdown-content :deep(h2) {
    font-size: 1.375rem;
  }

  .markdown-content :deep(h3) {
    font-size: 1.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .markdown-renderer-pro,
  .markdown-content :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>
