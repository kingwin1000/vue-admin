<template>
  <div class="app-container">
     <!-- 标题 -->
   	<header class="app-header">
    	<span class="title">{{$route.meta.title}}</span>
      <el-button type="primary" icon="el-icon-edit" @click.native="addChannel">添加频道</el-button>
    </header> 
		
    <el-form :inline="true" :model="listQuery" class="query-form">
      <el-form-item class="query-form-item">
      	<el-input v-model="listQuery.channelName" :clearable = "true" placeholder="请输入标题"></el-input>
        </el-autocomplete>
      </el-form-item>

      <el-form-item>
        <el-button-group>
          <el-button type="primary" icon="el-icon-search"  @click="onSubmit">查询</el-button>
        </el-button-group>
      </el-form-item>
    </el-form>
    
    <el-table v-loading="loading" :data="list">
       <el-table-column label="频道ID" prop="id"/>
       <el-table-column label="频道名称" prop="channelName"/>
       <el-table-column label="频道标题" prop="channelTitle"/>
    	 <el-table-column label="排序" prop="orderNo"/>
       <el-table-column label="操作" >
       	 <el-button-group slot-scope="scope">
       		<el-button type="primary" size="mini" @click.native="handleSet(scope.$index, scope.row)">配置</el-button>
					<el-button type="warning" size="mini" @click.native="handleForm(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click.native="handleDel(scope.$index, scope.row)">删除</el-button>
       	 </el-button-group>
       </el-table-column> 
    </el-table>
  
  
    <el-dialog title="添加频道" :visible.sync="formVisible" :before-close="hideForm" :close-on-click-modal="false" width="50%" top="5vh">
        <el-form :model="formData" :rules="formRules" ref="dataForm">
            <el-form-item label="频道名称" label-width="90px"  prop="channelName">
                <el-input v-model="formData.channelName" placeholder="请输入英文频道名称" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="频道标题" label-width="90px"  prop="channelTitle">
                <el-input v-model="formData.channelTitle" placeholder="请输入中文频道名称" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="状态" label-width="90px" prop="status">
                <el-radio-group v-model="formData.status">
                		<el-radio :label="1">正常</el-radio>
                    <el-radio :label="0">禁用</el-radio>
                </el-radio-group>
            </el-form-item>                       					
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click.native="hideForm">取消</el-button>
            <el-button type="primary" @click.native="formSubmit()" :loading="formLoading">提交</el-button>
        </div>         
    </el-dialog>  
    
  </div>
</template>
<script>
import request from '@/utils/request'
import config from '@/api/bgapi'


export default {
  data() {
    return {
			listQuery: {channelName: ''},
			loading:true,
			formVisible:false,
			formLoading:false,
			formRules:{
				channelName: [{ required: true, message: "请输入频道名称", trigger: "blur" }],
				channelTitle: [{ required: true, message: "请输入频道名称", trigger: "blur" }]	
			},
			formData:{
				channelName:'',channelTitle:'',status:1,orderNo:0,layout:[]
			},
			list:[],
		}
  },
  mounted(){
		this.getList();
  },
  methods: {
		async getList(){
			this.loading = true;
			var res = await request.get(config.channel,{params:this.listQuery});
			this.loading = false;	
			if(res.code == '20000'){
				this.list = res.data;
			}
		},
		addChannel(){
			this.formVisible = !this.formVisible;
		},
		async formSubmit(){
			this.formLoading = true;
			var res = await request.post(config.channel,this.formData);
			this.formLoading = false;
			if(res.code == '20000'){
				this.$message.success("频道添加成功");
				this.formVisible = false;
				this.resetForm();
				this.getList(); 
			}
		},
		handleDel(index, row){
      if (row.id) {
        this.$confirm("确认删除该记录吗?", "提示", {
            type: "warning",
        })
        .then(async () => {
            var res = await request.delete(config.channel+'/'+row.id);
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
		handleSet(index,row){
			this.$router.push({path:'/channel/setting',query: {id:row.id}})
		},		
		onSubmit(){
			this.getList();
		},
    resetForm() {
      if (this.$refs["dataForm"]) {
        // 清空验证信息表单
        this.$refs["dataForm"].clearValidate();
        // 刷新表单
        this.$refs["dataForm"].resetFields();
      }
    }, 		
		hideForm() {
      // 更改值
      this.formVisible = !this.formVisible;
      this.resetForm();
      return true;
		},		
	},
  filters: {},  
}
</script>
<style scoped>

</style>