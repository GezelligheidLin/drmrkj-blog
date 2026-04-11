type CacheType = 'local' | 'session'

class Cache {
  private instance: Storage

  constructor(type: CacheType) {
    if (type === 'local') {
      this.instance = window.localStorage
    } else {
      this.instance = window.sessionStorage
    }
  }

  set(key: string, value: unknown) {
    this.instance.setItem(key, JSON.stringify(value))
  }

  get(key: string) {
    const value = this.instance.getItem(key)
    return value ? JSON.parse(value) : null
  }

  remove(key: string) {
    this.instance.removeItem(key)
  }

  clear() {
    this.instance.clear()
  }
}

export const localCache = new Cache('local')
export const sessionCache = new Cache('session')
