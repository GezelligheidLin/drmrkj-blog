/**
 * 设备类型枚举
 */
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  type: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  userAgent: string
  screenWidth: number
  screenHeight: number
}

/**
 * 判断是否为移动设备（基于 User Agent）
 */
export function isMobileUserAgent(): boolean {
  const ua = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile',
  ]
  return mobileKeywords.some((keyword) => ua.includes(keyword))
}

/**
 * 判断是否为平板设备（基于 User Agent）
 */
export function isTabletUserAgent(): boolean {
  const ua = navigator.userAgent.toLowerCase()
  const tabletKeywords = ['ipad', 'tablet', 'kindle', 'playbook', 'silk']

  // iPad 特殊处理（iPadOS 13+ 会伪装成桌面）
  const isIPad = ua.includes('ipad') || (ua.includes('macintosh') && navigator.maxTouchPoints > 1)

  return isIPad || tabletKeywords.some((keyword) => ua.includes(keyword))
}

/**
 * 基于屏幕宽度判断设备类型
 */
export function getDeviceTypeByWidth(width: number = window.innerWidth): DeviceType {
  if (width < 768) {
    return DeviceType.MOBILE
  } else if (width >= 768 && width < 1024) {
    return DeviceType.TABLET
  } else {
    return DeviceType.DESKTOP
  }
}

/**
 * 综合判断设备类型（User Agent + 屏幕宽度）
 */
export function getDeviceType(): DeviceType {
  // 优先使用 User Agent 判断
  if (isTabletUserAgent()) {
    return DeviceType.TABLET
  }

  if (isMobileUserAgent()) {
    return DeviceType.MOBILE
  }

  // 如果 User Agent 无法判断，使用屏幕宽度
  return getDeviceTypeByWidth()
}

/**
 * 获取完整的设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  const type = getDeviceType()

  return {
    type,
    isMobile: type === DeviceType.MOBILE,
    isTablet: type === DeviceType.TABLET,
    isDesktop: type === DeviceType.DESKTOP,
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  }
}

/**
 * 判断是否为移动端（包括手机和平板）
 */
export function isMobileDevice(): boolean {
  const type = getDeviceType()
  return type === DeviceType.MOBILE || type === DeviceType.TABLET
}

/**
 * 判断是否支持触摸
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 监听设备类型变化（响应式）
 */
export function watchDeviceType(callback: (type: DeviceType) => void): () => void {
  let currentType = getDeviceType()

  const handleResize = () => {
    const newType = getDeviceType()
    if (newType !== currentType) {
      currentType = newType
      callback(newType)
    }
  }

  window.addEventListener('resize', handleResize)

  // 返回取消监听的函数
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}
