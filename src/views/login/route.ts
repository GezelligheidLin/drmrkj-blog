const loginRoute: RouteDefinition = {
  path: '/login-page',
  name: 'Login',
  meta: {
    title: '登录',
    requiresAuth: false,
    layout: 'none',
  },
}

export default loginRoute
