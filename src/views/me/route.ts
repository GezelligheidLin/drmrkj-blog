const meRoute: RouteDefinition = {
  path: '/me',
  name: 'Me',
  meta: {
    title: '我的',
    requiresAuth: true,
    layout: 'default',
    icon: 'account-circle-outline',
    sort: 2,
  },
}

export default meRoute
