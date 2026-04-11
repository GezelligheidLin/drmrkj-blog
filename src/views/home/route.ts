const homeRoute: RouteDefinition = {
  path: '/home',
  name: 'Home',
  meta: {
    title: '主页',
    requiresAuth: true,
    layout: 'default',
    icon: 'home',
    sort: 1,
  },
}

export default homeRoute
