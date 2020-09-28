<template>
  <div class="app-container">
  	<header class="app-header">
    	<span class="title">{{$route.meta.title}}</span>
      <el-button type="primary" icon="el-icon-edit"  @click.native.prevent="handleForm(null,null)">添加新角色</el-button>
    </header>
    <el-form :inline="true" :model="listQuery" class="query-form">
      <el-form-item class="query-form-item">
        <el-autocomplete
           class="inline-input"
          v-model="listQuery.name"
          :fetch-suggestions="querySearch"
          placeholder="请输入角色名称"
          :trigger-on-focus="false"
          :clearable = "true"
          @select="handleSelect"
        >
        <template slot-scope="{ item }">
          <div class="name">{{ item.name }}</div>
        </template>
        </el-autocomplete>
      </el-form-item>
      <el-form-item class="query-form-item">
        <el-select v-model="listQuery.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option label="禁用" value="0" />
          <el-option label="正常" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button-group>
          <el-button type="primary" icon="el-icon-search"  @click="onSubmit">查询</el-button>
        </el-button-group>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="角色 ID" prop="id"/>
      <el-table-column label="角色名称" prop="name"/>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <template v-if="scope.row.name == '超级管理员'">
            <el-tag  type="danger">系统</el-tag>
          </template>
          <template v-else>
            <el-tag :type="scope.row.status | statusFilterType">{{ scope.row.status | statusFilterName }}</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="描述" :show-overflow-tooltip="true">
        <template slot-scope="scope">
        	<span v-if="scope.row.name == '超级管理员'" style="color:#CCC">该角色拥用所有限权不允许编辑</span>
          <span v-else>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作"  width="200">     
        <template slot-scope="scope">
          <template v-if="scope.row.name == '超级管理员'">
            <el-button type="text" disabled>授权</el-button>
            <el-button type="text" disabled>编辑</el-button>
            <el-button type="text" disabled>删除</el-button>
        	</template>
          <template v-else>
            <el-button type="text" @click.native="handleAuth(scope.row.id)">授权</el-button>
            <el-button type="text" @click.native="handleForm(scope.$index, scope.row)">编辑</el-button>
            <el-button type="text" @click.native="handleDel(scope.$index, scope.row)">删除</el-button>
          </template>
        </template> 
        
      </el-table-column>    
    </el-table>

    <pagination v-show="total > listQuery.page_size" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.page_size" @pagination="getList" />

    <!--表单-->
    <el-dialog :title="formName" :visible.sync="formVisible" :before-close="hideForm" :close-on-click-modal="false" width="50%" top="5vh">
        <el-form :model="formData" :rules="formRules" ref="dataForm">
            <el-form-item label="角色名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入角色名称" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="formData.status">
                    <el-radio :label="0">禁用</el-radio>
                    <el-radio :label="1">正常</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="描述">
                <el-input type="textarea" placeholder="请输入角色详细描述" v-model="formData.remark"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click.native="hideForm">取消</el-button>
            <el-button type="primary" @click.native="formSubmit()" :loading="formLoading">提交</el-button>
        </div>
    </el-dialog>
    <!--授权界面-->
    <el-dialog title="授权" :before-close="hideAutoForm" :visible.sync="authFormVisible" :close-on-click-modal="false">
        <el-tree
            style="max-height: 55vh;overflow-y: auto;"
            v-loading="treeLoad"
            :data="authList"
            show-checkbox=""
            default-expand-all=""
            node-key="id"
            ref="tree"
            :props="defaultProps"
            :default-checked-keys="authDefaultCheckedKeys">
        </el-tree>
        <div slot="footer" class="dialog-footer">
            <el-button @click.native="hideAutoForm()">取消</el-button>
            <el-button type="primary" @click.native="authFormSubmit()" :loading="authLoading">提交</el-button>
        </div>
    </el-dialog>    
  </div>
</template>

