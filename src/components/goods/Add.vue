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
            <!-- 消息提示区域 -->
            <el-alert
                title="添加商品信息"
                type="info"
                :closable="false"
                show-icon
                center="">
            </el-alert>
            <!-- 添加主体区域 -->
            <!-- 步骤条 -->
            <el-steps :active="active-0" finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- tabs面板 -->
            <el-form ref="addGoodsRef" :rules="addGoodsRules" :model="addGoodsInfo" label-width="80px" label-position="top">
                <el-tabs tab-position="left"  v-model="active" :before-leave="beforeActive" @tab-click="tabClick">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addGoodsInfo.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model.number="addGoodsInfo.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model.number="addGoodsInfo.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model.number="addGoodsInfo.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                             <el-cascader
                                v-model="addGoodsInfo.goods_cat"
                                :options="cateList"
                                :props="selectProps"
                                @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyDate" :key="item.attr_id">
                             <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="item1" v-for="(item1,i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item1.attr_name" v-for="item1 in onlyDate" :key="item1.attr_id">
                            <el-input v-model="item1.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                            class="upload-demo"
                            action="https://www.liulongbin.top:8888/api/private/v1/upload"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :file-list="fileList"
                            list-type="picture"
                            :headers="uploadHeader"
                            :on-success="uploadSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                            </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addGoodsInfo.goods_introduce"/>
                        <el-button type="primary" class="btnGoods" @click="tijiao">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 预览图片的对话框 -->
        <el-dialog
            title="图片预览"
            :visible.sync="dialogVisible"
            width="50%">
            <img :src="previewPath" alt="" class="dia-img">
            </el-dialog>
    </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 商品列表
      cateList: [],

      active: '0',
      addGoodsInfo: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加表单验证规则
      addGoodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ]
      },
      // 级联选择器配置对象
      selectProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品的动态参数列表
      manyDate: [],
      // 商品的静态属性列表
      onlyDate: [],
      fileList: [],
      dialogVisible: false,
      previewPath: '',
      uploadHeader: {
        Authorization: window.sessionStorage.getItem('token')
      }

    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      // console.log(res);
      this.cateList = res.data
    },
    // 监听级选择器的更改事件
    handleChange() {
      // 设定只能选择三级选项
      if (this.addGoodsInfo.goods_cat.length !== 3) {
        this.addGoodsInfo.goods_cat = []
      }
      // console.log(this.addGoodsInfo.goods_cat);
      // console.log(typeof this.addGoodsInfo.goods_cat);
    },
    // tabs切换标签前的钩子函数
    beforeActive(activeName, oldActiveName) {
      // 阻止在未选中三级分类的时候发生页面切换
      if (oldActiveName === '0' && this.addGoodsInfo.goods_cat.length !== 3) {
        return false
      }
    },
    // tabs栏切换事件
    async tabClick() {
      if (this.active === '1') {
        // console.log(typeof this.cateID);
        // console.log(this.cateID);
        // 证明是在商品的动态参数页面，需要获取商品的动态参数
        const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取商品动态参数失败')
        // console.log(res);
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(',') : []
        })
        this.manyDate = res.data
        // console.log(this.manyDate);
      } else if (this.active === '2') {
        // 证明是在商品的静态属性页面，需要获取商品的静态属性
        const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: 'only' } })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('获取商品静态属性失败')
        this.onlyDate = res.data
      }
    },
    handlePreview(file) {
      // console.log(file);

      this.previewPath = file.response.data.url
      this.dialogVisible = true
    },
    handleRemove(file) {
      // console.log(file);
      // this.addGoodsInfo.pics
      const filePath = file.response.data.tmp_path
      // 根据内容查索引
      const i = this.addGoodsInfo.pics.findIndex(x => x.pic === filePath)
      this.addGoodsInfo.pics.splice(i, 1)
      // console.log(this.addGoodsInfo.pics);
    },
    uploadSuccess(file) {
      console.log(file)
      const picsObj = { 'pic': file.data.tmp_path }
      this.addGoodsInfo.pics.push(picsObj)
      // console.log(this.addGoodsInfo.pics);
    },
    tijiao() {
      // 提交前进行表单预校验
      this.$refs.addGoodsRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单信息')
        }

        // 深拷贝一个上传对象
        // const form = _.cloneDeep(this.addGoodsInfo)
        const form = _.cloneDeep(this.addGoodsInfo)
        // console.log(form.goods_cat);
        // 处理商品分类ID的字符串数据
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        // console.log(this.manyDate);
        this.manyDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join('')
          }
          this.addGoodsInfo.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addGoodsInfo.attrs.push(newInfo)
        })
        form.attrs = this.addGoodsInfo.attrs
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('创建商品失败')
        }
        this.$message.success('创建商品成功')
        // this.$router.replace(-1)
        // this.$router.push('/goods/add')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateID() {
      // 设定只能选择三级选项
      if (this.addGoodsInfo.goods_cat.length === 3) {
        return this.addGoodsInfo.goods_cat[2]
        // console.log(this.addGoodsInfo.goods_cat);
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-card {
    height: 100%!important;
}
.dia-img {
    width: 100%;
}
.btnGoods {
    margin-top: 15px;
}
</style>
