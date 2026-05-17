<template>
  <main
    ref="storyPageRef"
    :class="['story-page', { 'is-entering': isEntering, 'theme-switching': isThemeSwitching }]"
    style="background-color: var(--bg-primary)"
  >
    <div class="story-backdrop"></div>
    <div
      v-if="themeFadeFrom"
      :class="['theme-fade-cover', `from-${themeFadeFrom}`]"
      aria-hidden="true"
    ></div>

    <nav ref="navbarRef" class="story-nav">
      <div class="nav-inner">
        <button class="brand-button" aria-label="返回首页" @click="goHome">
          <canvas ref="avatarCanvas" width="40" height="40" class="brand-avatar"></canvas>
          <span font="maoken" class="brand-name">DrmrKJ</span>
        </button>

        <div class="nav-menu" aria-label="页面导航">
          <button
            v-for="item in menuItems"
            :key="item.id"
            :class="['nav-link', { active: activeMenu === item.id }]"
            @click="handleMenuClick(item.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path :d="item.icon"></path>
            </svg>
            <span>{{ item.label }}</span>
          </button>
        </div>

        <div class="nav-actions">
          <button class="icon-button" aria-label="聚焦搜索" @click="focusSearch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
          <button class="icon-button" aria-label="切换主题" @click="toggleTheme">
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
        </div>
      </div>
    </nav>

    <section class="story-shell" aria-labelledby="story-page-title">
      <header ref="heroRef" class="hero-section">
        <div class="hero-copy">
          <div class="archive-mark" aria-hidden="true">
            <span>INDEX</span>
            <span>{{ currentYear }}</span>
          </div>
          <span class="eyebrow">Article Index</span>
          <h1 id="story-page-title" font="maoken">故事、笔记与工程切片</h1>
          <p>
            收拢近期写作，按时间、标签和关键词快速定位。这里更像一个可检索的工作台，而不是一堆漂浮的卡片。
          </p>
          <div v-if="activeFilters.length" class="active-filter-list" aria-label="当前筛选">
            <button v-for="filter in activeFilters" :key="filter.key" @click="filter.clear">
              <span>{{ filter.label }}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <aside class="hero-panel" aria-label="最新文章概览">
          <div class="panel-topline">
            <span class="panel-label">Latest Dispatch</span>
            <span class="issue-code">NO.{{ latestStory?.id || '00' }}</span>
          </div>

          <button v-if="latestStory" class="featured-link" @click="openStory(latestStory.id)">
            <strong>{{ latestStory.title }}</strong>
            <span
              >{{ formatRelativeDate(latestStory.date) }} / {{ latestStory.tags.join(' · ') }}</span
            >
          </button>

          <div class="metric-grid">
            <div>
              <span>{{ stories.length }}</span>
              <small>篇文章</small>
            </div>
            <div>
              <span>{{ allTags.length }}</span>
              <small>个标签</small>
            </div>
          </div>
        </aside>
      </header>

      <div class="archive-ruler" aria-hidden="true">
        <span>DRMRKJ</span>
        <span>ARCHIVE / NOTES / CODE</span>
        <span>{{ currentYear }}</span>
      </div>

      <div class="workspace-layout">
        <aside class="filter-panel" aria-label="文章筛选">
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <label class="sr-only" for="story-search">搜索标题、摘要或标签</label>
            <input
              id="story-search"
              ref="searchInputRef"
              v-model.trim="searchQuery"
              type="search"
              placeholder="搜索标题、摘要或标签"
            />
          </div>

          <section class="filter-block">
            <div class="filter-heading">
              <span>时间</span>
              <button v-if="selectedPeriod" @click="selectedPeriod = null">清除</button>
            </div>
            <button
              v-for="period in timePeriods"
              :key="period.key"
              :class="['filter-row', { active: selectedPeriod === period.key }]"
              @click="selectPeriod(period.key)"
            >
              <span>{{ period.label }}</span>
              <small>{{ period.count }}</small>
            </button>
          </section>

          <section class="filter-block">
            <div class="filter-heading">
              <span>标签</span>
              <button v-if="selectedTag" @click="selectedTag = null">清除</button>
            </div>
            <div class="tag-filter-list">
              <button
                v-for="tag in allTags"
                :key="tag"
                :class="['tag-chip', { active: selectedTag === tag }]"
                @click="selectTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </section>
        </aside>

        <section class="story-list-section">
          <div class="list-toolbar">
            <div>
              <span class="eyebrow">Stories</span>
              <h2>{{ listTitle }}</h2>
            </div>
            <button class="mobile-filter-trigger" @click="toggleMobileFilter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M7 12h10M10 18h4"></path>
              </svg>
              <span>筛选</span>
            </button>
          </div>

          <div v-if="groupedStories.length" class="story-groups">
            <section v-for="group in groupedStories" :key="group.period" class="story-group">
              <div class="group-heading">
                <span></span>
                <h3>{{ group.label }}</h3>
              </div>

              <article
                v-for="(story, index) in group.stories"
                :key="story.id"
                :class="['story-card', { featured: story.id === latestStory?.id }]"
                :style="{ animationDelay: `${index * 60}ms` }"
              >
                <span v-if="story.id === latestStory?.id" class="story-badge">NEW</span>
                <div class="story-date">
                  <strong>{{ formatDay(story.date) }}</strong>
                  <span>{{ formatMonth(story.date) }}</span>
                </div>

                <div class="story-content">
                  <button class="story-main-action" @click="openStory(story.id)">
                    <span class="story-meta">
                      <span>{{ formatRelativeDate(story.date) }}</span>
                      <span>{{ estimateReadTime(story.excerpt) }} 分钟阅读</span>
                    </span>
                    <span font="maoken" class="story-title">{{ story.title }}</span>
                    <span class="story-excerpt">{{ story.excerpt }}</span>
                  </button>
                  <div class="story-tags">
                    <button
                      v-for="tag in story.tags"
                      :key="tag"
                      class="story-tag"
                      @click.stop="selectTag(tag)"
                    >
                      {{ tag }}
                    </button>
                  </div>
                </div>

                <button
                  class="story-arrow"
                  :aria-label="`阅读《${story.title}》`"
                  @click="openStory(story.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M13 5l7 7-7 7"></path>
                  </svg>
                </button>
              </article>
            </section>
          </div>

          <div v-else class="empty-state">
            <strong>没有找到匹配的文章</strong>
            <p>换一个关键词，或者清除当前筛选条件。</p>
            <button @click="resetFilters">重置筛选</button>
          </div>
        </section>
      </div>
    </section>

    <div
      :class="['mobile-filter-sheet', { active: isMobileFilterOpen }]"
      @click="closeMobileFilter"
    >
      <div class="sheet-content" @click.stop>
        <div class="sheet-header">
          <strong>筛选文章</strong>
          <button aria-label="关闭筛选" @click="closeMobileFilter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="search-box mobile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <label class="sr-only" for="story-search-mobile">搜索文章</label>
          <input
            id="story-search-mobile"
            v-model.trim="searchQuery"
            type="search"
            placeholder="搜索文章"
          />
        </div>

        <div class="sheet-section">
          <span>时间</span>
          <button
            v-for="period in timePeriods"
            :key="period.key"
            :class="['filter-row', { active: selectedPeriod === period.key }]"
            @click="selectPeriodMobile(period.key)"
          >
            <span>{{ period.label }}</span>
            <small>{{ period.count }}</small>
          </button>
        </div>

        <div class="sheet-section">
          <span>标签</span>
          <div class="tag-filter-list">
            <button
              v-for="tag in allTags"
              :key="tag"
              :class="['tag-chip', { active: selectedTag === tag }]"
              @click="selectTagMobile(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <button class="sheet-reset" @click="resetFilters">重置筛选</button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import avatarImg from '@/assets/images/app/avatar.jpg'
