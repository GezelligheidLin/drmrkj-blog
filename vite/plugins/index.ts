import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import type { PluginOption } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import vitePluginQRCode from '../../vite-plugin-qrcode'
import createAutoImport from './auto-import'

export default function createVitePlugins(_options: {
  env: Record<string, unknown>
  mode: string
  base: string
  isBuild?: boolean
}): PluginOption[] {
  // 核心插件：Vue、UnoCSS、自动导入、组件解析
  const vitePlugins: PluginOption[] = [
    vue(),
    legacy({
      targets: ['ie>=11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    UnoCSS(),
    vueDevTools({
      launchEditor: 'cursor',
    }),
  ]

  // 开发模式下添加二维码插件
  if (!_options.isBuild) {
    vitePlugins.push(vitePluginQRCode())
  }

  vitePlugins.push(createAutoImport())
  vitePlugins.push(
    Components({
      resolvers: [],
      dts: '/types/components.d.ts',
    }),
  )

  return vitePlugins
}
