import type { DialogApi, LoadingBarApi, MessageApi } from 'naive-ui'

declare global {
  interface Window {
    $message: MessageApi
    $dialog: DialogApi
    $loadingBar: LoadingBarApi
  }

  interface RouteDefinition {
    path: string
    name: string
    meta?: {
      // 路由标题（同时用于底部导航文案）
      title: string
      // 底部导航排序（数字越小越靠前）
      sort?: number
      // 底部导航中隐藏该路由
      isHidden?: boolean
      // 指定布局 key，未设置则使用默认布局
      layout?: string
      // 允许引入 views 下的组件目录（true 或指定目录/文件名列表）
      components?: boolean | string[]
      // 底部导航/页面的图标（Varlet/Vant 图标名或自定义）
      icon?: any
      // 是否需要登录权限
      requiresAuth?: boolean
      // 其他拓展参数
      [key: string]: unknown
    }
  }
}

export {}
