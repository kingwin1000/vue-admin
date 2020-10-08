<template>
  <div class="app-container">
     <!-- 标题 -->
   	<header class="app-header">
    	<span class="title">{{$route.meta.title}}</span>
      <el-button type="primary" icon="el-icon-edit" @click.native="addChannelCate">添加分类</el-button>
    </header> 
    <el-container  style=" padding:0">
      <el-aside width="300px" style=" background:#FAFAFA; padding:10px">
  			<el-tree :data="treeList" :props="defaultProps" :highlight-current="true" :expand-on-click-node="false" node-key="id" default-expand-all>	
      		<span class="custom-tree-node" slot-scope="{ node, data }">
          	<span>{{ node.label }}</span>
            <span>
            	<el-button type="text" size="mini" @click="() => append(data)">Append</el-button>
            	<el-button type="text" size="mini" @click="() => remove(node, data)">Delete</el-button>
            </span>
          </span>
        </el-tree>
      </el-aside>
      <el-main>Main</el-main>   	
		</el-container>
    
    <el-dialog title="添加频道分类" :visible.sync="formVisible" :before-close="hideForm" :close-on-click-modal="false" width="50%" top="5vh">
        <el-form :model="formData" :rules="formRules" ref="dataForm">
            <el-form-item label="频道分类名称" label-width="130px"  prop="name">
                <el-input v-model="formData.name" placeholder="请输入英文频道名称" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="频道分类标题" label-width="130px"  prop="title">
                <el-input v-model="formData.title" placeholder="请输入中文频道名称" auto-complete="off"></el-input>
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
			treeList:[],
			formVisible:false,
			formLoading:false,
			formData:{
				name:'',title:'',type:0,orderNo:0,resData:[],contentData:[],children:[]
			},
			formRules:{},
  		defaultProps: {children: 'children',label: 'title'}					
		}
  },
  mounted(){
		this.id = this.$route.query.id;
		this.getList();
  },
  methods: {
		addChannelCate(){
			this.formVisible = !this.formVisible;
		},
		async getList(){
			var res = await request.get(config.channel,{params:{id:this.id}});
			this.treeList = res.data[0].layout;	
		},
		async formSubmit(){
			this.formLoading = false;
			var res = await request.put(config.addChannelChild+'/'+this.id,this.formData);
			this.formLoading = true;
			this.formVisible = false;
			this.getList();
		},
		hideForm(){
      if (this.$refs["dataForm"]) {
        // 清空验证信息表单
        this.$refs["dataForm"].clearValidate();
        // 刷新表单
        this.$refs["dataForm"].resetFields();
      }			
		},
		append(data) {
			
			const newChild = {
				name:'11',title:'新增',type:0,orderNo:0,resData:[],contentData:[],children:[]
			};
			if (!data.children) {
				this.$set(data, 'children', []);
			}
			data.children.push(newChild);
		},
		remove(node, data) {
			const parent = node.parent;
			const children = parent.data.children || parent.data;
			const index = children.findIndex(d => d.id === data.id);
			children.splice(index, 1);
		},		
	},
  filters: {},  
}
</script>
<style scoped>
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>