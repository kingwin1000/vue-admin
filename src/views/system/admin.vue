<template>
  <div class="app-container">
  	<header class="app-header">
    	<span class="title">{{$route.meta.title}}</span>
      <el-button type="primary" icon="el-icon-edit" @click.native="handleForm(null,null)">添加管理员</el-button>
    </header>
    <el-form :inline="true" :model="listQuery" class="query-form">
      <el-form-item class="query-form-item">
        <el-autocomplete
          v-model="listQuery.name"
          :fetch-suggestions="querySearch"
          placeholder="请输入用户名"
          :trigger-on-focus="false"
          :clearable = "true"
          @select="handleSelect"
        >
        <template slot-scope="{ item }">
          <div class="name">{{ item.username }}</div>
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
      <el-form-item class="query-form-item">
        <el-select v-model="listQuery.role_id" placeholder="请选择角色">
          <el-option label="全部" value="" />
          <el-option v-for="item in rolesList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button-group>
          <el-button type="primary" icon="el-icon-search" @click.native="onSubmit">查询</el-button>
        </el-button-group>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list">
      <el-table-column label="用户 ID"  width="120px" prop="id"/>
      <el-table-column label="用户名" prop="username"/>
      <el-table-column label="状态">
        <template slot-scope="scope">
        	<el-tag v-if="scope.row.username == 'admin'" type="danger">系统</el-tag>
          <el-tag v-else :type="scope.row.status | statusFilterType">{{ scope.row.status | statusFilterName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="角色" prop="roles">
        <template slot-scope="scope">
        	<template v-if="scope.row.username == 'admin'" type="danger">超级管理员</template>
          <template v-else >{{ scope.row.roles | rolesFilter( rolesList )  }}</template>
        </template>
      </el-table-column>
      <el-table-column label="登录时间" width="200px" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <template v-if="scope.row.last_login_time !== 0">
            <i class="el-icon-time" /><span>{{ scope.row.last_login_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
          <template v-else>---</template>
        </template>
      </el-table-column>
      <el-table-column label="登录IP">
        <template slot-scope="scope">
          <span>{{ scope.row.last_login_ip ? scope.row.last_login_ip : '---'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right">
        <template slot-scope="scope">
        	<template v-if="scope.row.username == 'admin'">
          	<el-button type="text" disabled>编辑</el-button>
          	<el-button type="text" disabled>删除</el-button>
        	</template>
        	<template v-else>
          	<el-button type="text" @click="handleForm(scope.$index, scope.row)">编辑</el-button>
          	<el-button type="text" @click.native.prevent="handleDel(scope.$index, scope.row)">删除</el-button>
        	</template>          
        </template>
      </el-table-column>
    </el-table>
		<pagination v-show="total > listQuery.page_size" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.page_size" @pagination="getList" />

    <!--表单-->
    <el-dialog :title="formName" :visible.sync="formVisible" :before-close="hideForm"  :close-on-click-modal="false" width="50%" top="5vh">
      <el-form v-if = "index === null" ref="dataForm" :key="1" :model="formAddData" :rules="addRules">
        <el-form-item label="用户名" prop="username" label-width="80px" >
          <el-input v-model="formAddData.username" placeholder="请输入用户名" auto-complete="off" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password" label-width="80px">
          <el-input v-model="formAddData.password" placeholder="请输入登录密码" type="password" auto-complete="off" />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPassword" label-width="80px">
          <el-input v-model="formAddData.checkPassword" placeholder="请确认登录密码" type="password" auto-complete="off" />
        </el-form-item>
        <el-form-item label="状态" prop="status" label-width="80px">
          <el-radio-group v-model="formAddData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" label-width="80px">
          <el-checkbox-group v-model="formAddData.role_ids">
            <el-checkbox :disabled="item.status == '0'" v-for="item in rolesList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <el-form v-else ref="dataFormEdit" :model="formEditData" :key="2" :rules="editRules">
        <el-form-item label="用户名" prop="username" label-width="80px" >
           <el-input disabled v-model="formEditData.username" placeholder="请输入用户名" auto-complete="off" />
        </el-form-item>
        <el-form-item label="登录密码" prop="new_password" label-width="80px">
          <el-input v-model="formEditData.check_password" placeholder="请输入登录密码" type="password" auto-complete="off" />
        </el-form-item>
        <el-form-item label="确认密码" prop="check_password" label-width="80px">
          <el-input v-model="formEditData.new_password" placeholder="请确认登录密码" type="password" auto-complete="off" />
        </el-form-item>
        <el-form-item label="状态" prop="status" label-width="80px">
          <el-radio-group v-model="formEditData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" prop="roles" label-width="80px">
          <el-checkbox-group v-model="formEditData.role_ids">
            <el-checkbox :disabled="item.status == '0'" v-for="item in rolesList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" style="text-align:right">
        <el-button @click.native="hideForm">取消</el-button>
        <el-button type="primary" :loading="formLoading" @click.native="formSubmit()">提交</el-button>
      </div>      
    </el-dialog>
  </div>
</template>

<script>
import config from '@/api/bgapi'
import request from '@/utils/request'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
import { validUsername,validUsernameOrEmpty } from '@/utils/validate'
const formJson = {
	password: '',
	username: '',
	checkPassword: '',
	status: 1,
	role_ids: []
} 
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
    },
    rolesFilter(roleArr,rolesList){
			if(rolesList && rolesList.length > 0){
				var roleStr = '';
				roleArr.forEach(item => {
					let _role = rolesList.find(role=>role.id == item);
					roleStr += _role.name+'/';
				});
				return roleStr.substr(0,roleStr.length-1);
			}else{
				return '--';
			}
    }
  },
  data() {  
		let validateNumLetter = (rule, value, callback) => {
				if (!validUsername(value)) {
						callback(new Error("请输入6-18位数字及小写字母"));
				} else {
						callback();
				}
		};
		let validateNumLetterOrEmpty = (rule, value, callback) => {
				if (!validUsernameOrEmpty(value)) {
						callback(new Error("请输入6-18位数字及小写字母或为空"));
				} else {
						callback();
				}
		};
		let validatePass2 = (rule, value, callback) => {
				if (value === "") {
						callback(new Error("请再次输入密码"));
				} else if (value !== this.formAddData.password) {
						callback(new Error("两次输入密码不一致!"));
				} else {
						callback();
				}
		};	
		let validatePass22 = (rule, value, callback) => {
				if (value !== this.formEditData.new_password) {
						callback(new Error("两次输入密码不一致!"));
				} else {
						callback();
				}
		};		
		 
    return {
      loading: false,
      rolesList : [],
      listQuery: {
        page: 1,
        page_size: 20,
        name: '',
        //status: '',
        //role_id: ''
      },
      total: 0,
      list: [],
      formVisible: false,
      formAddData:formJson,
      formEditData:{
				id:'',
				username: '',
				new_password: '',
				check_password: '',
				status: 1,
				role_ids: []
			},
      addRules: {
          username: [
						{ required: true, message: "请输入用户名", trigger: "blur"},
						{ validator: validateNumLetter, trigger: "blur" }
					],
          password: [
            { required: true, message: "请输入密码", trigger: "blur" },
            { validator: validateNumLetter, trigger: "blur" }
          ],
          checkPassword: [
            {required: true,message: "请再次输入密码",trigger: "blur"},
            {validator: validatePass2, trigger: "blur"}
          ]
      },
      editRules: {
          new_password: [
            { validator: validateNumLetterOrEmpty, trigger: "blur" }
          ],
          check_password: [
            {validator: validatePass22, trigger: "blur"}
          ]
      },
      formLoading: false,
			index:null,
			formName:'',
  	}
  },
  mounted() { 
   // this.getRolesList();
   // this.getList();
  },
  methods: {
    async getRolesList(){
      var res = await request.get(config.listUrl,{params:{'page':'1','page_size':'50'}});
      var _list = res.data && res.data.list;
      _list.splice(_list.findIndex(item => item.name === '超级管理员'), 1)
      this.rolesList = _list || [];
    },
    async getList() {
      this.loading = true;
      var res = await request.get(config.adminIndexUrl,{params:this.listQuery});
      this.loading = false;
      this.list = res.data.list || [];
      this.total = res.data.total || 0;
    },
    async querySearch(queryString, cb) {
      var res = await request.get(config.adminIndexUrl,{params:this.listQuery});
      var restaurants = res.data.list;
      cb(restaurants);
    },
    handleSelect(item) {
      this.listQuery.name = item.username;
      this.getList();
    },     
		onSubmit(){
			this.getList();
		},
    handleForm(index, row) {
      this.formVisible = true
      if (index !== null) {
        //编辑
        this.index = index;
        this.formName = "编辑";
        this.formEditData = {
						id:row.id,
            username: row.username,
            new_password: '',
            check_password: '',
            status: row.status,
            role_ids: row.roles
        }
      }else{
        //新增
        this.index = null;
        this.formName = "新增";
        this.formAddData = Object.assign({}, formJson);		
      }
    },
		formSubmit(){
			if(this.index !== null){
				this.$refs["dataFormEdit"].validate(async valid => {
          if(valid){
            this.formLoading = true;
            if (this.formEditData && this.formEditData.role_ids.length == 0) {
              this.$alert("请至少选择一个角色", "提示", {confirmButtonText: "确定"});
              this.formLoading = false;
              return false;
            } 
            var _role_ids = this.formEditData.role_ids;
            this.formEditData.role_ids = this.formEditData.role_ids.length > 0 ? this.formEditData.role_ids.join(','):'';
            //delete this.formEditData.check_password;
            var res = await request.post(config.editAdminUrl,this.formEditData);
            this.formLoading = false;
            this.formVisible = false;    
            if(res.code == '20000'){
              this.list[this.index].status = this.formEditData.status;
              this.list[this.index].roles = _role_ids;
              this.$message.success('管理员修改成功！');
            }          
          }
        })				        
			}else{    
				this.$refs["dataForm"].validate(async valid => {
          if(valid){
            this.formLoading = true;
            if (this.formAddData && this.formAddData.role_ids.length == 0) {
              this.$alert("请至少选择一个角色", "提示", {confirmButtonText: "确定"});
              this.formLoading = false;
              return false;
            }
						var _role_ids = this.formAddData.role_ids;
            this.formAddData.role_ids = this.formAddData.role_ids.length > 0 ? this.formAddData.role_ids.join(','):'';
            var res = await request.post(config.addManageUrl,this.formAddData);
            this.formLoading = false;
            this.formVisible = false; 
            if(res.code == '20000'){
              this.$message.success('管理员添加成功！');
              var obj = {
                id:res.data.id,
                status:this.formAddData.status,
                username:this.formAddData.username,
                last_login_time:0,
                roles:_role_ids,
                last_login_ip:''
              };
              this.list.unshift(obj);  
            }					
          }
			  })			
			}
		},
    hideForm() {
      // 更改值
      this.formVisible = !this.formVisible;
      this.resetForm();
      return true;
    },
    resetForm() {
      if (this.$refs["dataForm"]) {
        // 清空验证信息表单
        this.$refs["dataForm"].clearValidate();
        // 刷新表单
        this.$refs["dataForm"].resetFields();
      }
      if(this.$refs["dataFormEdit"]){
        // 清空验证信息表单
        this.$refs["dataFormEdit"].clearValidate();
        // 刷新表单
        this.$refs["dataFormEdit"].resetFields();
      }
    },
		handleDel(index, row){
      if (row.id) {
        this.$confirm("确认删除该记录吗?", "提示", {
            type: "warning",
        }).then(async () => {
            var res = await request.post(config.delAdminUrl,{'id':row.id});
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
		goToPage(){
			//this.$router.push('/system/auth_permission_rule') 	
		}
  }
}
</script>
