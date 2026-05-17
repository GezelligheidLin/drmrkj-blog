import { networkInterfaces } from 'os'
// @ts-ignore
import qrcode from 'qrcode-terminal'
import type { Plugin } from 'vite'

function getLocalIP(): string {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    const netInfo = nets[name]
    if (!netInfo) continue

    for (const net of netInfo) {
      // 跳过内部地址和非 IPv4 地址
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return 'localhost'
}

export default function vitePluginQRCode(): Plugin {
  return {
    name: 'vite-plugin-qrcode',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          const address = server.httpServer?.address()
          if (address && typeof address === 'object') {
            const port = address.port
            const localIP = getLocalIP()
            const url = `http://${localIP}:${port}`

            console.log('\n')
            console.log('📱 扫描二维码在手机上访问:')
            console.log('\n')

            qrcode.generate(url, { small: true }, (qrcode: string) => {
              console.log(qrcode)
            })

            // console.log('\n')
            // console.log(`🌐 本地访问: http://localhost:${port}`)
            // console.log(`🌐 网络访问: ${url}`)
            // console.log('\n')
          }
        }, 100)
      })
    },
  }
}
