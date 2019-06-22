import request from '@/utils/request'

export function getListByPage(data) {
  return request({
    url: '/system/perm/getList',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/system/perm/save',
    method: 'post',
    data
  })
}
