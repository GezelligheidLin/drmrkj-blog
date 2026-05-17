<template>
  <nav class="table-of-contents">
    <h3 class="toc-title">目录</h3>
    <ul class="toc-list">
      <li
        v-for="heading in headings"
        :key="heading.id"
        :class="['toc-item', `toc-level-${heading.level}`, { active: heading.id === activeId }]"
      >
        <a :href="`#${heading.id}`" class="toc-link" @click.prevent="scrollToHeading(heading.id)">
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface Heading {
  id: string
  level: number
  text: string
}

interface Props {
  headings: Heading[]
  activeId?: string
}

defineProps<Props>()

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }
}
</script>

<style scoped>
.table-of-contents {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 200ms;
}

.toc-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin: 0 0 1rem 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 0.5rem 0;
  transition: all 200ms;
}

.toc-level-1 {
  padding-left: 0;
}

.toc-level-2 {
  padding-left: 1rem;
}

.toc-level-3 {
  padding-left: 2rem;
}

.toc-level-4 {
  padding-left: 3rem;
}

.toc-level-5,
.toc-level-6 {
  padding-left: 4rem;
}

.toc-link {
  display: block;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 200ms;
  cursor: pointer;
}

.toc-link:hover {
  color: var(--color-accent);
  background: var(--color-hover);
}

.toc-item.active .toc-link {
  color: var(--color-accent);
  font-weight: 500;
  background: var(--color-hover);
  border-left: 2px solid var(--color-accent);
  padding-left: calc(0.5rem - 2px);
}

@media (max-width: 1024px) {
  .table-of-contents {
    max-height: 300px;
    overflow-y: auto;
  }
}

/* 滚动条样式 */
.table-of-contents::-webkit-scrollbar {
  width: 6px;
}

.table-of-contents::-webkit-scrollbar-track {
  background: transparent;
}

.table-of-contents::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.table-of-contents::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
</style>
