<template>
  <div>
    <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
          <!-- 警告框 -->
            <el-alert
              title="注意：只允许为第三级分类设置相关参数！"
              type="warning"
              show-icon>
            </el-alert>
            <!-- 父级分类选择区域 -->
            <el-row>
              <el-col class="sel-cate">
                <span>选择商品分类：</span>
                <!-- 级联选择框 -->
                <el-cascader
                  v-model="selectKeys"
                  :options="cateInfo"
                  :props="cateSelectProp"
                  @change="cateSelectChange"></el-cascader>
              </el-col>
            </el-row>
            <!-- tabs面板 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
              <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" :disabled="isTabsDisable" @click="addDialogVisible = true">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table
                  :data="goodsParamsInfo"
                  style="width: 100%">
                  <!-- 展开行 -->
                  <el-table-column type="expand">
                    <template slot-scope="scope">
                      <el-tag
                        v-for="(item,i) in scope.row.attr_vals"
                        :key="i"
                        closable
                        @close="tagTandleClose(i,scope.row)"
                        >
                        {{item}}
                      </el-tag>
                      <!-- 输入的文本框 -->
                      <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                      </el-input>
                      <!-- 添加按钮 -->
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>
                  <!-- 索引行 -->
                  <el-table-column type="index" label="#">
                  </el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button type="primary" icon="el-icon-edit" size="mini" @click="editBtn(scope.row.attr_id)">修改</el-button>
                      <el-button type="danger" icon="el-icon-delete" size="mini" @click="delBtn(scope.row.attr_id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" :disabled="isTabsDisable"  @click="addDialogVisible = true">添加属性</el-button>
                <!-- 静态属性表格 -->
                <el-table
                  :data="goodsParamsInfo"
                  style="width: 100%">
                  <!-- 展开行 -->
                  <el-table-column type="expand">
                    <template slot-scope="scope">
                      <el-tag
                        v-for="(item,i) in scope.row.attr_vals"
                        :key="i"
                        closable
                        @close="tagTandleClose(i,scope.row)"
                        >
                        {{item}}
                      </el-tag>
                      <!-- 输入的文本框 -->
                      <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                      </el-input>
                      <!-- 添加按钮 -->
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>
                  <!-- 索引行 -->
                  <el-table-column type="index" label="#">
                  </el-table-column>
                  <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button type="primary" icon="el-icon-edit" size="mini" @click="editBtn(scope.row.attr_id)">修改</el-button>
                      <el-button type="danger" icon="el-icon-delete" size="mini" @click="delBtn(scope.row.attr_id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数、属性弹窗 -->
        <el-dialog
          :title="'添加' + titleText"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="handleClose">
          <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRul">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addBtn">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改对话框 -->
        <el-dialog
          :title="'添加' + titleText"
          :visible.sync="editDialogVisible"
          width="50%"
          @close="edithandleClose">
          <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRul">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editBtnJoin">确 定</el-button>
          </span>
        </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品列表信息
      cateInfo: [],
      // 级联选择器的选中项ID
      selectKeys: [],
      // 级联选择器配置项
      cateSelectProp: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // tabs标签页数据
      // 默认选中项
      activeName: 'many',
      // 商品参数数据
      goodsParamsInfo: [],
      // 添加弹窗的数据
      // 展示与隐藏
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      // 添加表达验证
      addFormRul: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改对话框数据
      editDialogVisible: false,
      editForm: {},
      editFormRul: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }

    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      // console.log(res);
      this.cateInfo = res.data
    },
    // 监听选中项发生变化
    cateSelectChange() {
      console.log(this.selectKeys)
      this.getGoodsParams()
      // 设置只能选中三级分类
    },
    // 监听tabs标签页的切换事件
    handleClick() {
      // console.log(this.activeName);
      this.getGoodsParams()
    },
    // 根据ID和对应的页面请求商品参数纤细
    async getGoodsParams() {
      // 发起请求前判断是否选中了三级分类
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: {
        sel: this.activeName
      } })
      console.log(res)
      // 处理参数的attr_vals属性
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      this.goodsParamsInfo = res.data
    },
    // 添加对话框的关闭事件
    handleClose() {
      this.$refs.addFormRef.resetFields()
      // this.addForm.attr_name = ''
    },
    // 点击确定按钮
    addBtn() {
      // 提交前先进行表单预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateID}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        // console.log(res);
        if (res.meta.status !== 201) return this.$message.error(`添加${this.titleText}失败`)
        this.$message.success(`添加${this.titleText}成功`)
        this.getGoodsParams()
        this.addDialogVisible = false
      })
    },
    // 参数与属性的修改与删除操作
    // 点击修改按钮
    async editBtn(id) {
      // 根据ID获取参数或者属性的值
      const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes/${id}`, { params: {
        attr_sel: this.activeName
      } })
      if (res.meta.status !== 200) return this.$message.error('获取参数信息失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 点击确定，提交修改
    async editBtnJoin() {
      const { data: res } = await this.$http.put(`categories/${this.cateID}/attributes/${this.editForm.attr_id}`,
        { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
      if (res.meta.status !== 200) return this.$message.error(`更新${this.titleText}失败`)
      this.$message.success(`更新${this.titleText}成功`)
      this.getGoodsParams()
      this.editDialogVisible = false
    },

    edithandleClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 监听删除按钮的点击事件
    async delBtn(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      // 删除参数
      const { data: res } = await this.$http.delete(`categories/${this.cateID}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.getGoodsParams()
      this.$message.success('删除参数成功')
    },
    // 展开行添加tab
    showInput(info) {
      info.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 添加tab的操作，输入框失去焦点或者敲击回车
    async handleInputConfirm(info) {
      if (info.inputValue.trim().length === 0) {
        info.inputValue = ''
        info.inputVisible = false
        return
      }
      // 如果输入框内容部位空，则要发起修改参数的请求，将attr_vals参数上传
      info.attr_vals.push(info.inputValue.trim())
      info.inputValue = ''
      info.inputVisible = false
      this.saveAttrData(info)
    },
    async saveAttrData(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateID}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败')
      this.$message.success('修改参数项成功')
    },
    tagTandleClose(id, info) {
      info.attr_vals.splice(id, 1)
      this.saveAttrData(info)
    }
  },
  computed: {
    // 根据是否选择了商品来决定是否显示添加按钮
    isTabsDisable() {
      if (this.selectKeys.length !== 3) {
        return true
      }
      return false
    },
    cateID() {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      }
      return null
    },
    // 根据tabs显示的面板动态展示添加窗口的title
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.sel-cate {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
