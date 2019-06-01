<template>
  <div class="app-container">
    <!--查询条件区域-->
    <div class="filter-container">
      <el-form :inline="true">
        <el-form-item label="姓名">
          <el-input v-model="listQuery.realName" placeholder="姓名" style="width: 200px;" class="filter-item" clearable />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="listQuery.username" placeholder="账号" style="width: 200px;" class="filter-item" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="listQuery.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="0" />
            <el-option label="禁用" value="1" />
          </el-select>
        </el-form-item>

        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          查询
        </el-button>
      </el-form>
    </div>
    <div style="margin-bottom: 10px;float: right">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>
    <!--数据表格区域-->
    <el-table
      :key="id"
      v-loading="listLoading"
      :data="list"
      border
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="编号" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电话号码" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
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
      <el-table-column label="创建时间" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近登录时间" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.lastLoginTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="240" fixed="right" class-name="small-padding fixed-width">
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
    <!--分页-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <!--添加和修改弹出框-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="70px" style="width: 500px; margin-left:80px;">
        <el-input v-model="temp.id" type="hidden" />
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="temp.realName" />
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input v-model="temp.username" :disabled="usernameDisabledMap[dialogStatus]" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          提交
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="角色"
      :visible.sync="dialogRoleVisible"
      width="30%"
      :before-close="handleClose"
    >
      <span>确认删除改信息?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDelVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteData()">确 定</el-button>
      </span>
    </el-dialog>
    <!--删除确认框-->
    <el-dialog
      title="确认"
      :visible.sync="dialogDelVisible"
      width="30%"
      :before-close="handleClose"
    >
      <span>确认删除改信息?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDelVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteData()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getListByPage, save, update, updateStatus, deleteData } from '@/api/user'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        1: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        realName: undefined,
        username: undefined,
        status: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        realName: '',
        username: ''
      },
      dialogFormVisible: false,
      dialogDelVisible: false,
      dialogRoleVisible: false,
      deleteId: undefined,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '创建'
      },
      usernameDisabledMap: {
        update: true,
        create: false
      },
      rules: {
        realName: [{ required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }],
        username: [{ required: true, message: '请输入账号', trigger: 'blur' },
          { min: 3, max: 50, message: '长度必须大于3个字符', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 查询数据列表
    getList() {
      this.listLoading = true
      getListByPage(this.listQuery).then(response => {
        this.list = response.result
        this.total = parseInt(response.total)
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    // 查询数据
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 删除操作
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    // 当表格的排序条件发生变化的时候会触发该事件
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        realName: '',
        username: '',
        password: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.author = 'vue-element-admin'
          save(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '新增成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          update(tempData).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '编辑成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.dialogDelVisible = true
      this.deleteId = row.id
    },
    deleteData() {
      deleteData(this.deleteId).then(() => {
        this.getList()
        this.dialogDelVisible = false
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleRole(row) {
      this.dialogRoleVisible = true
      this.deleteId = row.id
    },
    setRole() {
      deleteData(this.deleteId).then(() => {
        this.getList()
        this.dialogDelVisible = false
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
          const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
          const data = this.formatJson(filterVal, this.list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'table-list'
          })
          this.downloadLoading = false
        })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    statusChange(data) {
      updateStatus(data).then(() => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
