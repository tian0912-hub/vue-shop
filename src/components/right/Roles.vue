<template>
  <div>
      <!-- 面包屑 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片区域 -->
      <el-card>
           <!-- 添加角色按钮区域 -->
        <el-row>
            <el-col>
            <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
            </el-col>
        </el-row>

        <!-- 角色列表区域 -->
        <el-table :data="rolelist" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
            <template slot-scope="scope">
                <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                    <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级和三级权限 -->
                <el-col :span="19">
                    <!-- 通过 for 循环 嵌套渲染二级权限 -->
                    <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                        <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                    </el-row>
                </el-col>
                </el-row>

                <!-- <pre>
                {{scope.row}}
                </pre> -->
            </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除</el-button>
                <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
            </el-table-column>
        </el-table>

        <!-- 添加/修改角色的对话框 -->
    <el-dialog :title="title" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
         <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="checkedNodes" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
      </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      rolelist: [],
      //   分配权限对话框显示隐藏
      setRightDialogVisible: false,
      //   权限列表
      rightslist: [],
      //   设置默认选中节点
      checkedNodes: [],
      //   树形配置项
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //   保存节点ID
      rolesId: '',
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '角色名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            min: 6,
            max: 15,
            message: '角色描述信息的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  computed: {
    title () {
      return this.addForm.roleId ? '编辑角色' : '新增角色'
    }
  },
  methods: {
    //   获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表数据失败')
      this.rolelist = res.data
    },
    // 监听分配权限事件
    async showSetRightDialog (rolesInfo) {
      this.rolesId = rolesInfo.id
      // 获取权限列表
      const { data: res } = await this.$http.get(`rights/tree`)
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightslist = res.data
      //   根据角色列表信息遍历该角色信息
      //   利用递归查找该角色所拥有的的权限列表
      this.getRolesHasRights(rolesInfo, this.checkedNodes)
      //   this.$refs.treeRef.setCheckedKeys(this.checkedNodes)
      this.setRightDialogVisible = true
    },
    // 定义递归函数，查找角色拥有权限列表
    getRolesHasRights (array, arr) {
    //   var arr = []
      if (!array.children) {
        return arr.push(array.id)
      } else {
        array.children.forEach(item => this.getRolesHasRights(item, arr))
      }
    },
    // 监听删除角色权限事件
    async removeRightById (rolesInfo, rightsid) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      const { data: res } = await this.$http.delete(`roles/${rolesInfo.id}/rights/${rightsid}`)
      if (res.meta.status !== 200) return this.$message.error('取消权限失败')
      this.$message.success('取消权限成功')
      //   更新用户数据
      this.getRolesList()
    //   rolesInfo.children = res.data
    },
    // 监听编辑角色事件
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
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
        const { data: res } = await this.$http.delete(`roles/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败')
        this.$message.success('删除角色成功')
        this.getRolesList()
      }
    },
    // 分配权限对话框关闭事件
    setRightDialogClosed () {
      this.checkedNodes = []
      this.$refs.treeRef.setCheckedKeys([])
    },
    // 分配权限提交事件
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(
        `roles/${this.rolesId}/rights`,
        { rids: idStr }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }

      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 添加编辑对话框关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
      this.addForm = {
        roleName: '',
        roleDesc: ''
      }
    },
    // 提交编辑、新增信息事件
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入合法信息')
        // 通过有无ID判断是新增还是修改
        if (!this.addForm.roleId) {
          const { data: res } = await this.$http.post('roles', this.addForm)
          if (res.meta.status !== 201) return this.$message.error('创建角色失败')
        } else {
          const { data: res } = await this.$http.put(`roles/${this.addForm.roleId}`, this.addForm)
          if (res.meta.status !== 200) return this.$message.error('编辑角色失败')
        }
        this.addDialogVisible = false
        this.$message.success(`${this.title}成功`)
        this.getRolesList()
      })
    }
  }
}
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
