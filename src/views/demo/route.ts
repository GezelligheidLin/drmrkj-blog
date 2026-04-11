const demoRoute: RouteDefinition = {
  path: '/demo',
  name: 'Demo',
  meta: {
    title: 'Demo',
    requiresAuth: true,
    layout: 'default',
    icon: 'demo',
    sort: 1,
  },
}

export default demoRoute
