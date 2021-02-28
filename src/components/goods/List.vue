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
            <!-- 搜索区域 -->
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="3" class="mg-l">
                    <el-button type="primary" @click="getAdd">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
             <el-table
                :data="goodsList"
                style="width: 100%">
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column
                    prop="goods_name"
                    label="商品名称"
                    >
                </el-table-column>
                <el-table-column
                    prop="goods_price"
                    label="商品价格"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="goods_weight"
                    label="商品重量"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="add_time"
                    label="创建时间"
                    width="180">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column
                    label="操作"
                    width="180">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="editGood(scope.row.goods_id)"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="delGood(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
             </el-table>
             <!-- 分页区域 -->
             <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[10, 15, 20, 25]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
        </el-card>

    </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听编辑按钮的点击事件
    editGood() {

    },
    // 监听删除按钮的点击事件
    async delGood(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败')
      this.getGoodsList()
      this.$message.success('删除商品成功')
    },
    // 监听分页组件的pagesize改变事件
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoodsList()
    },
    // 监听分页组件页码值的改变
    handleCurrentChange(newnum) {
      this.queryInfo.pagenum = newnum
      this.getGoodsList()
    },
    getAdd() {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
.mg-l{
    margin-left: 15px;
}
</style>
