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
            <el-row>
                <el-col :span="8">
                     <el-input placeholder="请输入内容" v-model="orderQuery.query" class="input-with-select" @clear="getOrdersList" >
                        <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
          <template slot-scope="scope">
            <template>
              {{scope.row.is_send}}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orderQuery.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="orderQuery.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
        </el-card>
        <!-- 修改地址对话框 -->
        <el-dialog
            title="修改地址"
            :visible.sync="addressVisible"
            width="50%"
            @close="resetform">
            <el-form :model="address" :rules="addressRules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
                <el-form-item label="请选择省市区县" prop="address1">
                    <el-cascader
                        v-model="address.address1"
                        :options="cityDate"
                        :props="{ expandTrigger: 'hover' }"
                        ></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="address.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
            </el-dialog>

            <!-- 物流信息对话框 -->
            <el-dialog
                title="物流信息"
                :visible.sync="processVisible"
                width="50%">
                 <el-timeline :reverse="true">
                    <el-timeline-item
                    v-for="(activity, index) in processList"
                    :key="index"
                    :timestamp="activity.time">
                    {{activity.context}}
                    </el-timeline-item>
                </el-timeline>
            </el-dialog>
    </div>
</template>
<script>
import cityDate from './citydata.js'
export default {
  data() {
    return {
      orderList: [],
      orderQuery: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      addressVisible: false,
      address: {
        address1: [],
        address2: ''
      },
      addressRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ]
      },
      cityDate,
      processVisible: false,
      processList: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 获取订单列表
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', { params: this.orderQuery })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(1)
      console.log(this.orderQuery)
    },
    showBox() {
      this.addressVisible = true
    },
    async showProgressBox() {
      // 获取物流信息
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      this.processList = res.data
      this.processVisible = true
    },
    handleSizeChange(newsize) {
      this.orderQuery.pagesize = newsize
      this.getOrdersList()
    },
    handleCurrentChange(newnum) {
      this.orderQuery.pagenum = newnum
      this.getOrdersList()
    },
    resetform() {
      this.$refs.ruleForm.resetFields()
    }

  }
}
</script>
