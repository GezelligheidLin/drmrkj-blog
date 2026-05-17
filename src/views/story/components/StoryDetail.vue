<template>
  <main class="story-detail-page">
    <div class="detail-backdrop" aria-hidden="true"></div>

    <div class="page-reading-progress" aria-label="阅读进度">
      <i :style="{ transform: `scaleX(${readingProgress / 100})` }"></i>
    </div>

    <button class="floating-theme-toggle" aria-label="切换主题" @click="handleThemeToggle">
      <svg
        v-if="themeStore.isLight()"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="5"></circle>
        <path
          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        ></path>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z"></path>
      </svg>
      <span>主题</span>
    </button>

    <button
      class="back-to-top-float"
      :style="{ '--progress-angle': `${readingProgress * 3.6}deg` }"
      aria-label="回到顶部"
      @click="handleScrollToTop"
    >
      <span>{{ readingProgress }}%</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5"></path>
        <path d="M5 12l7-7 7 7"></path>
      </svg>
    </button>

    <section class="detail-shell" aria-labelledby="article-title">
      <button class="article-back-link" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
        <span>返回故事列表</span>
      </button>

      <header class="article-cover">
        <div class="cover-main">
          <span class="eyebrow">Engineering Notes / NO.{{ article.id }}</span>
          <h1 id="article-title" font="maoken">{{ article.title }}</h1>
          <p>{{ article.description }}</p>
          <div class="article-tags" aria-label="文章标签">
            <span v-for="tag in article.tags" :key="tag">{{ tag }}</span>
          </div>

          <div class="mobile-cover-meta" aria-label="文章信息">
            <span>{{ formatFullDate(article.date) }}</span>
            <span>{{ article.readingTime }} 分钟</span>
            <span>{{ article.wordCount.toLocaleString('zh-CN') }} 字</span>
          </div>

          <div class="insight-strip" aria-label="文章重点">
            <article v-for="insight in article.insights" :key="insight.title" class="insight-card">
              <span>{{ insight.kicker }}</span>
              <strong>{{ insight.title }}</strong>
            </article>
          </div>
        </div>

        <aside class="cover-panel" aria-label="文章辅助信息">
          <div class="summary-block">
            <span>AI Summary</span>
            <p>{{ article.aiSummary }}</p>
          </div>

          <div class="meta-grid">
            <div v-for="item in articleMeta" :key="item.label">
              <span>{{ item.value }}</span>
              <small>{{ item.label }}</small>
            </div>
          </div>
        </aside>
      </header>

      <div class="detail-ruler" aria-hidden="true">
        <span>DRMRKJ</span>
        <span>ARTICLE / NOTES / CODE</span>
        <span>NO.{{ article.id }}</span>
      </div>

      <div ref="readingLayoutRef" class="reading-layout">
        <aside
          ref="desktopOutlineRef"
          class="desktop-outline"
          :style="{ transform: `translateY(${outlineOffset}px)` }"
          aria-label="文章大纲"
        >
          <div class="outline-panel">
            <div class="outline-header">
              <span>Outline</span>
              <small>{{ outlineHeadings.length }} 个章节</small>
            </div>
            <nav class="outline-list">
              <button
                v-for="heading in outlineHeadings"
                :key="heading.id"
                :class="[
                  'outline-item',
                  `level-${heading.level}`,
                  { active: activeHeadingId === heading.id },
                ]"
                @click="scrollToHeading(heading.id)"
              >
                {{ heading.text }}
              </button>
            </nav>
          </div>
        </aside>

        <article class="reader-surface">
          <MarkdownRendererPro
            :content="articleBody"
            :theme="currentTheme"
            @theme-change="handleThemeChange"
          />
        </article>
      </div>
    </section>

    <Transition name="mobile-outline-fade">
      <div
        v-if="isMobileSummaryOpen"
        class="mobile-outline-sheet-mask"
        aria-hidden="true"
        @click="isMobileSummaryOpen = false"
      ></div>
    </Transition>

    <Transition name="mobile-outline-slide">
      <section
        v-if="isMobileSummaryOpen"
        class="mobile-outline-sheet"
        aria-label="AI 摘要与文章大纲"
        role="dialog"
        aria-modal="true"
      >
        <div class="mobile-outline-sheet-handle" aria-hidden="true"></div>
        <header class="mobile-outline-sheet-header">
          <div>
            <span>AI Summary</span>
            <strong>文章大纲</strong>
          </div>
          <button aria-label="关闭大纲" @click="isMobileSummaryOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </header>
        <p>{{ article.aiSummary }}</p>
        <nav class="mobile-outline-list" aria-label="移动端文章大纲">
          <button
            v-for="heading in outlineHeadings"
            :key="heading.id"
            :class="[
              'mobile-outline-item',
              `level-${heading.level}`,
              { active: activeHeadingId === heading.id },
            ]"
            @click="scrollToHeading(heading.id)"
          >
            {{ heading.text }}
          </button>
        </nav>
      </section>
    </Transition>

    <div class="mobile-reading-dock" aria-label="移动端阅读工具">
      <button @click="isMobileSummaryOpen = !isMobileSummaryOpen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h12M4 18h8"></path>
        </svg>
        大纲
      </button>
      <div class="mobile-progress">
        <strong>{{ readingProgress }}%</strong>
        <span><i :style="{ width: `${readingProgress}%` }"></i></span>
      </div>
      <button aria-label="切换主题" @click="handleThemeToggle">
        <svg
          v-if="themeStore.isLight()"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <path
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          ></path>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
      <button aria-label="回到顶部" @click="scrollToTop">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19V5M5 12l7-7 7 7"></path>
        </svg>
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MarkdownRendererPro from '@/components/MarkdownRendererPro.vue'
import { useThemeStore } from '@/stores/modules/theme'

interface OutlineHeading {
  id: string
  level: number
  text: string
}

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const isMobileSummaryOpen = ref(false)
const readingProgress = ref(0)
const activeHeadingId = ref('')
const readingLayoutRef = ref<HTMLElement | null>(null)
const desktopOutlineRef = ref<HTMLElement | null>(null)
const outlineOffset = ref(0)

