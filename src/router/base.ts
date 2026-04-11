import type { RouteRecordRaw } from 'vue-router'

import { appConfig } from '~/appConfig'

import { layoutRoutes as rawLayoutRoutes } from './layout'

const defaultViewsRoute: string = appConfig.appFirstPageName
const defaultLayoutKey = appConfig.defaultLayoutKey

type LayoutRoute = RouteRecordRaw & { children: RouteRecordRaw[] }

type RouteModule = {
  path: string
  name: string
  meta?: {
    layout?: string
    components?: true | string[]
    [key: string]: unknown
  }
}

const isComponentPath = (path: string) => path.includes('/components/')

function allowComponentImport(path: string, meta?: RouteModule['meta']): boolean {
  if (!isComponentPath(path)) return true
  if (!meta?.components) return false
  if (meta.components === true) return true

  const afterComponents = path.split('/components/')[1]
  const parts = afterComponents.split('/')
  const dirName = parts[0]
  const fileName = parts[parts.length - 1].replace(/\.vue$/, '')

  return meta.components.includes(dirName) || meta.components.includes(fileName)
}

function initViewsRoutes(): RouteRecordRaw[] {
  const viewsRoutes: RouteRecordRaw[] = []

  // 自动导入 views 目录下的所有 .vue 文件
  const modules = import.meta.glob('@/views/**/*.vue')
  // 自动导入 views 目录下的所有 route.ts 文件
  const routeModules = import.meta.glob('@/views/**/route.ts', { eager: true })

  for (const path in modules) {
    const segments = path
      .replace(/^@\/views\//, '')
      .replace(/\.vue$/, '')
      // 去除page
      .replace(/Page$/, '')
      .split('/')

    const fileName = segments[segments.length - 1]

    // 权限判断用父级页面的 meta（components 放行）
    const parentRoutePath = isComponentPath(path)
      ? `${path.split('/components/')[0]}/route.ts`
      : path.replace(/\/[^/]+\.vue$/, '/route.ts')
    const parentRouteModule = routeModules[parentRoutePath] as { default: RouteModule } | undefined
    const parentMeta = parentRouteModule?.default?.meta

    if (!allowComponentImport(path, parentMeta)) continue

    // 组件自身若有 route.ts 则优先使用；否则回退到默认规则
    const selfRoutePath = path.replace(/\/[^/]+\.vue$/, '/route.ts')
    const routeModule = routeModules[selfRoutePath] as { default: RouteModule } | undefined
    const routeConfig = routeModule?.default

    if (routeConfig) {
      // 使用 route.ts 文件中的配置
      viewsRoutes.push({
        path: routeConfig.path,
        name: routeConfig.name,
        component: modules[path],
        meta: routeConfig.meta,
      })
    } else {
      // 使用原有逻辑生成路由
      const routeName = fileName
      const routePath = '/' + fileName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

      viewsRoutes.push({
        path: routePath,
        name: routeName,
        component: modules[path],
      })
    }
  }

  return viewsRoutes
}

function distributeToLayouts(viewRoutes: RouteRecordRaw[]): RouteRecordRaw[] {
  if (!rawLayoutRoutes.length) {
    return viewRoutes
  }

  const layoutCopies: LayoutRoute[] = rawLayoutRoutes.map((route) => ({
    ...route,
    children: route.children ? [...route.children] : [],
  }))

  const findLayout = (key: string) =>
    layoutCopies.find((layout) => (layout.meta as { layout?: string } | undefined)?.layout === key)

  for (const route of viewRoutes) {
    const layoutKey = (route.meta as { layout?: string } | undefined)?.layout

    // layout: 'none' 明确表示不挂载到任何布局，保持顶层
    if (layoutKey === 'none') {
      layoutCopies.push({
        ...(route as RouteRecordRaw),
        children: (route.children ?? []) as RouteRecordRaw[],
      })
      continue
    }

    const targetLayout = findLayout(layoutKey || defaultLayoutKey) || findLayout(defaultLayoutKey)

    if (targetLayout) {
      targetLayout.children.push(route)
      continue
    }

    // 如果未找到任何布局，保持顶层路由
    layoutCopies.push({
      ...(route as RouteRecordRaw),
      children: (route.children ?? []) as RouteRecordRaw[],
    })
  }

  return layoutCopies
}

const viewRoutes = initViewsRoutes()
const mergedRoutes = distributeToLayouts(viewRoutes)
// console.log('Merged Routes:', mergedRoutes)

export const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: defaultViewsRoute },
  },
  ...mergedRoutes,
]
