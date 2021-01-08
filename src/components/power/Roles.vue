<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  @close="removeRightById(scope.row, item1.id)"
                  closable
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套来渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      @close="removeRightById(scope.row, item2.id)"
                      closable
                      type="success"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      @close="removeRightById(scope.row, item3.id)"
                      closable
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <pre>
              <!-- {{scope.row}} -->
            </pre>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              @click="showEditDialoge(scope.row.id)"
              size="mini"
              type="primary"
              icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button
              @click="removeRole(scope.row.id)"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              @click="showSetRightDialog(scope.row)"
              size="mini"
              type="warning"
              icon="el-icon-setting"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改角色的对话框 -->
    <el-dialog
      @close="editDialogClosed()"
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form
        :model="roledata"
        :rules="editRoleRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roledata.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roledata.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色的弹出框 -->
    <el-dialog
      @close="addDialogClosed"
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
    >
      <el-form
        :model="addForm"
        :rules="editRoleRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      //当前即将分配权限的角色的id
      roleId:'',
      //默认选中的节点id值数组
      defKeys:[],
      //树形控件的属性绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },
      //所有权限的数据l
      rightslist: [],
      //控制分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      //所有角色列表数据
      rolelist: [],
      //所有角色数据对象
      roledata: {},
      //添加角色的数据对象
      addForm: {},
      editDialogVisible: false,
      addRolesDialogVisible: false,
      editRoleRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色的名称",
            trigger: "blur",
          },
          {
            min: 2,
            max: 10,
            message: "角色名长度在2到10个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          {
            required: true,
            message: "请输入角色的描述",
            trigger: "blur",
          },
          {
            min: 2,
            max: 20,
            message: "角色描述长度在2到20个字符之间",
            trigger: "blur",
          },
        ],
      },
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get(`roles`)
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败")
      }
      this.rolelist = res.data
    },

    //监听修改角色对话框关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    //监听添加角色对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    //点击编辑弹出编辑对话框
    async showEditDialoge(id) {
      const { data: res } = await this.$http.get(`roles/` + id)
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色信息失败！")
      }
      this.roledata = res.data
      this.addForm = res.data
      //   console.log(this.roledata);
      this.editDialogVisible = true
    },

    //删除角色
    async removeRole(id) {
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

      const { data: res } = await this.$http.delete(`roles/` + id)
      //   console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败")
      }
      this.$message.success("删除角色成功")
      this.getRolesList()
    },

    //修改角色信息并提交
    editRoleInfo() {
      //首先进行预验证
      this.$refs.editFormRef.validate(async (valid) => {
        //    console.log(valid);
        if (!valid) return
        //处理编辑后的角色
        const { data: res } = await this.$http.put(
          `roles/` + this.roledata.roleId,
          {
            roleName: this.roledata.roleName,
            roleDesc: this.roledata.roleDesc,
          }
        )
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("编辑角色信息失败")
        }
        //关闭对话框
        this.editDialogVisible = false
        //更新角色信息
        this.getRolesList()
        //提示
        this.$message.success("角色信息已经成功更新")
      })
    },

    //添加角色
    addRoles() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(`roles`, {
          roleName: this.addForm.roleName,
          roleDesc: this.addForm.roleDesc,
        })
        if (res.meta.status !== 200) {
          this.$message.error("添加角色信息失败！")
        }
        this.$message.success("成功添加角色信息")
        this.getRolesList()
        this.addRolesDialogVisible = false
      })
    },

    //根据id删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err)

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除")
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败")
      }
      // this.getRolesList()
      role.children = res.data
      this.$message.success("删除成功")
    },

    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId  = role.id
      //获取所有权限的数据
      const { data: res } = await this.$http.get(`rights/tree`)
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败")
      }
      //获取到的权限数据保存到data中
      this.rightslist = res.data
      // console.log(this.rightslist);

      //递归获取三级节点的id
      this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible = true
    },

    //通过递归的形式获取角色项所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node,arr){
      //如果当前node节点不包含children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      })
    },


    //监听分配权限对话框的关闭事件
    setRightDialogClosed(){
      this.defKeys = []
    },

    //点击为角色分配权限
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys);
      const idStr = keys.join(',')

     const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{
        rids : idStr
      })

      if(res.meta.status !== 200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('角色权限分配成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  },
}
</script>

<style scoped>
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
