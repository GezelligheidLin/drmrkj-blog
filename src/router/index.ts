import { createRouter, createWebHashHistory } from 'vue-router'

// 基础路由
import { baseRoutes } from '@/router/base.ts'

const routes = [...baseRoutes]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
})

export default router
