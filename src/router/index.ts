import { createRouter, createWebHistory } from 'vue-router'

// 基础路由
import { baseRoutes } from '@/router/base.ts'

const routes = [...baseRoutes]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    return { left: 0, top: 0 }
  },
})

export default router
