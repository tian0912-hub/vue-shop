<template>
  <div>
      <!-- 面包屑 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片区域 -->
      <el-card>
           <!-- 搜索与添加区域 -->
        <el-row :gutter="20">
            <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
            </el-col>
            <el-col :span="4">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
            </el-col>
        </el-row>
         <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
      </el-card>

      <!-- 添加/修改用户的对话框 -->
    <el-dialog :title="title" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-show="!addForm.id">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义邮箱验证规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    // 自定义手机号验证规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      userlist: [],
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  computed: {
    title () {
      return this.addForm.id ? '编辑用户' : '新增用户'
    }
  },
  methods: {
    //   获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.total = res.data.total
      this.userlist = res.data.users
    },
    // 监听修改按钮点击事件
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取用户信息失败')
      this.addForm = res.data
      this.addDialogVisible = true
      this.addFormRules.password = []
    },
    // 监听删除按钮点击事件
    async removeUserById (id) {
      const confirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') {
        this.$message.info('取消删除')
      } else {
        const { data: res } = await this.$http.delete(`users/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        this.getUserList()
      }
    },
    // 分配角色按钮点击事件
    setRole () {

    },
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    handleCurrentChange (newnum) {
      this.queryInfo.pagenum = newnum
      this.getUserList()
    },
    // 监听用户状态的更改
    async userStateChanged (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) return this.$message.error('修改用户状态失败')
      this.$message.success('修改用户状态成功')
    },
    // 添加用户对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
      this.addForm = {
        username: '',
        password: '',
        email: '',
        mobile: ''
      }
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入合法信息')
        // 通过有无ID判断是新增还是修改
        if (!this.addForm.id) {
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) return this.$message.error('创建用户失败')
        } else {
          const { data: res } = await this.$http.put(`users/${this.addForm.id}`, this.addForm)
          if (res.meta.status !== 200) return this.$message.error('编辑用户失败')
        }
        this.addDialogVisible = false
        this.$message.success(`${this.title}成功`)
        this.getUserList()
      })
    }

  }
}
</script>

<style scoped lang="less">

</style>
