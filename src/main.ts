// uno.css样式引入
import 'virtual:uno.css'
// 自定义全局样式引入
import './assets/styles/index.scss'

import { createApp } from 'vue'

import { piniaRegister } from '@/stores'

import App from './App.vue'
import directive from './directive' // directive
// directive
import router from './router'

const app = createApp(App)

app.use(piniaRegister)
app.use(router)

directive(app)

app.mount('#app')
