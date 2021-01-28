<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddCateDialog"
          >添加分类</el-button
        >
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!--是否有效 希望通过作用域插槽的形式接收一下这一行的数据就用slot-scope -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序列的模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

<!-- 操作列的模板 -->
<template slot="opt" slot-scope="scope">
  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editCate(scope.row.cat_id)">编辑</el-button>
  <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteCateData(scope.row.cat_id)">删除</el-button>
</template>



      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3,5,10,15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="50%"  @close="addCateDialogClosed">
   <!-- 添加分类的表单 -->
   <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
  <el-form-item label="分类名称：" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类:">
   <el-cascader
    :options="parentCateList" 
    :props="cascaderProps" 
    @change="parentCateChanged" 
    v-model="selectedKeys" 
    clearable 
    ></el-cascader>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>



<el-dialog
@close="editCateDialogClosed"
  title="编辑分类"
  :visible.sync="editDialogVisible"
  width="30%"
  >
  <el-form :model="addCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
  <el-form-item label="分类名称" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCateInfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //表示将当前的列定义为模板列
          type: "template",
          //表示当前列使用的模板名称
          template: "isok",
        },
        {
          label: "排序",
          //表示将当前的列定义为模板列
          type: "template",
          //表示当前列使用的模板名称
          template: "order",
        },
        {
          label: "操作",
          //表示将当前的列定义为模板列
          type: "template",
          //表示当前列使用的模板名称
          template: "opt",
        },
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加的是一级分类
        cat_level: 0,
      },
      // 添加分类表单的验证规则的对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称",
            trigger: "blur",
          },
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly:"true" 
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 编辑分类的可见属性
      editDialogVisible:false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败")
      }
      // console.log(res.data)
      // 把数据列表赋值给catelist
      this.catelist = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    //监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据
      this.getParentCateList()
      // 展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败！")
      }
      // console.log(res.data);
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // console.log(this.selectedKeys)
      // 如果selectedKeys数组中的length大于0证明选中了父级分类
      // 反之没有选中任何父级分类
      if(this.selectedKeys.length > 0){
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else{
         // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate(){
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
       const {data:res} =await this.$http.post('categories',this.addCateForm)
       if(res.meta.status !== 201){
         this.$message.error('添加分类失败！')
       }
       this.$message.success('添加分类成功！')
       this.getCateList()
       this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed(){
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 监听商品分类的删除事件
    async deleteCateData(id){
      //询问用户是否删除数据(点击确定返回值为字符串confirm，取消为cancel字符串)
      const confirmResilt = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err)

      if (confirmResilt !== "confirm") {
        return this.$message.info("已撤销删除！")
      }
    const {data:res} =  await this.$http.delete(`categories/` + id)
    if(res.meta.status !== 200){
      console.log(res.meta.status);
      return this.$message.error('删除分类失败')
    }
    this.$message.success('删除成功')
    this.getCateList()
    },
    // 编辑商品分类的方法
    async editCate(id){
     const {data:res} = await this.$http.get(`categories/` + id)
     if(res.meta.status !== 200){
       return this.$message.error('获取分类名失败！')
     }
     this.addCateForm = res.data
      this.editDialogVisible = true
    },
    // 监听编辑角色对话框的关闭
    editCateDialogClosed(){
      this.$refs.editCateFormRef.resetFields()
    },
    //点击确定后监听编辑结果
    editCateInfo(){
      //预验证
      this.$refs.editCateFormRef.validate(async (valid) => {
        if(!valid) return
        const {data:res} = await this.$http.put(`categories/` + this.addCateForm.cat_pid , {
          cat_name : this.addCateForm.cat_name
        })
        console.log(res);
        if(res.meta.status !== 200){
          return this.$message.error('编辑失败！')
        }
        this.editDialogVisible = false
        this.getCateList()
        this.$message.success('编辑成功')
      })
    }
  },
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
