<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 添加分类按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addCate">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 列表显示区域 -->
            <tree-table class="treetable" :data="goodsCateList" :columns="columns" :selection-type="false" :show-row-hover="false" :expand-type="false" show-index index-text="#" border>
                <!-- 是否有效列模板 -->
                <template slot="links" slot-scope="scope">
                    <i class="el-icon-success" type="success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
                    <i class="el-icon-error" type="danger" v-else  style="color:red"></i>
                </template>
                <!-- 排序列模板 -->
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
                <!-- 操作列模板 -->
                <template slot="edit">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页部分 -->
             <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="goodsCateObj.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="goodsCateObj.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCateBox"
            width="30%"
            :before-close="handleClose">
            <!-- 主体区域 -->
            <el-form ref="addCateRef" :model="addCateInfo" label-width="80px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateInfo.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                     <el-cascader

                        v-model="selectKeysID"
                        :props="addCateProp"
                        :options="goodsCateListTwo"
                        @change="handleChange"
                        clearable change-on-select></el-cascader>

                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateBox = false">取 消</el-button>
                <el-button type="primary" @click="addCateList">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表,三级数据
      goodsCateList: [],
      // 商品分尅列表，两级数据
      goodsCateListTwo: [],
      // 请求分类列表数据是的参数
      goodsCateObj: {
        type: [1, 2, 3],
        pagenum: 1,
        pagesize: 5
      },
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
        // width: '400px'
      },
      {
        label: '是否有效',
        type: 'template',
        template: 'links'
      },
      {
        label: '排序',
        type: 'template',
        template: 'order'
      },
      {
        label: '操作',
        type: 'template',
        template: 'edit'
      }],
      // 分页部分数据
      total: 0,
      // 添加分类对话框
      addCateBox: false,
      addCateInfo: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateProp: {
        checkStrictly: true,
        expandTrigger: 'hover',
        leaf: 'children',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectKeysID: []

    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.goodsCateObj })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.goodsCateList = res.data.result
      this.total = res.data.total
      // console.log(this.goodsCateList);
    },
    // async parentCateList(){
    //   const {data:res} = await  this.$http.get('categories',{params:{
    //         type:2
    //     }})
    //     if(res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
    //     this.$message.success('获取父级分类列表成功')
    //     console.log(res);
    //     this.goodsCateListTwo = res.data
    //     console.log(this.goodsCateListTwo);
    // },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.goodsCateListTwo = res.data
    },
    handleSizeChange(newSize) {
      this.goodsCateObj.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage) {
      this.goodsCateObj.pagenum = newPage
      this.getCateList()
    },
    // 添加分类功能
    addCate() {
      this.getParentCateList()
      // console.log(this.goodsCateListTwo);
      this.addCateBox = true
    },
    handleClose() {
      this.getCateListTwo = []
      this.$refs.addCateRef.resetFields()
      this.selectKeysID = []
    },
    handleChange() {
      console.log(this.selectKeysID)
    },
    // 添加分类
    async addCateList() {
      // 判断是否选中了父分类
      if (this.selectKeysID.length > 0) {
        // 说明选中了父分类
        this.addCateInfo.cat_pid = this.selectKeysID[this.selectKeysID.length - 1]
        this.addCateInfo.cat_level = this.selectKeysID.length
      } else {
        // 说明没有选择父分类
        this.addCateInfo.cat_pid = 0
        this.addCateInfo.cat_level = 0
      }
      // 提交添加
      console.log(this.addCateInfo)
      const { data: res } = await this.$http.post('categories', this.addCateInfo)
      //    console.log(res);
      if (res.meta.status !== 201) return this.$message.error('创建分类失败')
      this.$message.success('创建分类成功')
      this.getCateList()
      this.addCateBox = false
    }
  }
}
</script>
<style lang="less" scoped>
.treetable {
    margin: 10px;
}

</style>
