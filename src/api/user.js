import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/api/getInfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/api/loginout',
    method: 'get'
  })
}

export function getMenu() {
  return request({
    url: '/api/menu',
    method: 'get'
  })
}