// 模拟文章数据（实际应该从API获取）
const article = ref({
  id: Number(route.params.id),
  title: '探索 Vue 3 Composition API 的魔法',
  description: '从逻辑组织、类型推导到组合式复用，重新理解 Vue 3 写法背后的工程价值。',
  date: '2026-05-06',
  tags: ['Vue', 'Frontend', 'JavaScript'],
  readingTime: 8,
  wordCount: 3200,
  aiSummary:
    '这篇文章适合已经熟悉 Vue 基础语法的开发者。核心观点是：Composition API 不是替代 Options API 的语法糖，而是一种更靠近业务逻辑边界的组织方式，尤其适合复杂状态、类型推导和可复用能力沉淀。',
  insights: [
    {
      kicker: 'Focus 01',
      title: '按逻辑组织代码',
      text: '把状态、计算、监听和副作用收束在同一个关注点里，减少跨选项跳转。',
    },
    {
      kicker: 'Focus 02',
      title: '类型体验更稳定',
      text: '在 TypeScript 项目中，组合式函数可以让参数、返回值和响应式状态自然推导。',
    },
    {
      kicker: 'Focus 03',
      title: '复用边界更清晰',
      text: '用 composable 承载可复用逻辑，组件只保留视图组合和交互表达。',
    },
  ],
  content: `# 探索 Vue 3 Composition API 的魔法

>>深入了解 Vue 3 的 Composition API，如何让你的代码更加优雅和可维护。这是一篇带有首行缩进的开篇段落。>>

::这是一段带有首字下沉效果的文本，第一个字会变大并下沉到文本中。首字下沉是一种经典的排版技巧，常见于书籍、杂志和报纸的开篇段落。它能够吸引读者的注意力，让文章的开头更加醒目和优雅。在现代网页设计中，首字下沉也被广泛应用于博客文章、新闻报道和长篇内容的排版中，为读者带来更好的阅读体验。通过使用 CSS 的 float 属性和适当的字体大小调整，我们可以轻松实现这种效果。::

## 什么是 Composition API

Composition API 是 Vue 3 引入的一组新的 API，它提供了一种更灵活的方式来组织组件逻辑。

### 交互功能演示

试试这些有趣的交互元素：

1. **点击切换文字**：{{点击我|已点击}} 试试点击这个元素
2. **悬浮显示**：这是一段 [[隐藏的秘密文字]] 需要悬浮才能看到
3. **组合使用**：{{显示答案|答案是：42}} 和 [[提示：先点击左边]]

### 核心概念

Composition API 的核心概念包括：

- **响应式系统**：\`ref\` 和 \`reactive\`
- **生命周期钩子**：\`onMounted\`、\`onUnmounted\` 等
- **计算属性**：\`computed\`
- **侦听器**：\`watch\` 和 \`watchEffect\`

## 为什么使用 Composition API

### 1. 更好的代码组织

使用 Composition API，你可以按照逻辑关注点组织代码，而不是按照选项类型。

\`\`\`javascript
// 传统的 Options API
export default {
  data() {
    return {
      count: 0,
      message: 'Hello'
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
\`\`\`

\`\`\`javascript
// Composition API
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const message = ref('Hello')

    const increment = () => {
      count.value++
    }

    return { count, message, increment }
  }
}
\`\`\`

### 2. 更好的类型推导

TypeScript 可以更好地推导 Composition API 的类型。

\`\`\`typescript
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const user = ref<User>({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
})

const displayName = computed(() => user.value.name)
\`\`\`

### 3. 更好的逻辑复用

通过组合式函数（Composables），可以轻松复用逻辑。

\`\`\`typescript
// useCounter.ts
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue

  return { count, increment, decrement, reset }
}
\`\`\`

## 响应式系统详解

### ref vs reactive

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 基本类型和对象 | 仅对象 |
| 访问方式 | .value | 直接访问 |
| 解构 | 需要 toRefs | 会失去响应性 |
| 重新赋值 | 支持 | 不支持 |

### 示例代码

\`\`\`typescript
import { ref, reactive, toRefs } from 'vue'

// ref 示例
const count = ref(0)
console.log(count.value) // 0
count.value++

// reactive 示例
const state = reactive({
  count: 0,
  message: 'Hello'
})
console.log(state.count) // 0
state.count++

// 解构 reactive 对象
const { count: reactiveCount, message } = toRefs(state)
\`\`\`

## 总结

Composition API 为 Vue 3 带来了更强大、更灵活的代码组织方式。通过合理使用 Composition API，可以编写出更易维护、更易测试的代码。

---

**相关资源：**

- [Vue 3 官方文档](https://vuejs.org/)
- [Composition API RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api.md)
- [VueUse](https://vueuse.org/) - 实用的组合式函数集合
`,
})

const currentTheme = computed(() => themeStore.mode)

