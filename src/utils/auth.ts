import Cookies from 'js-cookie'

const TokenKey = 'PZ-Token'

export function getToken() {
  return true
  // return Cookies.get(TokenKey)
}

export function setToken(token: string) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