import { useThemeStore } from '@/stores/modules/theme'

interface Story {
  id: number
  title: string
  excerpt: string
  tags: string[]
  date: string
}

interface MenuItem {
  id: string
  label: string
  icon: string
}

interface TimePeriod {
  key: string
  label: string
  count: number
}

interface StoryGroup {
  period: string
  label: string
  stories: Story[]
}

interface ViewTransition {
  finished: Promise<void>
  ready: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition: () => void
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition
}

type ThemeSnapshot = 'light' | 'dark'

const router = useRouter()
const themeStore = useThemeStore()

const avatarCanvas = ref<HTMLCanvasElement | null>(null)
const navbarRef = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const activeMenu = ref('stories')
const selectedPeriod = ref<string | null>(null)
const selectedTag = ref<string | null>(null)
const searchQuery = ref('')
const storyPageRef = ref<HTMLElement | null>(null)
const isMobileFilterOpen = ref(false)
const isEntering = ref(true)
const isThemeSwitching = ref(false)
const themeFadeFrom = ref<ThemeSnapshot | null>(null)
const currentYear = new Date().getFullYear()
let themeSwitchTimer: number | undefined
const THEME_SWITCH_DURATION = 520

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  },
  {
    id: 'stories',
    label: '文章',
    icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  },
  {
    id: 'projects',
    label: '项目',
    icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  },
  {
    id: 'about',
    label: '关于',
    icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
]

const stories = ref<Story[]>([
  {
    id: 1,
    title: '探索 Vue 3 Composition API 的魔法',
    excerpt:
      '深入了解 Vue 3 的 Composition API，如何让你的代码更加优雅和可维护。从基础概念到高级技巧，一起探索这个强大的特性。',
    tags: ['Vue', 'Frontend', 'JavaScript'],
    date: '2026-05-06',
  },
  {
    id: 2,
    title: '用 GSAP 打造丝滑动画体验',
    excerpt:
      '动画不仅仅是视觉效果，更是用户体验的灵魂。学习如何使用 GSAP 创建流畅、自然的动画效果，让你的网站充满生命力。',
    tags: ['Animation', 'GSAP', 'UX'],
    date: '2026-05-05',
  },
  {
    id: 3,
    title: 'TypeScript 类型体操实战',
    excerpt:
      '从简单的类型定义到复杂的类型推导，TypeScript 的类型系统强大而灵活。通过实际案例学习如何编写类型安全的代码。',
    tags: ['TypeScript', 'Programming'],
    date: '2026-04-28',
  },
  {
    id: 4,
    title: '响应式设计的艺术与科学',
    excerpt:
      '在多设备时代，响应式设计不再是可选项。探索如何创建在任何屏幕上都完美呈现的用户界面，从移动端到桌面端。',
    tags: ['CSS', 'Responsive', 'Design'],
    date: '2026-04-15',
  },
  {
    id: 5,
    title: '前端性能优化实践指南',
    excerpt:
      '性能优化是永恒的话题。从代码分割到懒加载，从缓存策略到资源压缩，全方位提升你的网站性能。',
    tags: ['Performance', 'Optimization'],
    date: '2026-03-20',
  },
  {
    id: 6,
    title: '设计系统：从零到一',
    excerpt:
      '构建一个完整的设计系统需要什么？从颜色、字体到组件库，学习如何创建一致、可扩展的设计语言。',
    tags: ['Design System', 'UI/UX'],
    date: '2025-12-15',
  },
])

