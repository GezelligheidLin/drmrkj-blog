# Vue H5 项目模板

<div align="center">

基于 Vue 3 + TypeScript + Vite 的现代化 H5 移动端项目脚手架

[![Node Version](https://img.shields.io/badge/node-%5E20.19.0%20%7C%7C%20%3E%3D22.12.0-brightgreen)](https://nodejs.org/)
[![Vue Version](https://img.shields.io/badge/vue-3.5.18-brightgreen)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-latest-646cff)](https://vitejs.dev/)

</div>

## ✨ 特性

- 🚀 **现代化技术栈** - Vue 3 + TypeScript + Vite + Pinia
- 📱 **移动端优化** - 集成 Vant UI + Varlet UI 双组件库
- 🎨 **原子化 CSS** - UnoCSS 提供高性能的原子化 CSS 方案
- 🔥 **热更新** - 基于 Vite 的极速热模块替换 (HMR)
- 📦 **自动导入** - 自动导入 Vue 3 API 和组件
- 🛣️ **文件路由** - 基于文件系统的约定式路由
- 💾 **状态管理** - Pinia + 持久化插件
- 🔒 **代码规范** - ESLint + Prettier + Oxlint + Husky + Commitlint
- 🧪 **单元测试** - Vitest + Vue Test Utils
- 🌐 **E2E 测试** - Cypress 端到端测试
- 🌍 **浏览器兼容** - 支持 IE11+ (通过 Vite Legacy 插件)
- 📝 **Git 提交规范** - Commitizen + Conventional Commits

## 📦 技术栈

### 核心框架
- **Vue 3.5.18** - 渐进式 JavaScript 框架
- **TypeScript 5.8.0** - JavaScript 的超集，提供类型安全
- **Vite (Rolldown)** - 下一代前端构建工具

### UI 框架
Varlet UI链接： https://varletjs.org/varlet-theme-builder#/zh-CN/home
- **Varlet UI 3.12.1** - 面向 Vue 3 的 Material Design 风格移动端组件库
- **Vant UI 4.9.21** - 轻量、可靠的移动端 Vue 组件库
- **UnoCSS** - 即时按需的原子化 CSS 引擎

### 路由 & 状态管理
- **Vue Router 4.5.1** - Vue.js 官方路由
- **Pinia 3.0.3** - Vue 3 官方状态管理库
- **pinia-plugin-persistedstate** - Pinia 持久化插件

### 网络请求
- **Axios 1.11.0** - 基于 Promise 的 HTTP 客户端

### 开发工具
- **ESLint 9** - 代码质量和风格检查
- **Prettier 3.6** - 代码格式化工具
- **Oxlint** - 高性能的代码检查工具
- **Husky** - Git Hooks 工具
- **Commitlint** - Git 提交信息规范检查
- **Commitizen** - 交互式提交工具

### 测试工具
- **Vitest** - 基于 Vite 的单元测试框架
- **Cypress** - 端到端测试框架
- **Vue Test Utils** - Vue 组件测试工具

## 📋 前置要求

- **Node.js**: `^20.19.0` 或 `>=22.12.0`
- **包管理器**: pnpm (推荐) / npm / yarn

## 🚀 快速开始

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发环境

```bash
# 启动开发服务器 (默认端口: 8008)
pnpm dev
```

访问 `http://localhost:8008` 查看应用

### 生产构建

```bash
# 类型检查 + 生产构建
pnpm build

# 仅构建 (跳过类型检查)
pnpm build-only

# 预览生产构建
pnpm preview
```

## 📁 项目结构

```
vite-h5-template/
├── .husky/                 # Git Hooks 配置
├── .vscode/                # VS Code 配置
├── cypress/                # E2E 测试文件
│   ├── e2e/               # 测试用例
│   ├── fixtures/          # 测试数据
│   └── support/           # 测试辅助文件
├── public/                 # 静态资源 (不经过打包)
├── src/                    # 源代码目录
│   ├── api/               # API 请求
│   │   └── request.ts     # Axios 封装
│   ├── assets/            # 资源文件
│   │   └── styles/        # 全局样式
│   ├── components/        # 公共组件
│   │   └── layout/        # 布局组件
│   ├── content/           # 内容配置
│   ├── directive/         # 自定义指令
│   │   └── autoCalcHeight/ # 自动计算高度指令
│   ├── hooks/             # 组合式函数
│   ├── interface/         # TypeScript 类型定义
│   │   ├── api/           # API 相关类型
│   │   └── utils/         # 工具类型
│   ├── router/            # 路由配置
│   │   ├── base.ts        # 基础路由
│   │   ├── index.ts       # 路由入口
│   │   └── layout/        # 布局路由
│   ├── stores/            # 状态管理
│   │   ├── index.ts       # Pinia 配置
│   │   └── modules/       # 状态模块
│   │       ├── active.ts  # 活动状态
│   │       └── auth.ts    # 认证状态
│   ├── utils/             # 工具函数
│   │   ├── cache.ts       # 缓存工具
│   │   ├── envUtils.ts    # 环境变量工具
│   │   └── index.ts       # 工具集合
│   ├── views/             # 页面视图
│   │   ├── loading/       # 加载页
│   │   └── login/         # 登录页
│   ├── __tests__/         # 单元测试
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── types/                  # 全局类型定义
│   ├── auto-imports.d.ts  # 自动导入类型
│   ├── components.d.ts    # 组件类型
│   ├── global.d.ts        # 全局类型
│   └── shime.d.ts         # 模块声明
├── vite/                   # Vite 配置
│   └── plugins/           # Vite 插件
│       ├── auto-import.ts # 自动导入配置
│       └── index.ts       # 插件入口
├── .env                    # 环境变量
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── .gitignore             # Git 忽略配置
├── commitlint.config.cjs  # Commitlint 配置
├── cypress.config.ts      # Cypress 配置
├── eslint.config.ts       # ESLint 配置
├── index.html             # HTML 模板
├── package.json           # 项目依赖配置
├── tsconfig.json          # TypeScript 配置
├── uno.config.ts          # UnoCSS 配置
├── vite.config.ts         # Vite 配置
└── vitest.config.ts       # Vitest 配置
```

## 🛣️ 路由使用

### 约定式路由

项目采用基于文件系统的约定式路由，自动扫描 `src/views` 目录下的 `.vue` 文件生成路由，并读取同级 `route.ts` 作为配置源。

#### 基本用法

1. **创建页面文件**
   ```
   src/views/home/HomePage.vue
   ```

2. **创建路由配置** (可选)
   ```typescript
   // src/views/home/route.ts
   export default {
     path: '/home',
     name: 'Home',
     meta: {
       title: '首页',
       requiresAuth: true
     }
   }
   ```

3. **自动生成路由**
  - 存在 `route.ts`：优先使用其中的配置（`path`、`name`、`meta` 等）。
  - 不存在 `route.ts`：按文件名自动生成 `path`/`name`，`meta` 为空。

#### `route.ts` 常用 `meta` 字段

- `title`（必填）：路由标题（同时用于底部导航文案）。
- `requiresAuth`：是否需要登录。
- `layout`：布局 key，未设定时使用默认布局（default）。
- `icon`：底部导航/页面图标（Varlet 内置图标名或自定义）。
- `navOrder` / `sort`：底部导航排序，数字越小越靠前，`navOrder` 优先。
- `hideInNav`：在底部导航中隐藏该路由。
- `components`：允许引入 `views` 目录下对应页面的 `components` 子目录；可为 `true`（放开全部）或字符串数组（指定目录/文件名）。

#### 路由配置示例

```typescript
// src/views/login/route.ts
import type { RouteDefinition } from '@/interface'

export default {
  path: '/login',
  name: 'Login',
  meta: {
    title: '登录',
    requiresAuth: false
  }
} as RouteDefinition
```

#### 路由导航

```vue
<script setup lang="ts">
const router = useRouter()
const route = useRoute()

// 编程式导航
const goToHome = () => {
  router.push({ name: 'Home' })
  // 或
  router.push('/home')
}

// 获取当前路由信息
console.log(route.path)
console.log(route.params)
console.log(route.query)
</script>

<template>
  <!-- 声明式导航 -->
  <router-link to="/home">首页</router-link>
  <router-link :to="{ name: 'Home' }">首页</router-link>
</template>
```

#### 布局底部导航（Varlet Bottom Navigation）

- 布局组件会依据当前路由所在的父级布局路由，自动渲染底部导航。
- 子路由 `meta` 可配置：
  - `title`: 菜单文案
  - `icon`: 菜单图标（Varlet 内置图标名）
  - `navOrder` / `sort`: 排序权重（数字越小越靠前，`navOrder` 优先于 `sort`）
  - `hideInNav`: 设为 `true` 时在底部导航中隐藏
- 子路由路径规则：
  - 子路由 `path` 以 `/` 开头时按绝对路径跳转。
  - 否则会与父级布局路径拼接后跳转。
  - 当前路由会自动高亮对应的导航项。

### 路由守卫

```typescript
// src/router/index.ts
router.beforeEach((to, from, next) => {
  // 路由守卫逻辑
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

## 💾 状态管理

### Pinia Store 使用

#### 定义 Store

```typescript
// src/stores/modules/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')

  // Getters
  const isLoggedIn = computed(() => !!token.value)

  // Actions
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function logout() {
    userInfo.value = null
    token.value = ''
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    setUserInfo,
    logout
  }
}, {
  // 持久化配置
  persist: true
})
```

#### 使用 Store

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// 访问 state
console.log(userStore.userInfo)

// 访问 getters
console.log(userStore.isLoggedIn)

// 调用 actions
userStore.setUserInfo({ name: 'John' })
userStore.logout()

// 响应式解构
const { userInfo, isLoggedIn } = storeToRefs(userStore)
</script>
```

## 🎨 样式方案

### UnoCSS 原子化 CSS

项目使用 UnoCSS 提供原子化 CSS 能力，支持自定义规则。

#### 基本使用

```vue
<template>
  <!-- 尺寸 -->
  <div class="size-full">全尺寸</div>
  <div class="size-100">100px x 100px</div>
  <div class="size-100x200">100px x 200px</div>

  <!-- Flex 布局 -->
  <div class="flex-center">居中布局</div>
  <div class="flex-between">两端对齐</div>
  <div class="flex-col">垂直布局</div>

  <!-- 定位 -->
  <div class="position-center">绝对居中</div>
  <div class="position-top-left">左上角</div>

  <!-- 安全区域 -->
  <div class="pt-safe">顶部安全区域内边距</div>
  <div class="pb-safe">底部安全区域内边距</div>
</template>
```

#### 自定义规则

查看 `uno.config.ts` 了解更多自定义规则。

## 🧪 测试

### 单元测试 (Vitest)

```bash
# 运行单元测试
pnpm test:unit

# 监听模式
pnpm test:unit --watch
```

#### 测试示例

```typescript
// src/__tests__/App.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App', () => {
  it('renders properly', () => {
    const wrapper = mount(App)
    expect(wrapper.exists()).toBe(true)
  })
})
```

### E2E 测试 (Cypress)

```bash
# 开发模式 E2E 测试
pnpm test:e2e:dev

# 生产模式 E2E 测试
pnpm test:e2e
```

#### Cypress 测试示例

```typescript
// cypress/e2e/example.cy.ts
describe('My First Test', () => {
  it('visits the app root url', () => {
    cy.visit('/')
    cy.contains('h1', 'Welcome')
  })
})
```

## 🔧 开发规范

### 代码检查和格式化

```bash
# 运行所有代码检查
pnpm lint

# ESLint 检查
pnpm lint:eslint

# Oxlint 检查
pnpm lint:oxlint

# 代码格式化
pnpm format

# 自动修复
pnpm lint:fix
```

### Git 提交规范

项目使用 Commitizen 和 Commitlint 强制执行 Git 提交规范。

#### 提交方式

```bash
# 使用交互式提交工具
pnpm commit

# 或使用 npx
npx cz
```

#### 提交类型

- `feat`: 新增功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建相关
- `ci`: CI 配置
- `chore`: 其他修改
- `revert`: 回滚 commit

#### 提交示例

```
feat(auth): 添加用户登录功能

- 实现登录表单
- 集成 token 存储
- 添加路由守卫
```

### Husky Git Hooks

项目配置了以下 Git Hooks:

- **pre-commit**
  - 先执行 `.husky/env_check.sh`：确保 Node >= v23，自动尝试通过 fnm/nvm 切换；若无 fnm/nvm 且版本过低会中断提交。
  - 如未安装 pnpm，会尝试 npm 全局安装（失败不阻断但会提示）。
  - 通过环境检查后，运行 lint-staged 做增量格式化/检查。
- **commit-msg**
  - 同样先走 `.husky/env_check.sh`，确保 Node 版本符合要求。
  - 随后执行 commitlint 验证提交信息格式。

## 🌍 环境变量

### 环境配置文件

- `.env` - 所有环境通用
- `.env.development` - 开发环境
- `.env.production` - 生产环境

### 使用环境变量

```typescript
// 在代码中访问
const apiBaseUrl = import.meta.env.VITE_BASE_API

// TypeScript 类型支持
// env.d.ts
interface ImportMeta {
  readonly env: {
    VITE_BASE_API: string
    // 添加更多环境变量类型
  }
}
```

### 环境变量示例

```env
# .env.development
VITE_BASE_API=/itech-web-api

# .env.production
VITE_BASE_API=https://api.example.com
```

## 📝 自动导入

项目配置了自动导入，无需手动导入常用的 API 和组件。

### 自动导入 API

```vue
<script setup lang="ts">
// 无需导入，直接使用
const count = ref(0)
const router = useRouter()
const route = useRoute()
const store = useUserStore()
</script>
```

### 自动导入组件

```vue
<template>
  <!-- Varlet UI 组件自动导入 -->
  <var-button type="primary">按钮</var-button>
  <var-cell>单元格</var-cell>

  <!-- Vant UI 组件自动导入 -->
  <van-button type="primary">按钮</van-button>
  <van-cell title="单元格" />
</template>
```

## 🔌 API 请求

### Axios 封装

```typescript
// src/api/request.ts
import request from '@/api/request'

// GET 请求
export const getUserInfo = (id: string) => {
  return request.get(`/user/${id}`)
}

// POST 请求
export const login = (data: LoginParams) => {
  return request.post('/auth/login', data)
}
```

### 使用示例

```vue
<script setup lang="ts">
import { getUserInfo } from '@/api/user'

const fetchUser = async () => {
  try {
    const res = await getUserInfo('123')
    console.log(res.data)
  } catch (error) {
    console.error(error)
  }
}
</script>
```

## 📱 UI 组件库使用

项目集成了 **Vant UI** 和 **Varlet UI** 两个移动端组件库，可以根据需求灵活选择使用。

### Vant UI 使用

Vant 是一个轻量、可靠的移动端 Vue 组件库，提供了丰富的基础组件。

#### 组件示例

```vue
<template>
  <div class="page">
    <!-- 按钮 -->
    <van-button type="primary" @click="handleClick">
      主要按钮
    </van-button>
    <van-button type="success">成功按钮</van-button>

    <!-- 单元格 -->
    <van-cell title="单元格" value="内容" />
    <van-cell title="单元格" value="内容" is-link />

    <!-- 表单 -->
    <van-form @submit="onSubmit">
      <van-field
        v-model="form.username"
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        :rules="[{ required: true, message: '请输入用户名' }]"
      />
      <van-field
        v-model="form.password"
        type="password"
        name="password"
        label="密码"
        placeholder="请输入密码"
        :rules="[{ required: true, message: '请输入密码' }]"
      />
    </van-form>

    <!-- 弹出层 -->
    <van-popup v-model:show="showPopup" position="bottom">
      <div class="p-20">内容</div>
    </van-popup>

    <!-- 提示 -->
    <van-toast v-model:show="showToast" message="提示信息" />

    <!-- 对话框 -->
    <van-dialog
      v-model:show="showDialog"
      title="标题"
      message="弹窗内容"
      show-cancel-button
    />
  </div>
</template>

<script setup lang="ts">
import { showToast, showDialog } from 'vant'

const form = reactive({
  username: '',
  password: ''
})

const showPopup = ref(false)
const showToast = ref(false)
const showDialog = ref(false)

const handleClick = () => {
  showToast('点击按钮')
}

const onSubmit = (values: any) => {
  console.log('submit', values)
}

// 函数式调用
const showMessage = () => {
  showToast('这是一个提示')

  showDialog({
    title: '标题',
    message: '弹窗内容',
  }).then(() => {
    // 确认回调
  }).catch(() => {
    // 取消回调
  })
}
</script>
```

更多组件请参考: [Vant UI 官方文档](https://vant-ui.github.io/vant/#/zh-CN)

### Varlet UI 使用

### 组件示例

```vue
<template>
  <div class="page">
    <!-- 按钮 -->
    <var-button type="primary" @click="handleClick">
      主要按钮
    </var-button>

    <!-- 单元格 -->
    <var-cell title="单元格" value="内容" />

    <!-- 表单 -->
    <var-form ref="formRef">
      <var-input
        v-model="form.username"
        placeholder="请输入用户名"
        :rules="[v => !!v || '用户名不能为空']"
      />
    </var-form>

    <!-- 弹窗 -->
    <var-dialog v-model:show="showDialog" title="提示">
      这是一个弹窗
    </var-dialog>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  username: ''
})

const showDialog = ref(false)

const handleClick = () => {
  showDialog.value = true
}
</script>
```

更多组件请参考: [Varlet UI 官方文档](https://varlet.pages.dev/)

### 组件库选择建议

- **Vant UI**: 更轻量，组件风格简洁，适合快速开发，文档完善，社区活跃
- **Varlet UI**: Material Design 风格，组件动画效果更丰富，适合需要更强视觉效果的项目

两个组件库可以在同一项目中混用，根据具体场景选择最适合的组件。

## 🚀 部署

### 构建产物

```bash
pnpm build
```

构建产物位于 `dist/` 目录。

### 静态服务器部署

将 `dist/` 目录内容部署到任何静态服务器：

- Nginx
- Apache
- Vercel
- Netlify
- GitHub Pages

### Nginx 配置示例

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # API 代理
  location /itech-web-api {
    proxy_pass http://backend-api-server;
  }
}
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`pnpm commit`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

[MIT License](LICENSE)

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Vant UI](https://vant-ui.github.io/vant/)
- [Varlet UI](https://varlet.pages.dev/)
- [UnoCSS](https://unocss.dev/)
- [Pinia](https://pinia.vuejs.org/)

---

<div align="center">
Made with ❤️ by Your Team
</div>
