import type { RouteRecordRaw } from 'vue-router'

export const layoutRoutes: RouteRecordRaw[] = [
  {
    path: '/layout',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    meta: {
      title: '布局组件',
      layout: 'default',
    },
    children: [],
  },
]
