import type { Directive, DirectiveBinding } from 'vue'

type AutoHeightBinding = {
  bottom?: number
}

type AutoHeightEl = HTMLElement & {
  _vueAutoHeightHandler?: () => void
  _vueResizeObserver?: ResizeObserver | null
}

/**
 * 自定义指令：v-auto-height
 * * 功能：自动计算并设置元素高度，使其填满垂直剩余空间。
 * 公式：元素高度 = 视口高度 - 元素到视口顶部的距离 - 底部预留空间
 * * 参数说明 (binding.value):
 * - bottom: number (可选) 底部预留的像素距离，默认为 0。
 */
const autoHeight: Directive<AutoHeightEl, AutoHeightBinding> = {
  mounted(el: AutoHeightEl, binding: DirectiveBinding<AutoHeightBinding>) {
    const getBottomOffset = () => binding.value?.bottom ?? 0

    const updateHeight = () => {
      const rect = el.getBoundingClientRect()
      const topOffset = rect.top
      const bottomOffset = getBottomOffset()
      const targetHeight = window.innerHeight - topOffset - bottomOffset
      el.style.height = `${Math.max(0, targetHeight)}px`
    }

    requestAnimationFrame(updateHeight)

    const handleResize = () => {
      updateHeight()
    }
    window.addEventListener('resize', handleResize)

    let resizeObserver: ResizeObserver | null = null
    if (window.ResizeObserver && el.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        updateHeight()
      })
      resizeObserver.observe(el.parentElement)
    }

    el._vueAutoHeightHandler = handleResize
    el._vueResizeObserver = resizeObserver
  },

  unmounted(el: AutoHeightEl) {
    if (el._vueAutoHeightHandler) {
      window.removeEventListener('resize', el._vueAutoHeightHandler)
    }
    if (el._vueResizeObserver) {
      el._vueResizeObserver.disconnect()
    }
  },

  updated(el: AutoHeightEl, binding: DirectiveBinding<AutoHeightBinding>) {
    if (binding.value?.bottom !== binding.oldValue?.bottom) {
      const rect = el.getBoundingClientRect()
      const targetHeight = window.innerHeight - rect.top - (binding.value?.bottom ?? 0)
      el.style.height = `${Math.max(0, targetHeight)}px`
    }
  },
}

export default autoHeight
