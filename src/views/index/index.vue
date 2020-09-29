<template>
  <div class="app-container">
    <header class="app-header">
      <span class="title">网校权限管理</span>
      <el-button type="primary" icon="el-icon-edit" @click.native="handleAddFirstCategory()">添加一级分类</el-button>
    </header>
    <div class="course-class">
      <div class="class-main">
        <div class="classify" style="padding-left:10px; padding-top:2px;">
          <el-tree v-loading="loading" :data="data" node-key="id" default-expand-all :expand-on-click-node="false" :props="defaultProps">
            <span slot-scope="{ node, data }" style="flex: 1; display: flex; align-items: center; justify-content: space-between; padding-right: 8px;">
              <span>{{ node.label }}</span>
              <span class="operation-col">
                <input v-model="data.list_order" class="order-list" @blur="() => setOrder(data)">
                <el-button type="text" @click.native.prevent="() => append(data)">添加子分类</el-button>
                <el-button type="text" @click="() => edit(data)">编辑</el-button>
                <el-button type="text" @click="() => remove(data)">删除</el-button>
              </span>
            </span>
          </el-tree>
        </div>
      </div>

      <el-dialog title="添加一级分类" :visible.sync="formVisible" :before-close="hideForm" :close-on-click-modal="false" width="50%" top="5vh">
        <el-form :key="1" ref="dataForm" :model="formData" :rules="formRules" label-width="80px" style="padding-right:25px;">
          <el-form-item label="是否显示" prop="type">
            <el-radio-group v-model="formData.status">
              <el-radio label="1">显示</el-radio>
              <el-radio label="0">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio label="1">列表显示</el-radio>
              <el-radio label="2">列表隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="formData.name" placeholder="分类名称" auto-complete="off" />
          </el-form-item>
          <el-form-item label="所属路径" prop="path">
            <el-input v-model="formData.path" placeholder="所属路径" auto-complete="off" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click.native="hideForm">取消</el-button>
          <el-button type="primary" :loading="formLoading" @click.native="formSubmit()">提交</el-button>
        </div>
      </el-dialog>

      <el-dialog title="添加子分类" :visible.sync="subCategoryFormVisible" :before-close="hideSubCategoryForm" :close-on-click-modal="false" width="50%" top="5vh">
        <el-form :key="2" ref="dataForm" :model="subCategoryFormData" :rules="formRules" label-width="80px" style="padding-right:25px;">
          <el-form-item label="是否显示" prop="status">
            <el-radio-group v-model="subCategoryFormData.status">
              <el-radio label="1">显示</el-radio>
              <el-radio label="0">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="subCategoryFormData.type">
              <el-radio label="1">列表显示</el-radio>
              <el-radio label="2">列表隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="所属分类" prop="parent_name">
            <el-input v-model="subCategoryFormData.parent_name" disabled placeholder="父分类名称" auto-complete="off" />
          </el-form-item>
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="subCategoryFormData.name" placeholder="分类名称" auto-complete="off" />
          </el-form-item>
          <el-form-item label="所属路径" prop="path">
            <el-input v-model="subCategoryFormData.path" placeholder="所属路径" auto-complete="off" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click.native="hideSubCategoryForm">取消</el-button>
          <el-button type="primary" :loading="formLoading" @click.native="subCategoryFormSubmit()">提交</el-button>
        </div>
      </el-dialog>

      <el-dialog title="编辑" :visible.sync="curCategoryFormVisible" :before-close="hideCurCategoryForm" :close-on-click-modal="false" width="50%" top="5vh">
        <el-form :key="3" :model="curCategoryFormData" label-width="80px" style="padding-right:25px;">
          <el-form-item label="是否显示">
            <el-radio-group v-model="curCategoryFormData.status">
              <el-radio label="1">显示</el-radio>
              <el-radio label="0">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单类型">
            <el-radio-group v-model="curCategoryFormData.type">
              <el-radio label="1">列表显示</el-radio>
              <el-radio label="2">列表隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="curCategoryFormData.name" placeholder="分类名称" auto-complete="off" />
          </el-form-item>
          <el-form-item label="所属路径" prop="path">
            <el-input v-model="curCategoryFormData.path" placeholder="所属路径" auto-complete="off" />
          </el-form-item>
          <el-form-item label="选中路径" prop="active_path">
            <el-input v-model="curCategoryFormData.active_path" placeholder="所选中路径/各父元素path" auto-complete="off" />
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click.native="hideCurCategoryForm">取消</el-button>
          <el-button type="primary" :loading="formLoading" @click.native="curCategoryFormSubmit()">提交</el-button>
        </div>
      </el-dialog>

    </div>
  </div>
</template>