const latestStory = computed(() => {
  return [...stories.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0]
})

const allTags = computed(() => {
  return Array.from(new Set(stories.value.flatMap((story) => story.tags))).sort((a, b) =>
    a.localeCompare(b),
  )
})

const searchedStories = computed(() => {
  const keyword = searchQuery.value.toLowerCase()
  if (!keyword) return stories.value

  return stories.value.filter((story) => {
    const searchable = [story.title, story.excerpt, ...story.tags].join(' ').toLowerCase()
    return searchable.includes(keyword)
  })
})

const filteredStories = computed(() => {
  return searchedStories.value.filter((story) => {
    const matchesPeriod = selectedPeriod.value
      ? getPeriodKey(story.date) === selectedPeriod.value
      : true
    const matchesTag = selectedTag.value ? story.tags.includes(selectedTag.value) : true
    return matchesPeriod && matchesTag
  })
})

const timePeriods = computed<TimePeriod[]>(() => {
  const counts: Record<string, number> = {}

  searchedStories.value.forEach((story) => {
    const key = getPeriodKey(story.date)
    counts[key] = (counts[key] || 0) + 1
  })

  return Object.entries(counts)
    .map(([key, count]) => ({
      key,
      label: getPeriodLabel(key),
      count,
    }))
    .sort((a, b) => getPeriodSortWeight(a.key) - getPeriodSortWeight(b.key))
})

const groupedStories = computed<StoryGroup[]>(() => {
  const groups: Record<string, Story[]> = {}

  filteredStories.value.forEach((story) => {
    const key = getPeriodKey(story.date)
    groups[key] ??= []
    groups[key].push(story)
  })

  return Object.entries(groups)
    .map(([key, groupStories]) => ({
      period: key,
      label: getPeriodLabel(key),
      stories: groupStories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }))
    .sort((a, b) => getPeriodSortWeight(a.period) - getPeriodSortWeight(b.period))
})

const listTitle = computed(() => {
  const count = filteredStories.value.length
  if (!selectedPeriod.value && !selectedTag.value && !searchQuery.value) {
    return `全部文章 · ${count}`
  }
  return `筛选结果 · ${count}`
})

const activeFilters = computed(() => {
  const filters: Array<{ key: string; label: string; clear: () => void }> = []

  if (searchQuery.value) {
    filters.push({
      key: 'search',
      label: `关键词：${searchQuery.value}`,
      clear: () => {
        searchQuery.value = ''
      },
    })
  }

  if (selectedPeriod.value) {
    filters.push({
      key: 'period',
      label: `时间：${getPeriodLabel(selectedPeriod.value)}`,
      clear: () => {
        selectedPeriod.value = null
      },
    })
  }

  if (selectedTag.value) {
    filters.push({
      key: 'tag',
      label: `标签：${selectedTag.value}`,
      clear: () => {
        selectedTag.value = null
      },
    })
  }

  return filters
})

const getPeriodKey = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return 'days'
  if (days < 30) return `week_${Math.floor(days / 7)}`
  if (days < 365) return `month_${Math.floor(days / 30)}`
  return `year_${Math.floor(days / 365)}`
}

const getPeriodLabel = (key: string): string => {
  if (key === 'today') return '今日'
  if (key === 'yesterday') return '昨日'
  if (key === 'days') return '近 7 天'
  if (key.startsWith('week_')) return `${key.split('_')[1]} 周前`
  if (key.startsWith('month_')) return `${key.split('_')[1]} 月前`
  if (key.startsWith('year_')) return `${key.split('_')[1]} 年前`
  return key
}

const getPeriodSortWeight = (key: string): number => {
  if (key === 'today') return 0
  if (key === 'yesterday') return 1
  if (key === 'days') return 2
  if (key.startsWith('week_')) return 100 + Number(key.split('_')[1])
  if (key.startsWith('month_')) return 1000 + Number(key.split('_')[1])
  if (key.startsWith('year_')) return 10000 + Number(key.split('_')[1])
  return 99999
}

const formatDay = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', { day: '2-digit' })
}

const formatMonth = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short' })
}

const formatRelativeDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (days <= 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const estimateReadTime = (text: string) => {
  return Math.max(1, Math.ceil(text.length / 180))
}

const selectPeriod = (key: string) => {
  selectedPeriod.value = selectedPeriod.value === key ? null : key
}

const selectPeriodMobile = (key: string) => {
  selectPeriod(key)
  closeMobileFilter()
}

const selectTag = (tag: string) => {
  selectedTag.value = selectedTag.value === tag ? null : tag
}

const selectTagMobile = (tag: string) => {
  selectTag(tag)
  closeMobileFilter()
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedPeriod.value = null
  selectedTag.value = null
  closeMobileFilter()
}

const toggleMobileFilter = () => {
  isMobileFilterOpen.value = !isMobileFilterOpen.value
}

const closeMobileFilter = () => {
  isMobileFilterOpen.value = false
}

const focusSearch = () => {
  searchInputRef.value?.focus()
}

const openStory = (storyId: number) => {
  void router.push(`/story/${storyId}`)
}

const goHome = () => {
  void router.push('/')
}

const handleMenuClick = (menuId: string) => {
  activeMenu.value = menuId

  if (menuId === 'home') {
    goHome()
  }
}

const prefersReducedThemeMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  window.matchMedia('(update: slow)').matches

const shouldUseNativeThemeTransition = () =>
  !window.matchMedia('(max-width: 767px), (hover: none) and (pointer: coarse)').matches

const getCurrentThemeSnapshot = (): ThemeSnapshot => (themeStore.isLight() ? 'light' : 'dark')

const finishThemeSwitch = (delay = THEME_SWITCH_DURATION) => {
  if (themeSwitchTimer) {
    window.clearTimeout(themeSwitchTimer)
  }

  themeSwitchTimer = window.setTimeout(() => {
    isThemeSwitching.value = false
    themeFadeFrom.value = null
    document.documentElement.classList.remove('story-theme-transition')
    document.documentElement.classList.remove('story-theme-cover-transition')
  }, delay)
}

const toggleTheme = () => {
  if (isThemeSwitching.value) return

  isThemeSwitching.value = true

  if (prefersReducedThemeMotion()) {
    themeStore.toggleTheme()
    isThemeSwitching.value = false
    themeFadeFrom.value = null
    document.documentElement.classList.remove('story-theme-cover-transition')
    return
  }

  const transitionDocument = document as ViewTransitionDocument

  if (transitionDocument.startViewTransition && shouldUseNativeThemeTransition()) {
    document.documentElement.classList.add('story-theme-transition')

    const transition = transitionDocument.startViewTransition(() => {
      themeStore.toggleTheme()
    })

    void transition.finished.finally(() => {
      isThemeSwitching.value = false
      themeFadeFrom.value = null
      document.documentElement.classList.remove('story-theme-transition')
    })
    return
  }

  themeFadeFrom.value = getCurrentThemeSnapshot()
  document.documentElement.classList.add('story-theme-cover-transition')

  window.requestAnimationFrame(() => {
    themeStore.toggleTheme()
    finishThemeSwitch()
  })
}

const drawAvatar = () => {
  if (!avatarCanvas.value) return

  const canvas = avatarCanvas.value
  const ctx = canvas.getContext('2d', { willReadFrequently: false })
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const size = 40

  canvas.width = size * dpr
  canvas.height = size * dpr
  canvas.style.width = `${size}px`
  canvas.style.height = `${size}px`
  ctx.scale(dpr, dpr)

  canvas.addEventListener('contextmenu', (event) => event.preventDefault())

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, size, size)
    ctx.restore()
  }
  img.src = avatarImg
}

const initEnterAnimations = () => {
  const reduceMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(update: slow)').matches ||
    window.innerWidth < 768

  if (reduceMotion) {
    isEntering.value = false
    gsap.set([navbarRef.value, heroRef.value], { clearProps: 'transform', opacity: 1 })
    gsap.set('.story-card', { clearProps: 'transform', opacity: 1 })
    return
  }

  const fromHomePage = sessionStorage.getItem('fromHomePage') === 'true'
  const timeline = gsap.timeline({
    defaults: { force3D: true },
    onComplete: () => {
      isEntering.value = false
      gsap.set([navbarRef.value, heroRef.value], { clearProps: 'transform', opacity: 1 })
      gsap.set('.story-card', { clearProps: 'transform', opacity: 1 })
    },
  })

  if (fromHomePage) {
    sessionStorage.removeItem('fromHomePage')
    timeline.set(navbarRef.value, { y: 0, opacity: 1 }, 0)
  } else {
    timeline.fromTo(
      navbarRef.value,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
      0,
    )
  }

  timeline.fromTo(
    heroRef.value,
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.56, ease: 'power3.out' },
    0.08,
  )

  timeline.fromTo(
    '.story-card',
    { y: 16, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.36, stagger: 0.035, ease: 'power2.out' },
    0.22,
  )
}

onMounted(() => {
  drawAvatar()
  initEnterAnimations()
})

onBeforeUnmount(() => {
  if (themeSwitchTimer) {
    window.clearTimeout(themeSwitchTimer)
  }

  themeFadeFrom.value = null
  document.documentElement.classList.remove('story-theme-transition')
  document.documentElement.classList.remove('story-theme-cover-transition')

  gsap.killTweensOf([navbarRef.value, heroRef.value, '.story-card'])
})
</script>

<style scoped>
.story-page {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--text-primary);
  background:
    linear-gradient(180deg, rgba(127, 127, 127, 0.035), transparent 280px), var(--bg-primary);
  isolation: isolate;
  transition:
    color 480ms ease,
    background-color 480ms ease,
    border-color 480ms ease,
    box-shadow 480ms ease;
}

:global(html.story-theme-transition::view-transition-old(root)),
:global(html.story-theme-transition::view-transition-new(root)) {
  animation-duration: 480ms;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  mix-blend-mode: normal;
}

:global(html.story-theme-transition::view-transition-old(root)) {
  animation-name: story-theme-fade-out;
}

:global(html.story-theme-transition::view-transition-new(root)) {
  animation-name: story-theme-fade-in;
}

