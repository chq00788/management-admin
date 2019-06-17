<template>
  <div class="app-container">
    <div style="margin-bottom: 10px;float: right">
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新增
      </el-button>
    </div>
    <el-table
      :key="id"
      v-loading="listLoading"
      :data="list"
      border
      fit
      stripe
      highlight-current-row
      style="width: 100%;margin-top:30px;"
    >
      <el-table-column label="编号" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.roleName }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="编码">
        <template slot-scope="scope">
          {{ scope.row.roleCode }}
        </template>
      </el-table-column>
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
      <el-table-column align="center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="240" fixed="right">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="handlePerm(scope.row)">权限</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!--添加和修改弹出框-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataTemp"
        label-position="right"
        label-width="70px"
        style="width: 500px; margin-left:80px;"
      >
        <el-input v-model="dataTemp.id" type="hidden" />
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="dataTemp.roleName" />
        </el-form-item>
        <el-form-item label="编码" prop="roleCode">
          <el-input v-model="dataTemp.roleCode" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dataTemp.description" />
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
    <!--权限设置-->
    <el-dialog
      title="权限设置"
      :visible.sync="dialogPermVisible"
      width="30%"
    >
      <div class="perm_dialog">
        <el-tree
          ref="tree"
          :data="perms"
          show-checkbox
          default-expand-all
          node-key="id"
          empty-text="暂无内容"
          highlight-current
          :check-strictly="false"
          :check-on-click-node="true"
          :expand-on-click-node="false"
          :props="defaultProps"
          :default-checked-keys="checkedPerms"
          @check-change="handleCheckedPermChange"
        />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogPermVisible = false">取 消</el-button>
        <el-button type="primary" @click="savePerm()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getListByPage, save, update, updateStatus, deleteData, getPermTree, getPerm, savePerm } from '@/api/role'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves' // waves directive

export default {
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      id: undefined,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      dialogFormVisible: false,
      dialogDelVisible: false,
      dialogPermVisible: false,
      dialogStatus: '',
      deleteId: undefined,
      roleId: undefined,
      listQuery: {
        page: 1,
        limit: 20,
        sort: '+id'
      },
      dataTemp: {
        id: undefined,
        roleName: '',
        roleCode: '',
        description: ''
      },
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }],
        roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' },
          { min: 3, max: 50, message: '长度必须大于3个字符', trigger: 'blur' }]
      },
      checkedPerms: [],
      perms: [],
      defaultProps: {
        children: 'children',
        label: 'permName'
      }
    }
  },
  created() {
    this.getList()
    this.getPermTree()
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
        }, 500)
      })
    },
    async getPermTree() {
      const res = await getPermTree()
      const data = res.result
      this.perms = data
    },
    resetTemp() {
      this.dataTemp = {
        id: undefined,
        roleName: '',
        roleCode: '',
        description: ''
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
          save(this.dataTemp).then(() => {
            this.list.unshift(this.dataTemp)
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
      this.dataTemp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataTemp)
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
    statusChange(data) {
      updateStatus(data).then(() => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
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
    handleCheckedPermChange(data) {
      console.log(data)
    },
    savePerm() {
      const data = {}
      data.id = this.roleId
      data.permIds = this.$refs.tree.getCheckedKeys()
      savePerm(data).then(() => {
        this.dialogPermVisible = false
        this.roleId = undefined
        this.$notify({
          title: 'Success',
          message: '设置成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handlePerm(data) {
      this.roleId = data.id
      getPerm(data.id).then(response => {
        this.dialogPermVisible = true
        this.$nextTick(function() {
          this.$refs.tree.setCheckedKeys(response.result)
        })
      })
    }
  }
}
</script>

<style scoped>
  .perm_dialog {
    height: 40vh;overflow: auto;
  }
</style>
