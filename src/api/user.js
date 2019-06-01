import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/system/user/getByToken',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getListByPage(data) {
  return request({
    url: '/system/user/getListByPage',
    method: 'post',
    data
  })
}
export function save(data) {
  return request({
    url: '/system/user/save',
    method: 'post',
    data
  })
}
export function update(data) {
  return request({
    url: '/system/user/update',
    method: 'post',
    data
  })
}
export function updateStatus(data) {
  return request({
    url: '/system/user/updateStatus',
    method: 'post',
    data
  })
}
export function deleteData(id) {
  return request({
    url: '/system/user/delete',
    method: 'get',
    params: { id }
  })
}
