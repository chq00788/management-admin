import request from '@/utils/request'

export function getListByPage(data) {
  return request({
    url: '/system/role/getListByPage',
    method: 'post',
    data
  })
}

export function getRoutes() {
  return request({
    url: '/routes',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/roles',
    method: 'get'
  })
}

export function save(data) {
  return request({
    url: '/system/role/save',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/system/role/update',
    method: 'put',
    data
  })
}

export function updateStatus(data) {
  return request({
    url: '/system/role/updateStatus',
    method: 'post',
    data
  })
}
export function deleteData(id) {
  return request({
    url: '/system/role/delete',
    method: 'get',
    params: { id }
  })
}
export function getPermTree() {
  return request({
    url: '/system/perm/getTreeList',
    method: 'get'
  })
}
export function getPerm(id) {
  return request({
    url: '/system/role/getPerm',
    method: 'get',
    params: { id }
  })
}

export function savePerm(data) {
  return request({
    url: '/system/role/savePerm',
    method: 'post',
    data
  })
}
