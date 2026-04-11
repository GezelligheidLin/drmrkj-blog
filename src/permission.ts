// import { getToken } from '@/utils/auth'

// import router from './router'

// router.beforeEach((to, from, next) => {
//   const isRequiredAuth = to.meta.requiresAuth !== false
//   if (getToken()) {
//     /* has token */
//     if (to.path === '/loading') {
//       // 已登录情况下直接落地工作台，避免重复看到登录页
//       next({ path: '/layout' })
//     } else if (!isRequiredAuth) {
//       next()
//     } else {
//       // 校验用户权限信息，此处暂时不做处理，后续可根据接口返回的用户权限信息进行路由过滤
//       next()
//     }
//   } else {
//     // 没有token
//     if (isRequiredAuth) {
//       // 在免登录白名单，直接进入
//       next()
//     } else {
//       next(`/loading?redirect=${to.fullPath}`) // 否则全部重定向到登录页
//     }
//   }
// })

// router.afterEach(() => {})

export {}