<script>
import config from '@/api/bgapi'
import request from '@/utils/request'
export default {
  data() {
    return {
      loading: false,
      data: [],
      defaultProps: { children: 'children', label: 'title' },
      formVisible: false,
      formData: { parent_id: '0', type: '1', status: '1', name: '', path: '' },
      formRules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
        path: [{ required: true, message: '请输入分类所在路径', trigger: 'blur' }]
      },
      formRulesEdit: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
        path: [{ required: true, message: '请输入分类所在路径', trigger: 'blur' }]
      },
      formLoading: false,
      subCategoryFormVisible: false,
      subCategoryFormData: { parent_id: '', type: '1', status: '1', name: '', path: '' },
      curCategoryFormVisible: false,
      curCategoryFormData: { type: '', name: '', status: '', path: '' }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      const res = await request.get(config.menu)
      this.loading = false
      if (res.code == '20000') {
        this.data = res.data
      }
    },
    handleAddFirstCategory() {
      this.formVisible = true
    },
    hideForm() {
      this.formVisible = !this.formVisible
      this.resetForm()
      return true
    },
    resetForm() {
      if (this.$refs['dataForm']) {
        this.$refs['dataForm'].clearValidate()
        this.$refs['dataForm'].resetFields()
      }
    },
    formSubmit() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          // this.formLoading = true;
          const _data = {
            menuName: this.formData.name,
            menuTitle: this.formData.path,
            hidden: false,
            idPath: [0]
          }

          var res = await request.post(config.menu, _data)
          this.formLoading = false
          if (res.code == '20000') {
            this.hideForm()
            this.$message.success('分类添加成功')
            this.getList()
          }
        }
      })
    },
    hideSubCategoryForm() {
      this.subCategoryFormVisible = !this.subCategoryFormVisible
      this.resetForm()
      return true
    },
    append(data) {
      this.subCategoryFormVisible = true
      this.subCategoryFormData = { parent_name: data.title, status: '1', parent_id: data.id, type: '1', name: '', path: '' }
    },
    subCategoryFormSubmit() {
      this.$refs['dataForm'].validate(async valid => {
        if (valid) {
          this.formLoading = true
          var res = await request.post(config.addMenuSave, this.subCategoryFormData)
          this.formLoading = false
          if (res.code == '20000') {
            this.hideSubCategoryForm()
            this.$message.success('分类添加成功')
            this.getList()
          }
        }
      })
    },
    remove(data) {
      this.$confirm('确认删除当前分类吗?', '提示', {
        type: 'warning'
      })
        .then(async() => {
          var res = await request.delete(config.menu + '/' + data.id)
          if (res && res.code == '20000') {
            this.$message.success('删除成功')
            this.getList()
          }
        })
    },
    async edit(data) {
      const res = await request.get(config.detUrl, { params: { id: data.id }})
      if (res.code == '20000') {
        this.curCategoryFormVisible = true
        const _info = res.data && res.data.info ? res.data.info : ''
        if (_info) {
          this.curCategoryFormData = {
            id: _info.id,
            parent_id: _info.parent_id,
            type: _info.type + '',
            status: _info.status + '',
            name: _info.name,
            path: _info.path,
            active_path: _info.active_path
          }
        }
      }
    },
    hideCurCategoryForm() {
      this.curCategoryFormVisible = !this.curCategoryFormVisible
      this.resetForm()
      return true
    },
    async curCategoryFormSubmit() {
      // this.$refs["dataForm"].validate(async valid => {
      //   if (valid) {
      this.formLoading = true
      var res = await request.post(config.editUrl, this.curCategoryFormData)
      this.formLoading = false
      if (res.code == '20000') {
        this.hideCurCategoryForm()
        this.$message.success('分类编辑成功')
        this.getList()
      }
      //  }
    //  });
    },
    async setOrder(data) {
      var params = { id: data.id, list_order: data.list_order }
      var res = await request.post(config.sortUrl, params)
      if (res.code == '20000') {
        this.$message.success('分类排序成功')
        this.getList()
      }
    }
  }
}
</script>
<style  scoped>
.app-header{
    padding:0;
    height:50px;
    overflow:hidden;
    text-align:right;
}
.app-header .title{
    float:left;
    font-size:23px;
    border-left:3px solid #1f2f3d;
    padding-left:10px;
    vertical-align:middle;
}
.query-form{
    background:#FAFAFA;
    border-radius:4px;
    padding:23px 0 0 20px;
    margin-bottom:10px;
}
.dialog-footer{ padding-right: 20px;}
.order-list{ display:inline-block; width:80px; margin-right:10px; border-radius: 2px; height:24px; line-height:24px; border:1px solid #66B1FF; color:#66B1FF; text-align: center;}
.order-list:focus { display:inline-block; width:80px; margin-right:10px; border-radius: 2px; height:24px; line-height:24px; border:1px solid #66B1FF; color:#66B1FF; text-align: center;}
.el-tree-node__content {
      height: 32px;
      margin: 0;
      line-height: 32px; font-size: 14px;
    }

</style>
