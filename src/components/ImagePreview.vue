<template>
  <Teleport to="body">
    <Transition name="preview" appear>
      <div v-if="src" class="image-preview-overlay" @click="handleClose">
        <div class="preview-container">
          <img
            :src="src"
            :alt="alt"
            class="preview-image"
            @load="handleImageLoad"
            @click="handleClose"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Props {
  src: string | null
  alt?: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const imageLoaded = ref(false)

const handleClose = () => {
  emit('close')
}

const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  // document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  cursor: zoom-out;
}

.preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  cursor: zoom-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transition: transform 200ms ease-out;
}

.close-btn {
  position: absolute;
  top: -3rem;
  right: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

/* 过渡动画 - 增强版 */
.preview-enter-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.6, 1);
}

.preview-enter-active .preview-image {
  transition:
    transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 300ms ease;
}

.preview-leave-active .preview-image {
  transition:
    transform 350ms cubic-bezier(0.4, 0, 0.6, 1),
    opacity 300ms ease;
}

.preview-enter-from {
  opacity: 0;
}

.preview-leave-to {
  opacity: 0;
}

.preview-enter-from .preview-image {
  transform: scale(0.8);
  opacity: 0;
}

.preview-leave-to .preview-image {
  transform: scale(0.85);
  opacity: 0;
}

@media (max-width: 768px) {
  .image-preview-overlay {
    padding: 1rem;
  }

  .close-btn {
    top: 1rem;
    right: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-enter-active,
  .preview-leave-active,
  .preview-enter-active .preview-image,
  .preview-leave-active .preview-image {
    transition: none !important;
  }
}
</style>
