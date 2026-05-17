const storyRoute: RouteDefinition = {
  path: '/story',
  name: 'Story',
  meta: {
    title: '故事',
    requiresAuth: true,
    layout: 'default',
    components: true,
  },
}

export default storyRoute