@keyframes story-theme-fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes story-theme-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.theme-fade-cover {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  contain: paint;
  opacity: 0;
  transform: translateZ(0);
  backface-visibility: hidden;
  mix-blend-mode: normal;
  will-change: opacity;
  animation: story-mobile-theme-cover 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.theme-fade-cover.from-light {
  background:
    radial-gradient(
      circle at calc(100% - 44px) 50px,
      rgba(0, 113, 227, 0.22) 0 8%,
      rgba(135, 206, 250, 0.16) 18%,
      rgba(248, 249, 250, 0.08) 34%,
      transparent 66%
    ),
    radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.1), transparent 52%);
}

.theme-fade-cover.from-dark {
  background:
    radial-gradient(
      circle at calc(100% - 44px) 50px,
      rgba(135, 206, 250, 0.24) 0 8%,
      rgba(90, 200, 250, 0.16) 18%,
      rgba(10, 10, 11, 0.1) 34%,
      transparent 66%
    ),
    radial-gradient(circle at 50% 10%, rgba(135, 206, 250, 0.08), transparent 52%);
}

@keyframes story-mobile-theme-cover {
  0% {
    opacity: 0;
    transform: translateZ(0) scale(0.72);
  }

  34% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateZ(0) scale(1.08);
  }
}

:global(html.story-theme-cover-transition *),
:global(html.story-theme-cover-transition *::before),
:global(html.story-theme-cover-transition *::after) {
  transition: none !important;
}

.story-page.theme-switching .theme-fade-cover {
  animation-play-state: running !important;
}

.story-page,
.story-page::before,
.story-page::after,
.story-backdrop,
.story-backdrop::before,
.story-backdrop::after,
.nav-inner,
.brand-button,
.nav-menu,
.nav-link,
.icon-button,
.hero-copy h1,
.hero-copy p,
.archive-mark,
.active-filter-list button,
.hero-panel,
.panel-topline,
.featured-link,
.featured-link strong,
.featured-link span,
.metric-grid div,
.metric-grid span,
.metric-grid small,
.archive-ruler,
.archive-ruler::before,
.archive-ruler::after,
.filter-panel,
.search-box,
.search-box input,
.filter-heading button,
.filter-row,
.tag-chip,
.mobile-filter-trigger,
.list-toolbar h2,
.group-heading span,
.group-heading h3,
.story-card,
.story-card::before,
.story-date,
.story-date strong,
.story-date span,
.story-main-action,
.story-title,
.story-excerpt,
.story-tag,
.story-arrow,
.empty-state,
.empty-state strong,
.empty-state p,
.empty-state button,
.sheet-reset,
.mobile-filter-sheet,
.sheet-content,
.sheet-header,
.sheet-header button {
  transition-duration: 480ms;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  transition-property: color, background-color, border-color, box-shadow, opacity, filter;
}

.story-page.theme-switching .story-backdrop,
.story-page.theme-switching .story-backdrop::before,
.story-page.theme-switching .story-backdrop::after,
.story-page.theme-switching::before {
  animation-play-state: paused !important;
}

.story-page.is-entering .story-card {
  opacity: 0;
  transform: translate3d(0, 16px, 0);
}

.story-page .story-content {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

.story-page .icon-button {
  transition:
    color 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease,
    transform 180ms ease !important;
}

.story-page .icon-button:hover {
  color: var(--accent-primary) !important;
  background: var(--card-hover) !important;
  border-color: var(--accent-primary) !important;
  box-shadow: none !important;
  transform: translateY(-1px) !important;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip: rect(0, 0, 0, 0);
}

.story-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  contain: paint;
  overflow: hidden;
  pointer-events: none;
  background:
    linear-gradient(115deg, transparent 0 18%, rgba(135, 206, 250, 0.18) 25%, transparent 34%),
    linear-gradient(70deg, transparent 0 58%, rgba(255, 159, 10, 0.12) 66%, transparent 76%),
    linear-gradient(180deg, rgba(127, 127, 127, 0.05), transparent 40%),
    linear-gradient(var(--border-secondary) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-secondary) 1px, transparent 1px);
  background-size:
    130% 130%,
    140% 120%,
    100% 100%,
    64px 64px,
    64px 64px;
  background-position:
    0 0,
    100% 0,
    0 0,
    0 0,
    0 0;
  mask-image: linear-gradient(to bottom, black 0%, black 70%, transparent 100%);
  transform: translateZ(0);
}

.story-backdrop::before {
  position: absolute;
  inset: -28%;
  content: '';
  background:
    repeating-linear-gradient(
      118deg,
      transparent 0 70px,
      rgba(135, 206, 250, 0.14) 71px,
      transparent 74px,
      transparent 138px,
      rgba(48, 209, 88, 0.1) 139px,
      transparent 142px
    ),
    linear-gradient(
      100deg,
      transparent 0 34%,
      rgba(135, 206, 250, 0.2) 39%,
      rgba(255, 159, 10, 0.13) 43%,
      transparent 50%,
      transparent 72%,
      rgba(90, 200, 250, 0.18) 78%,
      transparent 84%
    );
  opacity: 0.5;
  transform: rotate(-8deg) translate3d(0, 0, 0);
  animation: ribbon-drift 24s ease-in-out infinite alternate;
  will-change: transform;
}