const articleBody = computed(() => article.value.content.replace(/^#\s+.+\n+/, ''))

const outlineHeadings = computed<OutlineHeading[]>(() => {
  let index = 0
  return articleBody.value
    .split('\n')
    .map((line) => {
      const match = /^(#{2,4})\s+(.+)$/.exec(line.trim())
      if (!match) return null

      const heading = {
        id: `heading-${index}`,
        level: match[1].length,
        text: match[2].replace(/[`*_]/g, ''),
      }
      index += 1
      return heading
    })
    .filter((heading): heading is OutlineHeading => Boolean(heading))
})

const articleMeta = computed(() => [
  { label: '发布日期', value: formatFullDate(article.value.date) },
  { label: '阅读时长', value: `${article.value.readingTime} 分钟` },
  { label: '字数', value: `${article.value.wordCount.toLocaleString('zh-CN')} 字` },
])

const goBack = () => {
  router.back()
}

const handleThemeChange = (newTheme: 'light' | 'dark') => {
  themeStore.setTheme(newTheme)
}

const handleThemeToggle = () => {
  themeStore.toggleTheme()
}

const formatFullDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const updateReadingState = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value =
    docHeight <= 0 ? 100 : Math.round(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)))

  updateOutlineOffset()

  for (let index = outlineHeadings.value.length - 1; index >= 0; index -= 1) {
    const heading = outlineHeadings.value[index]
    const element = document.getElementById(heading.id)
    if (element && element.getBoundingClientRect().top <= 120) {
      activeHeadingId.value = heading.id
      return
    }
  }

  activeHeadingId.value = outlineHeadings.value[0]?.id || ''
}

const updateOutlineOffset = () => {
  if (!readingLayoutRef.value || !desktopOutlineRef.value) {
    outlineOffset.value = 0
    return
  }

  const stickyTop = 24
  const layoutRect = readingLayoutRef.value.getBoundingClientRect()
  const outlineHeight = desktopOutlineRef.value.offsetHeight
  const layoutHeight = readingLayoutRef.value.offsetHeight
  const maxOffset = Math.max(0, layoutHeight - outlineHeight)
  const nextOffset = Math.min(maxOffset, Math.max(0, stickyTop - layoutRect.top))

  outlineOffset.value = nextOffset
}

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (!element) return

  isMobileSummaryOpen.value = false
  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - 28,
    behavior: 'smooth',
  })
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScrollToTop = () => {
  scrollToTop()
}

onMounted(() => {
  updateReadingState()
  window.addEventListener('scroll', updateReadingState, { passive: true })
  window.addEventListener('resize', updateReadingState)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateReadingState)
  window.removeEventListener('resize', updateReadingState)
})
</script>

<style scoped>
.story-detail-page {
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  color: var(--text-primary);
  background:
    linear-gradient(180deg, rgba(127, 127, 127, 0.035), transparent 280px), var(--bg-primary);
  isolation: isolate;
}

.detail-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    linear-gradient(115deg, transparent 0 24%, rgba(135, 206, 250, 0.09) 31%, transparent 42%),
    linear-gradient(70deg, transparent 0 62%, rgba(255, 159, 10, 0.055) 70%, transparent 80%),
    linear-gradient(180deg, rgba(127, 127, 127, 0.045), transparent 42%),
    linear-gradient(var(--border-secondary) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-secondary) 1px, transparent 1px);
  background-size:
    130% 130%,
    140% 120%,
    100% 100%,
    64px 64px,
    64px 64px;
  mask-image: linear-gradient(to bottom, black 0%, black 72%, transparent 100%);
  opacity: 0.72;
  animation: detail-backdrop-enter 760ms ease backwards;
}

.detail-backdrop::before {
  position: absolute;
  inset: -28%;
  content: '';
  background:
    repeating-linear-gradient(
      118deg,
      transparent 0 78px,
      rgba(135, 206, 250, 0.08) 79px,
      transparent 82px,
      transparent 150px,
      rgba(48, 209, 88, 0.045) 151px,
      transparent 154px
    ),
    linear-gradient(
      100deg,
      transparent 0 38%,
      rgba(135, 206, 250, 0.105) 43%,
      rgba(255, 159, 10, 0.06) 47%,
      transparent 54%,
      transparent 74%,
      rgba(90, 200, 250, 0.08) 80%,
      transparent 86%
    );
  opacity: 0.44;
  transform: rotate(-8deg);
}

.story-detail-page::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  background:
    repeating-linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.035) 0,
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px,
      transparent 7px
    ),
    linear-gradient(90deg, transparent 0 48%, rgba(135, 206, 250, 0.045) 50%, transparent 52%);
  opacity: 0.16;
}

.story-detail-page::after {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  opacity: 0.12;
  background-image:
    linear-gradient(90deg, transparent 0, rgba(127, 127, 127, 0.16) 1px, transparent 1px),
    linear-gradient(0deg, transparent 0, rgba(127, 127, 127, 0.1) 1px, transparent 1px);
  background-size:
    180px 100%,
    100% 220px;
}

@keyframes detail-backdrop-enter {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 0.72;
  }
}

@keyframes detail-soft-rise {
  0% {
    opacity: 0;
    filter: blur(8px);
    transform: translate3d(0, 18px, 0);
  }

  100% {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }
}

@keyframes detail-soft-slide {
  0% {
    opacity: 0;
    filter: blur(6px);
    transform: translate3d(-10px, 10px, 0);
  }

  100% {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }
}

.page-reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 120;
  width: 100%;
  height: 4px;
  overflow: hidden;
  background: color-mix(in srgb, var(--border-primary) 38%, transparent);
}

.page-reading-progress i {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  transform-origin: left center;
}

.floating-theme-toggle {
  position: fixed;
  top: clamp(142px, 34vh, 330px);
  right: 18px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 86px;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--navbar-bg) 94%, transparent),
      color-mix(in srgb, var(--card-bg) 86%, transparent)
    ),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--accent-primary) 16%, transparent),
      transparent 64%
    );
  border: 1px solid color-mix(in srgb, var(--border-primary) 88%, transparent);
  border-right-color: color-mix(in srgb, var(--accent-primary) 52%, transparent);
  border-radius: 18px 7px 7px 18px;
  color: var(--text-primary);
  font: inherit;
  box-shadow:
    inset -2px 0 0 color-mix(in srgb, var(--accent-primary) 58%, transparent),
    0 16px 42px rgba(0, 0, 0, 0.14);
  cursor: pointer;
  transition:
    background-color 180ms ease,
    border-radius 220ms ease,
    color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
  backdrop-filter: blur(16px);
}

.floating-theme-toggle:hover {
  border-radius: 18px 10px 10px 18px;
  color: var(--accent-primary);
  transform: translateX(-3px);
  box-shadow:
    inset -3px 0 0 var(--accent-primary),
    0 18px 50px color-mix(in srgb, var(--accent-primary) 18%, rgba(0, 0, 0, 0.12));
}

.floating-theme-toggle:focus-visible,
.back-to-top-float:focus-visible,
.article-back-link:focus-visible,
.outline-item:focus-visible,
.reading-card button:focus-visible,
.mobile-outline-item:focus-visible,
.mobile-outline-sheet-header button:focus-visible,
.mobile-reading-dock button:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
}

.floating-theme-toggle svg {
  width: 21px;
  height: 21px;
}

.floating-theme-toggle span {
  font-size: 0.76rem;
  font-weight: 900;
  writing-mode: vertical-rl;
}

.back-to-top-float {
  position: fixed;
  right: clamp(18px, 3vw, 42px);
  bottom: calc(24px + env(safe-area-inset-bottom));
  z-index: 100;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  padding: 0;
  color: var(--text-primary);
  background:
    linear-gradient(var(--card-bg), var(--card-bg)) padding-box,
    conic-gradient(
        var(--accent-primary) var(--progress-angle),
        color-mix(in srgb, var(--border-primary) 60%, transparent) 0
      )
      border-box;
  border: 2px solid transparent;
  border-radius: 50%;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.14);
  cursor: pointer;
  transition:
    border-radius 180ms ease,
    color 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.back-to-top-float:hover {
  color: var(--accent-primary);
  transform: translateY(-3px);
  box-shadow: 0 20px 48px color-mix(in srgb, var(--accent-primary) 18%, rgba(0, 0, 0, 0.16));
}

.back-to-top-float span {
  font-size: 0.66rem;
  font-weight: 900;
  line-height: 1;
}

.back-to-top-float svg {
  width: 18px;
  height: 18px;
  margin-top: -4px;
}

.article-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  margin: 0 0 12px;
  padding: 0 12px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    color 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
  animation: detail-soft-slide 520ms cubic-bezier(0.22, 1, 0.36, 1) 60ms backwards;
}

.article-back-link:hover {
  color: var(--accent-primary);
  background: var(--card-hover);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.article-back-link svg {
  width: 18px;
  height: 18px;
}

.detail-shell {
  position: relative;
  z-index: 1;
  width: min(1260px, calc(100% - 36px));
  margin: 0 auto;
  padding: 34px 0 76px;
}

.article-cover {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 18px;
  align-items: stretch;
  min-height: 196px;
  padding: 18px;
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  animation: detail-soft-rise 640ms cubic-bezier(0.22, 1, 0.36, 1) 120ms backwards;
}

.cover-main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: clamp(6px, 1vw, 12px);
}

.eyebrow,
.summary-block span,
.outline-header span,
.reading-card > span,
.insight-card span {
  color: var(--accent-primary);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.cover-main h1 {
  max-width: 820px;
  margin: 8px 0 10px;
  color: var(--text-primary);
  font-size: clamp(1.9rem, 4.1vw, 3.3rem);
  line-height: 1.06;
  letter-spacing: 0;
}

.cover-main p {
  max-width: 780px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.98rem;
  line-height: 1.55;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 10px;
}

.article-tags span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 10px;
  color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 24%, transparent);
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1;
}

.mobile-cover-meta {
  display: none;
}

.insight-card,
.cover-panel,
.outline-panel,
.reading-card,
.reader-surface {
  border: 1px solid var(--border-primary);
  background: color-mix(in srgb, var(--card-bg) 82%, transparent);
  box-shadow: 0 14px 46px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(12px);
}

.cover-panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(127, 127, 127, 0.05);
}

.summary-block {
  display: grid;
  align-content: start;
  gap: 8px;
}

.summary-block p,
.insight-card p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.48;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.meta-grid div {
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-primary) 52%, transparent);
}

.meta-grid span {
  display: block;
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 800;
  white-space: nowrap;
}

.meta-grid small {
  color: var(--text-tertiary);
}

.insight-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 10px 0 0;
}

.insight-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 8px 10px;
  border-radius: 10px;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease;
}

.insight-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
  background: var(--card-hover);
}

.insight-card strong {
  color: var(--text-primary);
  font-size: 0.88rem;
  line-height: 1.45;
}

.reading-layout {
  display: grid;
  grid-template-columns: 224px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  margin-top: 28px;
  padding-left: 0;
}

.detail-ruler {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-top: 24px;
  color: var(--text-tertiary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0;
  animation: detail-soft-rise 560ms cubic-bezier(0.22, 1, 0.36, 1) 190ms backwards;
}

.detail-ruler::before,
.detail-ruler::after {
  flex: 1;
  height: 1px;
  content: '';
  background: var(--border-primary);
}

.desktop-outline {
  position: relative;
  top: 0;
  z-index: 20;
  width: 100%;
  max-height: calc(100vh - 128px);
}

.outline-panel,
.reading-card {
  border-radius: 16px;
  padding: 12px;
}

.outline-panel {
  animation: detail-soft-slide 620ms cubic-bezier(0.22, 1, 0.36, 1) 240ms backwards;
}

.outline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-secondary);
}

.outline-header small {
  color: var(--text-tertiary);
  white-space: nowrap;
}

.outline-list {
  display: grid;
  gap: 4px;
  max-height: calc(100vh - 214px);
  overflow: auto;
}

.outline-item {
  width: 100%;
  min-height: 36px;
  padding: 8px;
  color: var(--text-secondary);
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
  line-height: 1.45;
  transition:
    color 180ms ease,
    background-color 180ms ease;
}

.outline-item.level-3 {
  padding-left: 18px;
}

.outline-item.level-4 {
  padding-left: 28px;
}

.outline-item:hover,
.outline-item.active {
  color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
}

.reader-surface {
  min-width: 0;
  width: 100%;
  max-width: none;
  overflow: hidden;
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: 0 18px 64px rgba(0, 0, 0, 0.1);
  animation: detail-soft-rise 680ms cubic-bezier(0.22, 1, 0.36, 1) 280ms backwards;
}

.reading-card {
  display: grid;
  gap: 10px;
  background: color-mix(in srgb, var(--navbar-bg) 90%, transparent);
  box-shadow: 0 14px 42px rgba(0, 0, 0, 0.16);
}

.reading-card button {
  display: grid;
  place-items: center;
  align-items: center;
  min-height: 40px;
  padding: 0;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 1px solid var(--border-secondary);
  border-radius: 11px;
  cursor: pointer;
  font: inherit;
}

.reading-card button:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: var(--card-hover);
}

.reading-card svg {
  width: 17px;
  height: 17px;
}

.mobile-outline-sheet-mask,
.mobile-outline-sheet {
  display: none;
}

.mobile-reading-dock {
  display: none;
}

.story-detail-page :deep(.markdown-renderer-pro) {
  min-height: auto;
  background: transparent;
  font-family: ui-serif, 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
}

.story-detail-page :deep(.article-container) {
  max-width: none;
  padding: 22px clamp(18px, 2vw, 32px) 58px;
}

.story-detail-page :deep(.article-header) {
  display: none;
}

.story-detail-page :deep(.reading-progress) {
  display: none;
}

.story-detail-page :deep(.markdown-content) {
  --reader-measure: 1080px;
  --reader-muted: color-mix(in srgb, var(--text-primary) 70%, var(--text-secondary));
  --reader-soft: color-mix(in srgb, var(--card-bg) 78%, var(--bg-primary));
  max-width: var(--reader-measure);
  margin: 0 auto;
  color: var(--text-primary);
  font-size: 1.02rem;
  line-height: 1.78;
  overflow-wrap: break-word;
  text-rendering: optimizeLegibility;
}

.story-detail-page :deep(.markdown-content h1),
.story-detail-page :deep(.markdown-content h2),
.story-detail-page :deep(.markdown-content h3),
.story-detail-page :deep(.markdown-content h4),
.story-detail-page :deep(.markdown-content h5),
.story-detail-page :deep(.markdown-content h6) {
  position: relative;
  color: var(--text-primary);
  font-family: ui-sans-serif, 'Source Han Sans SC', 'Noto Sans SC', system-ui, sans-serif;
  font-weight: 850;
  letter-spacing: 0;
  line-height: 1.22;
  scroll-margin-top: 88px;
}

.story-detail-page :deep(.markdown-content h1) {
  margin: 0 0 0.68em;
  padding-bottom: 0.28em;
  border-bottom: 1px solid color-mix(in srgb, var(--border-primary) 82%, transparent);
  font-size: clamp(1.9rem, 3.2vw, 2.55rem);
}

.story-detail-page :deep(.markdown-content h2) {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 1.08em 0 0.42em;
  padding-top: 0.15em;
  font-size: clamp(1.35rem, 2.2vw, 1.72rem);
}

.story-detail-page :deep(.markdown-content h2::before) {
  display: block;
  flex: 0 0 auto;
  width: 9px;
  height: 9px;
  content: '';
  background: var(--accent-primary);
  border-radius: 50%;
  box-shadow:
    0 0 0 6px color-mix(in srgb, var(--accent-primary) 10%, transparent),
    0 0 20px color-mix(in srgb, var(--accent-primary) 48%, transparent);
}

.story-detail-page :deep(.markdown-content h3) {
  margin: 0.95em 0 0.36em;
  padding-left: 14px;
  border-left: 3px solid color-mix(in srgb, var(--accent-primary) 78%, transparent);
  font-size: clamp(1.12rem, 1.6vw, 1.28rem);
}

.story-detail-page :deep(.markdown-content h4) {
  margin: 0.9em 0 0.32em;
  color: color-mix(in srgb, var(--text-primary) 90%, var(--accent-primary));
  font-size: 1.05rem;
}

.story-detail-page :deep(.markdown-content h5),
.story-detail-page :deep(.markdown-content h6) {
  margin: 0.8em 0 0.28em;
  color: var(--text-secondary);
  font-size: 0.92rem;
  text-transform: uppercase;
}

.story-detail-page :deep(.markdown-content h6) {
  color: var(--text-tertiary);
}

.story-detail-page :deep(.markdown-content h1 + *),
.story-detail-page :deep(.markdown-content h2 + *),
.story-detail-page :deep(.markdown-content h3 + *),
.story-detail-page :deep(.markdown-content h4 + *) {
  margin-top: 0;
}

.story-detail-page :deep(.markdown-content p) {
  margin: 0.72em 0;
  color: var(--reader-muted);
  line-height: 1.82;
}

.story-detail-page :deep(.markdown-content strong) {
  color: var(--text-primary);
  font-weight: 800;
}

.story-detail-page :deep(.markdown-content em) {
  color: color-mix(in srgb, var(--text-primary) 84%, var(--accent-primary));
  font-style: normal;
}

.story-detail-page :deep(.markdown-content a) {
  color: var(--accent-primary);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--accent-primary) 38%, transparent);
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  transition:
    color 180ms ease,
    text-decoration-color 180ms ease;
}

.story-detail-page :deep(.markdown-content a:hover) {
  color: var(--accent-secondary);
  text-decoration-color: currentColor;
}

.story-detail-page :deep(.markdown-content ul),
.story-detail-page :deep(.markdown-content ol) {
  display: grid;
  gap: 0.55em;
  margin: 1.2em 0 1.45em;
  padding-left: 1.35em;
  color: var(--reader-muted);
}

.story-detail-page :deep(.markdown-content li) {
  padding-left: 0.18em;
  line-height: 1.78;
}

.story-detail-page :deep(.markdown-content li::marker) {
  color: var(--accent-primary);
  font-weight: 800;
}

.story-detail-page :deep(.markdown-content li > p) {
  margin: 0.35em 0;
}

.story-detail-page :deep(.markdown-content blockquote) {
  position: relative;
  margin: 1.65em 0;
  padding: 18px 20px 18px 22px;
  color: color-mix(in srgb, var(--text-primary) 74%, var(--text-secondary));
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--accent-primary) 10%, transparent),
      transparent 58%
    ),
    color-mix(in srgb, var(--card-bg) 80%, var(--bg-primary));
  border: 1px solid color-mix(in srgb, var(--accent-primary) 18%, var(--border-primary));
  border-left: 4px solid color-mix(in srgb, var(--accent-primary) 82%, transparent);
  border-radius: 14px;
  font-style: normal;
}

.story-detail-page :deep(.markdown-content blockquote p) {
  margin: 0.65em 0;
  color: inherit;
}

.story-detail-page :deep(.markdown-content hr) {
  height: 1px;
  margin: 2.4em 0;
  overflow: visible;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--border-primary) 86%, transparent),
    transparent
  );
  border: 0;
}

.story-detail-page :deep(.markdown-content hr::after) {
  display: block;
  width: 36px;
  height: 3px;
  margin: -1px auto 0;
  content: '';
  background: var(--accent-primary);
  border-radius: 999px;
  opacity: 0.76;
}

.story-detail-page :deep(.markdown-content table) {
  display: block;
  width: 100%;
  margin: 1.7em 0;
  overflow-x: auto;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--border-primary);
  border-radius: 14px;
}

.story-detail-page :deep(.markdown-content th),
.story-detail-page :deep(.markdown-content td) {
  min-width: 128px;
  padding: 12px 14px;
  color: var(--reader-muted);
  text-align: left;
  vertical-align: top;
  border-right: 1px solid var(--border-secondary);
  border-bottom: 1px solid var(--border-secondary);
}

.story-detail-page :deep(.markdown-content th) {
  color: var(--text-primary);
  background: color-mix(in srgb, var(--accent-primary) 8%, var(--card-bg));
  font-family: ui-sans-serif, 'Source Han Sans SC', 'Noto Sans SC', system-ui, sans-serif;
  font-size: 0.86rem;
  font-weight: 850;
}

.story-detail-page :deep(.markdown-content tr:last-child td) {
  border-bottom: 0;
}

.story-detail-page :deep(.markdown-content th:last-child),
.story-detail-page :deep(.markdown-content td:last-child) {
  border-right: 0;
}

.story-detail-page :deep(.markdown-content :not(pre) > code) {
  padding: 0.16em 0.42em;
  color: color-mix(in srgb, var(--accent-primary) 86%, var(--text-primary));
  background: color-mix(in srgb, var(--accent-primary) 10%, var(--card-bg));
  border: 1px solid color-mix(in srgb, var(--accent-primary) 18%, transparent);
  border-radius: 6px;
  font-family: 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 0.88em;
}

.story-detail-page :deep(.markdown-content .code-block) {
  margin: 1.75em 0;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-primary) 88%, black);
  border: 1px solid color-mix(in srgb, var(--border-primary) 82%, transparent);
  border-radius: 14px;
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.12);
}

.story-detail-page :deep(.markdown-content .code-header) {
  padding: 10px 14px;
  background: color-mix(in srgb, var(--card-bg) 82%, var(--bg-primary));
  border-bottom: 1px solid var(--border-secondary);
}

.story-detail-page :deep(.markdown-content .code-language) {
  color: var(--text-tertiary);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0;
}

.story-detail-page :deep(.markdown-content .copy-btn) {
  min-height: 32px;
  padding: 0 10px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  font-size: 0.78rem;
}

.story-detail-page :deep(.markdown-content .copy-btn:hover) {
  color: var(--accent-primary);
  background: var(--card-hover);
  border-color: var(--accent-primary);
}

.story-detail-page :deep(.markdown-content .code-block pre) {
  padding: 18px;
  font-size: 0.88rem;
  line-height: 1.68;
}

.story-detail-page :deep(.markdown-content .code-block code) {
  font-family: 'Cascadia Code', 'JetBrains Mono', Consolas, monospace;
}

.story-detail-page :deep(.markdown-content .markdown-image) {
  display: block;
  width: min(100%, 860px);
  margin: 1.8em auto;
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.14);
}

.story-detail-page :deep(.markdown-content kbd) {
  display: inline-flex;
  align-items: center;
  min-height: 1.55em;
  padding: 0 0.42em;
  color: var(--text-primary);
  background: color-mix(in srgb, var(--card-bg) 88%, var(--bg-primary));
  border: 1px solid var(--border-secondary);
  border-bottom-width: 2px;
  border-radius: 6px;
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 0.82em;
}

.story-detail-page :deep(.floating-actions) {
  display: none;
}

.story-detail-page :deep(.floating-actions .action-btn:first-child),
.story-detail-page :deep(.floating-toc) {
  display: none;
}

@media (max-width: 980px) {
  .floating-theme-toggle {
    display: none;
  }

  .back-to-top-float {
    display: none;
  }

  .desktop-outline {
    display: none;
  }

  .mobile-outline-sheet-mask {
    position: fixed;
    inset: 0;
    z-index: 92;
    display: block;
    background: rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(2px);
  }

  .mobile-outline-sheet {
    position: fixed;
    right: 10px;
    bottom: calc(74px + env(safe-area-inset-bottom));
    left: 10px;
    z-index: 95;
    display: grid;
    max-height: min(68vh, 560px);
    overflow: hidden;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--navbar-bg) 96%, transparent),
        color-mix(in srgb, var(--card-bg) 94%, transparent)
      ),
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--accent-primary) 12%, transparent),
        transparent 44%
      );
    border: 1px solid color-mix(in srgb, var(--border-primary) 88%, transparent);
    border-radius: 20px;
    box-shadow: 0 24px 72px rgba(0, 0, 0, 0.26);
    backdrop-filter: blur(18px);
  }

  .mobile-outline-fade-enter-active,
  .mobile-outline-fade-leave-active {
    transition: opacity 180ms ease;
  }

  .mobile-outline-fade-enter-from,
  .mobile-outline-fade-leave-to {
    opacity: 0;
  }

  .mobile-outline-slide-enter-active {
    transition:
      opacity 180ms ease,
      transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .mobile-outline-slide-leave-active {
    pointer-events: none;
    transition:
      opacity 140ms ease,
      transform 180ms cubic-bezier(0.4, 0, 1, 1);
  }

  .mobile-outline-slide-enter-from,
  .mobile-outline-slide-leave-to {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }

  .mobile-outline-sheet-handle {
    justify-self: center;
    width: 42px;
    height: 4px;
    margin-top: 9px;
    background: color-mix(in srgb, var(--text-tertiary) 52%, transparent);
    border-radius: 999px;
  }

  .mobile-outline-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px 10px;
  }

  .mobile-outline-sheet-header div {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .mobile-outline-sheet-header span {
    color: var(--accent-primary);
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .mobile-outline-sheet-header strong {
    color: var(--text-primary);
    font-size: 1.02rem;
    line-height: 1.2;
  }

  .mobile-outline-sheet-header button {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
    color: var(--text-primary);
    background: color-mix(in srgb, var(--card-bg) 86%, transparent);
    border: 1px solid var(--border-secondary);
    border-radius: 12px;
    cursor: pointer;
  }

  .mobile-outline-sheet-header svg {
    width: 19px;
    height: 19px;
  }

  .mobile-outline-sheet > p {
    margin: 0 14px 10px;
    padding: 10px 12px;
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--bg-primary) 46%, transparent);
    border: 1px solid color-mix(in srgb, var(--border-primary) 70%, transparent);
    border-radius: 14px;
    font-size: 0.9rem;
    line-height: 1.7;
  }

  .mobile-outline-list {
    display: grid;
    gap: 7px;
    min-height: 0;
    overflow: auto;
    padding: 0 14px 14px;
  }

  .mobile-outline-item {
    min-height: 42px;
    padding: 9px 11px;
    color: var(--text-secondary);
    text-align: left;
    background: color-mix(in srgb, var(--card-bg) 78%, transparent);
    border: 1px solid var(--border-secondary);
    border-radius: 12px;
    font: inherit;
    font-size: 0.92rem;
    line-height: 1.35;
    cursor: pointer;
  }

  .mobile-outline-item.level-3 {
    padding-left: 22px;
  }

  .mobile-outline-item.level-4 {
    padding-left: 32px;
  }

  .mobile-outline-item.active {
    color: var(--accent-primary);
    background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
    border-color: color-mix(in srgb, var(--accent-primary) 48%, transparent);
  }

  .mobile-reading-dock {
    position: fixed;
    right: 10px;
    bottom: calc(10px + env(safe-area-inset-bottom));
    left: 10px;
    z-index: 90;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) 44px 44px;
    gap: 8px;
    align-items: center;
    padding: 7px;
    background: var(--navbar-bg);
    border: 1px solid var(--navbar-border);
    border-radius: 14px;
    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(14px);
    animation: detail-soft-rise 540ms cubic-bezier(0.22, 1, 0.36, 1) 360ms backwards;
  }

  .mobile-reading-dock button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 44px;
    min-height: 44px;
    padding: 0 9px;
    color: var(--text-primary);
    background: var(--card-bg);
    border: 1px solid var(--border-secondary);
    border-radius: 12px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  .mobile-reading-dock svg {
    width: 18px;
    height: 18px;
  }

  .mobile-progress {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .mobile-progress strong {
    color: var(--accent-primary);
    font-size: 0.86rem;
    line-height: 1;
  }

  .mobile-progress span {
    height: 6px;
    overflow: hidden;
    background: var(--border-secondary);
    border-radius: 999px;
  }

  .mobile-progress i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    border-radius: inherit;
  }
}

@media (max-width: 768px) {
  .detail-shell {
    width: min(100% - 28px, 1180px);
    padding-top: 12px;
    padding-bottom: 86px;
  }

  .detail-ruler {
    gap: 10px;
    margin-top: 16px;
    font-size: 0.65rem;
  }

  .detail-ruler span:nth-child(3) {
    display: none;
  }

  .article-cover,
  .reading-layout {
    grid-template-columns: 1fr;
  }

  .article-cover {
    gap: 0;
    min-height: auto;
    padding: 10px 0 14px;
    background: transparent;
    border: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--border-primary) 72%, transparent);
    border-radius: 0;
    box-shadow: none;
    backdrop-filter: none;
  }

  .cover-main {
    padding: 0;
  }

  .article-back-link {
    min-height: 40px;
    margin-bottom: 4px;
    padding: 0 4px;
    color: var(--text-secondary);
    background: transparent;
    border: 0;
    border-radius: 10px;
    font-size: 0.82rem;
  }

  .article-back-link svg {
    width: 18px;
    height: 18px;
  }

  .eyebrow,
  .summary-block span,
  .outline-header span,
  .reading-card > span,
  .insight-card span {
    font-size: 0.72rem;
  }

  .cover-main h1 {
    display: -webkit-box;
    overflow: hidden;
    margin: 7px 0 8px;
    font-size: clamp(1.76rem, 8vw, 2.28rem);
    line-height: 1.08;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .cover-main p {
    display: -webkit-box;
    overflow: hidden;
    color: color-mix(in srgb, var(--text-secondary) 92%, transparent);
    font-size: 0.92rem;
    line-height: 1.55;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .article-tags {
    gap: 7px;
    margin-top: 10px;
  }

  .article-tags span {
    min-height: 28px;
    padding: 0 10px;
    font-size: 0.76rem;
  }

  .mobile-cover-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
    color: var(--text-tertiary);
    font-size: 0.78rem;
    line-height: 1.3;
  }

  .mobile-cover-meta span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .mobile-cover-meta span:not(:last-child)::after {
    width: 3px;
    height: 3px;
    content: '';
    background: color-mix(in srgb, var(--accent-primary) 72%, transparent);
    border-radius: 50%;
  }

  .insight-card,
  .cover-panel,
  .outline-panel,
  .reading-card,
  .reader-surface {
    backdrop-filter: none;
    box-shadow: none;
  }

  .insight-strip {
    display: none;
  }

  .insight-card {
    flex: 0 0 auto;
    min-height: 30px;
    padding: 5px 8px;
    border-radius: 999px;
    gap: 7px;
  }

  .insight-card strong {
    font-size: 0.74rem;
    white-space: nowrap;
  }

  .cover-panel {
    display: none;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .story-detail-page :deep(.article-container) {
    padding: 16px 12px 60px;
  }

  .story-detail-page :deep(.markdown-content) {
    font-size: 0.96rem;
    line-height: 1.76;
  }

  .story-detail-page :deep(.markdown-content h1) {
    font-size: 1.72rem;
  }

  .story-detail-page :deep(.markdown-content h2) {
    gap: 10px;
    margin-top: 1.05em;
    font-size: 1.32rem;
  }

  .story-detail-page :deep(.markdown-content h3) {
    font-size: 1.08rem;
  }

  .story-detail-page :deep(.markdown-content h4) {
    font-size: 1rem;
  }

  .story-detail-page :deep(.markdown-content blockquote) {
    padding: 16px;
    border-radius: 12px;
  }

  .story-detail-page :deep(.markdown-content .code-block pre) {
    padding: 14px;
    font-size: 0.82rem;
  }

  .story-detail-page :deep(.floating-actions) {
    display: none;
  }
}

@media (max-width: 1180px) and (min-width: 769px) {
  .detail-shell {
    width: min(1040px, calc(100% - 44px));
    padding: 26px 0 88px;
  }

  .article-back-link {
    min-height: 36px;
    margin-bottom: 10px;
    font-size: 0.86rem;
  }

  .article-cover {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 18px;
    border-radius: 20px;
    box-shadow: 0 18px 54px rgba(0, 0, 0, 0.1);
  }

  .detail-ruler {
    margin-top: 22px;
  }

  .cover-main {
    padding: 0;
  }

  .cover-main h1 {
    max-width: 860px;
    margin: 8px 0 10px;
    font-size: clamp(2.15rem, 5vw, 3rem);
    line-height: 1.08;
  }

  .cover-main p {
    max-width: 780px;
    font-size: 0.98rem;
    line-height: 1.6;
  }

  .article-tags {
    margin-top: 12px;
  }

  .mobile-cover-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
    color: var(--text-tertiary);
    font-size: 0.82rem;
    line-height: 1.3;
  }

  .mobile-cover-meta span {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .mobile-cover-meta span:not(:last-child)::after {
    width: 4px;
    height: 4px;
    content: '';
    background: color-mix(in srgb, var(--accent-primary) 70%, transparent);
    border-radius: 50%;
  }

  .cover-panel {
    display: none;
  }

  .insight-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 14px;
  }

  .insight-card {
    min-height: 44px;
    padding: 8px 10px;
    border-radius: 12px;
  }

  .insight-card strong {
    font-size: 0.82rem;
  }

  .reading-layout {
    grid-template-columns: 190px minmax(0, 1fr);
    gap: 14px;
    margin-top: 12px;
  }

  .outline-panel {
    padding: 10px;
  }

  .outline-header {
    margin-bottom: 10px;
    padding-bottom: 10px;
  }

  .outline-header small {
    display: none;
  }

  .outline-item {
    min-height: 34px;
    padding: 7px;
    font-size: 0.78rem;
  }

  .reader-surface {
    border-radius: 18px;
  }

  .story-detail-page :deep(.article-container) {
    padding: 22px clamp(18px, 2.5vw, 28px) 68px;
  }

  .story-detail-page :deep(.markdown-content) {
    font-size: 0.99rem;
    line-height: 1.78;
  }

  .story-detail-page :deep(.markdown-content h1) {
    font-size: 2rem;
  }

  .story-detail-page :deep(.markdown-content h2) {
    font-size: 1.44rem;
  }

  .story-detail-page :deep(.markdown-content h3) {
    font-size: 1.14rem;
  }

  .floating-theme-toggle {
    right: 12px;
    width: 48px;
    height: 78px;
  }

  .back-to-top-float {
    right: 12px;
    bottom: calc(18px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 980px) and (min-width: 769px) {
  .detail-shell {
    width: min(860px, calc(100% - 40px));
    padding-top: 18px;
    padding-bottom: 96px;
  }

  .article-cover {
    padding: 12px 0 18px;
    background: transparent;
    border: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--border-primary) 72%, transparent);
    border-radius: 0;
    box-shadow: none;
    backdrop-filter: none;
  }

  .detail-ruler {
    gap: 12px;
    margin-top: 18px;
  }

  .cover-main h1 {
    font-size: clamp(2rem, 6.2vw, 2.8rem);
  }

  .cover-main p {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .insight-strip {
    display: none;
  }

  .reading-layout {
    grid-template-columns: 1fr;
    padding-left: 0;
  }

  .story-detail-page :deep(.article-container) {
    padding: 22px clamp(20px, 3vw, 32px) 72px;
  }

  .mobile-outline-sheet {
    right: max(18px, calc((100vw - 820px) / 2));
    bottom: calc(82px + env(safe-area-inset-bottom));
    left: max(18px, calc((100vw - 820px) / 2));
  }

  .mobile-reading-dock {
    right: max(18px, calc((100vw - 820px) / 2));
    left: max(18px, calc((100vw - 820px) / 2));
  }
}

@media (min-width: 1440px) {
  .detail-shell {
    width: min(1240px, calc(100% - 48px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .detail-backdrop,
  .article-back-link,
  .article-cover,
  .detail-ruler,
  .outline-panel,
  .reader-surface,
  .mobile-reading-dock,
  .floating-theme-toggle,
  .article-back-link,
  .back-to-top-float,
  .insight-card,
  .outline-item,
  .reading-card button,
  .mobile-outline-sheet-header button,
  .mobile-outline-item,
  .mobile-outline-fade-enter-active,
  .mobile-outline-fade-leave-active,
  .mobile-outline-slide-enter-active,
  .mobile-outline-slide-leave-active {
    transition: none;
    animation: none;
  }

  .mobile-outline-fade-enter-from,
  .mobile-outline-fade-leave-to,
  .mobile-outline-slide-enter-from,
  .mobile-outline-slide-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
