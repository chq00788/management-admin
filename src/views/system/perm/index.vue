<template>
  <div class="app-container">
    <div style="margin-bottom: 10px;float: right">
      <el-button class="filter-item" type="primary" icon="el-icon-refresh" @click="getList">
        刷新
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        新增
      </el-button>
    </div>
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
        <template slot-scope="{row}" >
          <el-button v-if="row.permType !== 3" type="success" size="mini" @click="handleAdd(row)" >
            添加
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

    <!--添加和修改弹出框-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%" :before-close="closeDialog">
      <el-form ref="dataForm" :rules="rules" :model="tempData" label-position="left" label-width="70px" style="width: 500px; margin-left:80px;">
        <el-input v-model="tempData.id" type="hidden" />
        <el-form-item label="名称" prop="permName">
          <el-input v-model="tempData.permName" />
        </el-form-item>
        <el-form-item label="标识" prop="permCode">
          <el-input v-model="tempData.permCode" />
        </el-form-item>
        <el-form-item label="类型" prop="permType">
          <el-input v-model="tempData.permType" />
        </el-form-item>
        <el-form-item label="路径" prop="permUrl">
          <el-input v-model="tempData.permUrl" />
        </el-form-item>
        <el-form-item label="排序" prop="permSort">
          <el-input v-model="tempData.permSort" />
        </el-form-item>
        <el-input v-model="tempData.pid" type="hidden" />
        <el-form-item label="父级" prop="pName">
          <el-input v-model="tempData.pName" disabled="" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          提交
        </el-button>
      </div>
    </el-dialog>

    <!--删除确认框-->
    <el-dialog
      title="确认"
      :visible.sync="dialogDelVisible"
      width="30%"
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
import { getListByPage, save, update, deleteData } from '@/api/perm'
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
      dialogFormVisible: false,
      dialogDelVisible: false,
      deleteId: undefined,
      typeMap: {
        1: '目录',
        2: '菜单',
        3: '按钮'
      },
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      pid: undefined,
      tempData: {
        id: undefined,
        permName: '',
        permCode: '',
        permType: '',
        permUrl: '',
        permSort: '',
        pid: '',
        pName: ''
      },
      rules: {
        permName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
        permCode: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
        permType: [{ required: true, message: '请输入权限类型', trigger: 'blur' }],
        permUrl: [{ required: true, message: '请输入权限路径', trigger: 'blur' }],
        permSort: [{ required: true, message: '请输入展示排序', trigger: 'blur' }],
        pName: [{ required: true, message: '父级权限不能为空', trigger: 'blur' }]
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
    },
    handleAdd(row) {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.tempData.pid = row.id
      this.tempData.pName = row.permName
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.tempData.pid = 0
      this.tempData.pName = '系统'
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          save(this.tempData).then(() => {
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
      this.resetTemp()
      this.dialogStatus = 'update'
      this.tempData = Object.assign({}, row) // copy obj
      this.dialogFormVisible = true
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          update(this.tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '编辑成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    closeDialog() {
      this.dialogFormVisible = false
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
    },
    resetTemp() {
      this.tempData.id = undefined
      this.tempData.permName = ''
      this.tempData.permCode = ''
      this.tempData.permType = ''
      this.tempData.permUrl = ''
      this.tempData.permSort = ''
      this.tempData.pid = ''
      this.tempData.pName = ''
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
    }
  }
}
</script>

<style scoped>

</style>