.story-backdrop::after {
  position: absolute;
  left: 50%;
  bottom: -28%;
  width: 150vw;
  height: 62vh;
  content: '';
  background:
    repeating-linear-gradient(90deg, rgba(135, 206, 250, 0.28) 0 1px, transparent 1px 74px),
    repeating-linear-gradient(0deg, rgba(135, 206, 250, 0.2) 0 1px, transparent 1px 44px),
    linear-gradient(180deg, rgba(135, 206, 250, 0.15), transparent 72%);
  mask-image: linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.75) 48%, transparent 100%);
  opacity: 0.46;
  transform: translateX(-50%) perspective(760px) rotateX(64deg);
  transform-origin: bottom;
  animation: grid-breathe 12s ease-in-out infinite alternate;
  will-change: transform;
}

.story-page::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  background:
    repeating-linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.055) 0,
      rgba(255, 255, 255, 0.055) 1px,
      transparent 1px,
      transparent 7px
    ),
    linear-gradient(90deg, transparent 0 48%, rgba(135, 206, 250, 0.08) 50%, transparent 52%);
  opacity: 0.22;
}

.story-page::after {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  opacity: 0.18;
  background-image:
    linear-gradient(90deg, transparent 0, rgba(127, 127, 127, 0.16) 1px, transparent 1px),
    linear-gradient(0deg, transparent 0, rgba(127, 127, 127, 0.1) 1px, transparent 1px);
  background-size:
    180px 100%,
    100% 220px;
}

@keyframes background-shift {
  0% {
    background-position:
      0 0,
      100% 0,
      0 0,
      0 0,
      0 0;
  }

  100% {
    background-position:
      8% 3%,
      88% 5%,
      0 0,
      22px 18px,
      -18px 12px;
  }
}

@keyframes ribbon-drift {
  0% {
    transform: rotate(-8deg) translate3d(-2%, -1%, 0);
    opacity: 0.52;
  }

  100% {
    transform: rotate(-8deg) translate3d(3%, 2%, 0);
    opacity: 0.76;
  }
}

@keyframes grid-breathe {
  0% {
    opacity: 0.34;
    transform: translateX(-50%) perspective(760px) rotateX(64deg) translateY(12px);
  }

  100% {
    opacity: 0.55;
    transform: translateX(-50%) perspective(760px) rotateX(64deg) translateY(-4px);
  }
}

@keyframes scanline-roll {
  0% {
    background-position:
      0 0,
      0 0;
  }

  100% {
    background-position:
      0 56px,
      0 0;
  }
}

.story-nav {
  position: fixed;
  top: 20px;
  left: 50%;
  z-index: 50;
  width: min(1180px, calc(100% - 32px));
  transform: translateX(-50%);
  opacity: 0;
}

.nav-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 10px;
  border: 1px solid var(--navbar-border);
  border-radius: 16px;
  background: var(--navbar-bg);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.brand-button,
.nav-link,
.icon-button,
.filter-row,
.tag-chip,
.story-tag,
.mobile-filter-trigger,
.sheet-reset,
.active-filter-list button,
.empty-state button,
.story-main-action,
.story-arrow {
  font: inherit;
}

.brand-button {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  width: fit-content;
  padding: 4px 10px 4px 4px;
  color: var(--text-primary);
  background: transparent;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
}

.brand-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--border-primary);
}

.brand-name {
  font-size: 1.05rem;
  font-weight: 700;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: var(--card-bg);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 82px;
  min-height: 44px;
  justify-content: center;
  padding: 8px 12px;
  color: var(--text-secondary);
  background: transparent;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition:
    color 180ms ease,
    background-color 180ms ease;
}

.nav-link svg,
.icon-button svg,
.mobile-filter-trigger svg {
  width: 18px;
  height: 18px;
}

.nav-link:hover,
.nav-link.active {
  color: var(--accent-primary);
  background: var(--card-hover);
}

.brand-button:focus-visible,
.nav-link:focus-visible,
.icon-button:focus-visible,
.filter-row:focus-visible,
.tag-chip:focus-visible,
.story-tag:focus-visible,
.mobile-filter-trigger:focus-visible,
.sheet-reset:focus-visible,
.empty-state button:focus-visible,
.active-filter-list button:focus-visible,
.featured-link:focus-visible,
.sheet-header button:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
}

.nav-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.icon-button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition:
    color 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.icon-button:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.story-shell {
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 128px 0 72px;
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 32px;
  align-items: end;
  min-height: 280px;
  opacity: 0;
}

.hero-copy {
  position: relative;
  min-width: 0;
}

.archive-mark {
  position: absolute;
  top: -34px;
  right: 0;
  z-index: -1;
  display: grid;
  justify-items: end;
  color: var(--border-primary);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 8rem;
  font-weight: 800;
  line-height: 0.82;
  pointer-events: none;
  user-select: none;
}

.archive-mark span:last-child {
  font-size: 0.34em;
  letter-spacing: 0;
}

.hero-copy h1 {
  max-width: 780px;
  margin: 10px 0 18px;
  color: var(--text-primary);
  font-size: 4.25rem;
  line-height: 1.12;
  letter-spacing: 0;
}

.hero-copy p {
  max-width: 680px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.9;
}

.active-filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}

.active-filter-list button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 10px 0 12px;
  color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent-primary) 26%, transparent);
  border-radius: 999px;
  cursor: pointer;
}

.active-filter-list svg {
  width: 15px;
  height: 15px;
}