<script>
import config from '@/api/system';
import request from '@/utils/request';
import Pagination from '@/components/Pagination'
const formJson = {
    id: "",
    name: "",
    status: 1,
    remark: ""
};
export default {
  components: { Pagination },
  filters: {
    statusFilterType(status) {
      const statusMap = {
        0: 'gray',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status]
    },
    statusFilterName(status) {
      const statusMap = {
        0: '禁用',
        1: '正常',
        2: '未验证'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      loading: false,
      listQuery: {
        page: 1,
        page_size: 20,
        name: '',
      //  status: ''
      },
      list: [],
      total:0,
			formVisible:false,
			formData:formJson,
			formRules: {
					name: [
							{ required: true, message: "请输入名称", trigger: "blur" }
					],
					status: [
							{ required: true, message: "请选择状态", trigger: "change" }
					]
			},
			index:null,
			formName:'',
			formLoading:false,
      authFormVisible:false,
      defaultProps: {
          children: 'children',
          label: 'title'
      }, 
      authDefaultCheckedKeys:[],
      authList:[],
      authLoading:false,
      treeLoad:true,   
    }
  },
  mounted(){
    this.authFormData = {id:"",auth_rules:[]}
    this.getList();
  },
  methods: {
    async getList(){
      this.loading = true;
      var res = await request.get(config.listUrl,{params:this.listQuery});
      this.loading = false;
      this.list = res.data.list || [];
      this.total = res.data.total || 0;
    },
    async querySearch(queryString, cb) {
      var res = await request.get(config.listUrl,{params:this.listQuery});
      var restaurants = res.data.list;
      cb(restaurants);
    },
    handleSelect(item) {
      this.listQuery.name = item.name;
      this.getList();
    },    
		// 表单弹窗
		handleForm(index, row) {
      this.formVisible = true;
      if (index !== null) {
        this.index = index;
        this.formName = "编辑";
        this.formData = Object.assign({}, row);
      }else{
        this.index = null;
        this.formName = "新增";
        this.formData = Object.assign({}, formJson);
      }
		},
		hideForm() {
      // 更改值
      this.formVisible = !this.formVisible;
      this.resetForm();
      return true;
		},
		formSubmit() {
      this.$refs["dataForm"].validate(async valid => {
        if(valid){
          this.formLoading = true;
          if(this.index !== null){
            //编辑
            var res = await request.post(config.editRoleUrl,this.formData);
            if(res.code == '20000'){
              this.formLoading = false;
              this.formVisible = false;
              this.$message.success("操作成功");              
              this.list.splice(this.index, 1, res.data);
            }else{
							this.formLoading = false;
              this.formVisible = false;							
						}
          }else{
            //新增
            var res = await request.post(config.addRoleUrl,this.formData);
            if(res.code == '20000'){
              this.formLoading = false;
              this.formVisible = false;
              this.$message.success("操作成功");              
              this.list.push(res.data);  
            }else{
							this.formLoading = false;
              this.formVisible = false;
						}
          }
        }
      })
    },
    resetForm() {
      if (this.$refs["dataForm"]) {
        // 清空验证信息表单
        this.$refs["dataForm"].clearValidate();
        // 刷新表单
        this.$refs["dataForm"].resetFields();
      }
    },    		
		async handleAuth(id){
      this.authFormData.id = id;
      this.authFormVisible = true;
      var res = await request.get(config.getAuthListUrl,{params:{'id':id}});
      if(res.code == '20000'){
        this.treeLoad = false;
        this.authList = res.data.auth_list;
        this.authDefaultCheckedKeys = res.data.checked_keys;
      }
		},
		handleDel(index, row){
      if (row.id) {
        this.$confirm("确认删除该记录吗?", "提示", {
            type: "warning",
        })
        .then(async () => {
            var res = await request.post(config.delRoleUrl,{'id':row.id});
            if(res.code == '20000'){
              this.$message.success("删除成功");  
              this.list.splice(index, 1);	
            }else{
              this.$message.error(response.message);
            }
        })
        .catch(() => {
            this.$message.info("取消删除");
        });
      }				
    },
    onSubmit() {
      this.getList();
    },
    async authFormSubmit(){
      this.authLoading = true;
      var checkedKeys = this.$refs.tree.getCheckedKeys();
      this.authFormData.auth_rules = checkedKeys.join(',');
			if (this.authFormData && this.authFormData.auth_rules.length == 0) {
          this.$alert("请至少选择一个权限", "提示", {
              confirmButtonText: "确定"
          });
          this.authLoading = false;
          return false;
      }
      var res = await request.post(config.setAuthUrl,this.authFormData); 
      this.authLoading = false;
      this.authFormVisible = false;             
      if(res.code == '20000'){
        this.$message.success("授权成功");   
      }
    },
    hideAutoForm(){
      this.authFormVisible = !this.authFormVisible;
      this.treeLoad = true;
      this.authList = [];
      this.authDefaultCheckedKeys = [];
      return true;
    } 
  }
}
</script>
