import type { App } from 'vue'

import autoHeight from '@/directive/autoCalcHeight/autoCalcHeight.ts'

export default function directive(app: App) {
  app.directive('autoHeight', autoHeight)
}