.eyebrow,
.panel-label,
.filter-heading,
.story-meta,
.sheet-section > span {
  color: var(--text-tertiary);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hero-panel {
  display: grid;
  gap: 18px;
  align-self: stretch;
  padding: 22px;
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.1);
}

.panel-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-secondary);
}

.issue-code {
  color: var(--accent-primary);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
}

.featured-link {
  display: grid;
  gap: 10px;
  width: 100%;
  padding: 0 0 18px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--border-secondary);
  cursor: pointer;
}

.featured-link strong {
  display: block;
  color: var(--text-primary);
  font-size: 1.25rem;
  line-height: 1.5;
}

.featured-link span {
  color: var(--text-tertiary);
  font-size: 0.84rem;
  line-height: 1.5;
}

.featured-link:hover strong,
.featured-link:focus-visible strong {
  color: var(--accent-primary);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.metric-grid div {
  padding: 14px;
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  background: rgba(127, 127, 127, 0.05);
}

.metric-grid span {
  display: block;
  color: var(--accent-primary);
  font-size: 1.7rem;
  font-weight: 800;
}

.metric-grid small {
  color: var(--text-secondary);
}

.archive-ruler {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-top: 42px;
  color: var(--text-tertiary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0;
}

.archive-ruler::before,
.archive-ruler::after {
  flex: 1;
  height: 1px;
  content: '';
  background: var(--border-primary);
}

.workspace-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
  margin-top: 44px;
}

.filter-panel {
  position: sticky;
  top: 104px;
  display: grid;
  gap: 22px;
  padding: 18px;
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  background: var(--navbar-bg);
  backdrop-filter: blur(10px);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.08);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  background: var(--card-bg);
  color: var(--text-tertiary);
}

.search-box:focus-within {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 18%, transparent);
}

.search-box svg {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
}

.search-box input {
  width: 100%;
  min-width: 0;
  color: var(--text-primary);
  background: transparent;
  border: 0;
  outline: none;
}

.search-box input::placeholder {
  color: var(--text-tertiary);
}

.filter-block,
.sheet-section {
  display: grid;
  gap: 10px;
}

.filter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-heading button {
  color: var(--accent-primary);
  background: transparent;
  border: 0;
  cursor: pointer;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 11px 12px;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease;
}

.filter-row:hover,
.filter-row.active {
  color: var(--accent-primary);
  background: var(--card-hover);
  border-color: var(--border-primary);
}

.filter-row small {
  color: inherit;
  opacity: 0.72;
}

.tag-filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip,
.story-tag {
  min-height: 34px;
  padding: 7px 10px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 1px solid var(--border-secondary);
  border-radius: 10px;
  cursor: pointer;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease;
}

.tag-chip:hover,
.tag-chip.active,
.story-tag:hover {
  color: var(--accent-primary);
  background: var(--card-hover);
  border-color: var(--accent-primary);
}

.story-list-section {
  min-width: 0;
}

.list-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.list-toolbar h2 {
  margin: 6px 0 0;
  color: var(--text-primary);
  font-size: 2.2rem;
}

.mobile-filter-trigger {
  display: none;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  color: var(--text-primary);
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  cursor: pointer;
}

.story-groups {
  display: grid;
  gap: 34px;
}

.story-group {
  display: grid;
  gap: 14px;
}

.group-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-heading span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-primary);
  box-shadow: 0 0 18px var(--accent-primary);
}

.group-heading h3 {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.story-card {
  position: relative;
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr) 38px;
  gap: 18px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  background: var(--card-bg);
  backface-visibility: hidden;
  transform: translateZ(0);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.story-card::before {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: -1px;
  width: 3px;
  content: '';
  background: transparent;
  border-radius: 999px;
  transition: background-color 180ms ease;
}

.story-card:hover,
.story-card:focus-within {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
  background: var(--card-hover);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.14);
}

.story-card:hover::before,
.story-card:focus-within::before,
.story-card.featured::before {
  background: var(--accent-primary);
}

.story-card.featured {
  border-color: color-mix(in srgb, var(--accent-primary) 42%, var(--border-primary));
}

.story-badge {
  position: absolute;
  top: -10px;
  right: 18px;
  padding: 3px 8px;
  color: var(--bg-primary);
  background: var(--accent-primary);
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--accent-primary) 30%, transparent);
}

.story-date {
  display: grid;
  place-items: center;
  min-height: 74px;
  border: 1px solid var(--border-secondary);
  border-radius: 14px;
  background: rgba(127, 127, 127, 0.05);
}

.story-date strong {
  color: var(--text-primary);
  font-size: 1.7rem;
  line-height: 1;
}

.story-date span {
  color: var(--text-tertiary);
  font-size: 0.78rem;
}

.story-content {
  min-width: 0;
}

.story-main-action {
  display: block;
  width: 100%;
  padding: 0;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.story-main-action:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 5px;
  border-radius: 10px;
}

.story-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  text-transform: none;
}

.story-title {
  display: block;
  margin: 0 0 8px;
  color: var(--text-primary);
  font-size: 1.28rem;
  line-height: 1.45;
}

