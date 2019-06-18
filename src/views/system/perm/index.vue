<template>
  <div class="app-container">
    <el-table
      :data="list"
      style="width: 100%;margin-bottom: 20px;"
      row-key="id"
      border
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column
        prop="permName"
        label="名称"
      />
      <el-table-column
        prop="permCode"
        label="标识"
      />
      <el-table-column label="类型" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.permType | typeFilter">
            {{ typeMap[row.permType] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="permUrl"
        label="路径"
      />
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch
            v-model="row.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="0"
            inactive-value="1"
            @change="statusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
      />
      <el-table-column label="操作" align="center" width="240" fixed="right" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="success" size="mini" @click="handleRole(row)">
            角色
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getListByPage } from '@/api/perm'
import waves from '@/directive/waves' // waves directive
export default {
  directives: { waves },
  filters: {
    typeFilter(permType) {
      const statusMap = {
        1: '',
        2: 'success',
        3: 'warning'
      }
      return statusMap[permType]
    }
  },
  data() {
    return {
      list: null,
      listLoading: false,
      typeMap: {
        1: '目录',
        2: '菜单',
        3: '按钮'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 查询数据列表
    getList() {
      this.listLoading = true
      getListByPage().then(response => {
        this.list = response.result
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      })
    }
  }
}
</script>

<style scoped>

</style>