.story-excerpt {
  display: -webkit-box;
  margin: 0 0 14px;
  overflow: hidden;
  color: var(--text-secondary);
  line-height: 1.75;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.story-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.story-tag {
  min-height: 32px;
  padding: 5px 9px;
  font-size: 0.8rem;
}

.story-arrow {
  display: grid;
  place-items: center;
  width: 44px;
  min-width: 44px;
  height: 44px;
  color: var(--text-tertiary);
  background: transparent;
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition:
    color 180ms ease,
    transform 180ms ease,
    border-color 180ms ease;
}

.story-arrow svg {
  width: 18px;
  height: 18px;
}

.story-card:hover .story-arrow,
.story-card:focus-within .story-arrow {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  transform: translateX(2px);
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 300px;
  padding: 40px 20px;
  text-align: center;
  border: 1px dashed var(--border-primary);
  border-radius: 16px;
  background: var(--card-bg);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 1.15rem;
}

.empty-state p {
  margin: 8px 0 18px;
  color: var(--text-secondary);
}

.empty-state button,
.sheet-reset {
  min-height: 44px;
  padding: 0 16px;
  color: var(--bg-primary);
  background: var(--accent-primary);
  border: 0;
  border-radius: 12px;
  cursor: pointer;
}

.mobile-filter-sheet {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: none;
  background: rgba(0, 0, 0, 0.42);
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}

.mobile-filter-sheet.active {
  opacity: 1;
  pointer-events: auto;
}

.sheet-content {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  gap: 18px;
  max-height: 82vh;
  padding: 18px 18px calc(18px + env(safe-area-inset-bottom));
  overflow: auto;
  border-radius: 18px 18px 0 0;
  background: var(--bg-primary);
  transform: translateY(100%);
  transition: transform 220ms ease;
}

.mobile-filter-sheet.active .sheet-content {
  transform: translateY(0);
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-primary);
}

.sheet-header button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border: 1px solid var(--border-secondary);
  border-radius: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .story-backdrop,
  .story-backdrop::before,
  .story-backdrop::after,
  .story-page::before,
  .story-nav,
  .hero-section,
  .story-card,
  .sheet-content,
  .mobile-filter-sheet,
  .icon-button,
  .nav-link,
  .filter-row,
  .tag-chip,
  .story-tag {
    transition: none;
    animation: none;
  }
}

@media (max-width: 960px), (update: slow) {
  .story-backdrop::before,
  .story-backdrop::after,
  .story-page::before {
    animation: none;
  }

  .story-backdrop::before {
    opacity: 0.28;
    transform: rotate(-8deg) translate3d(0, 0, 0);
  }

  .story-backdrop::after {
    opacity: 0.24;
    transform: translateX(-50%) perspective(760px) rotateX(64deg);
  }

  .story-page::before {
    opacity: 0.1;
  }

  .nav-inner,
  .hero-panel,
  .filter-panel {
    backdrop-filter: none;
  }

  .story-card {
    box-shadow: none;
  }

  .story-card:hover,
  .story-card:focus-within {
    box-shadow: none;
  }
}

.sheet-header svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 960px) {
  .nav-inner {
    grid-template-columns: auto 1fr auto;
  }

  .nav-link {
    min-width: 44px;
    padding: 8px 10px;
  }

  .nav-link span {
    display: none;
  }

  .hero-section,
  .workspace-layout {
    grid-template-columns: 1fr;
  }

  .archive-mark {
    top: -26px;
    font-size: 5.8rem;
  }

  .hero-copy h1 {
    font-size: 3.35rem;
  }

  .hero-panel {
    max-width: 520px;
  }

  .filter-panel {
    display: none;
  }

  .mobile-filter-trigger,
  .mobile-filter-sheet {
    display: flex;
  }
}

@media (max-width: 640px) {
  .story-nav {
    top: 10px;
    width: calc(100% - 20px);
  }

  .nav-inner {
    gap: 8px;
    padding: 8px;
  }

  .brand-name {
    display: none;
  }

  .nav-menu {
    justify-self: center;
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .nav-menu::-webkit-scrollbar {
    display: none;
  }

  .icon-button {
    width: 44px;
    height: 44px;
  }

  .nav-actions {
    gap: 4px;
  }

  .nav-actions .icon-button:first-child {
    display: none;
  }

  .story-shell {
    width: min(100% - 28px, 1180px);
    padding-top: 100px;
  }

  .story-backdrop::before {
    opacity: 0.42;
  }

  .story-backdrop::after {
    height: 48vh;
    opacity: 0.28;
  }

  .story-page::before {
    opacity: 0.14;
  }

  .hero-section {
    min-height: auto;
    gap: 22px;
  }

  .hero-copy h1 {
    font-size: 2.42rem;
  }

  .hero-copy p {
    font-size: 0.96rem;
  }

  .archive-mark {
    top: -18px;
    right: -2px;
    font-size: 3.65rem;
  }

  .archive-ruler {
    gap: 10px;
    font-size: 0.65rem;
  }

  .archive-ruler span:nth-child(3) {
    display: none;
  }

  .hero-panel {
    padding: 16px;
  }

  .workspace-layout {
    margin-top: 36px;
  }

  .list-toolbar {
    align-items: center;
  }

  .list-toolbar h2 {
    font-size: 1.6rem;
  }

  .story-card {
    grid-template-columns: minmax(0, 1fr) 44px;
    gap: 12px;
    padding: 16px;
  }

  .story-date {
    display: none;
  }

  .story-title {
    font-size: 1.12rem;
  }

  .story-excerpt {
    font-size: 0.94rem;
  }

  .story-tags {
    gap: 6px;
  }
}
</style>
