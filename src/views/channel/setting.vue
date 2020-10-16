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
      		<span class="custom-tree-node" @click="() => loadDate(data)" slot-scope="{ node, data }">
          	<span>{{ node.label }}</span>
            <span>
            	<el-button type="text" size="mini" @click="() => append(data)">Append</el-button>
            	<el-button type="text" size="mini" @click="() => remove(node, data)">Delete</el-button>
            </span>
          </span>
        </el-tree>
      </el-aside>
      <el-main style=" padding:0 15px;">
      <template v-if="curItem.type == 0">
      	<el-form :inline="true" :model="listQueryRes" class="query-form">
        	 <el-form-item>	
            <el-select v-model="curItem.type" @change="changeCurItem" placeholder="请选择状态">
              <el-option label="资源" :value="0" />
              <el-option label="资讯" :value="1" />
            </el-select>             
          </el-form-item>
           <el-form-item class="query-form-item">
           		<el-input v-model="listQueryRes.resName" :clearable = "true" placeholder="请输入资源名称"></el-input>
           </el-form-item>
           <el-form-item>
           		 <el-button type="primary" icon="el-icon-search"  @click="onSubmit">查询</el-button>
           		 <el-button type="primary" icon="el-icon-edit"  @click="onAddRes">关联</el-button>	
           </el-form-item>
        </el-form>
        <el-table  ref="multipleTable" key="1" v-loading="loading" row-key="id" :data="listRes" border  @selection-change="handleSelectionChange">
        	<el-table-column align="center" width="70" type="selection"  :reserve-selection="true" >

          </el-table-column>
          <el-table-column align="center" label="id" prop="id" width="200"></el-table-column> 
          <el-table-column align="center" label="资源名称" prop="resName" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" label="类型" prop="resType"  width="100">
            <template slot-scope="scope">
              <template>{{ scope.row.resType | typeFilter }}</template>
            </template>
          </el-table-column>
                  
        	<el-table-column align="center" label="大小" prop="resSize" width="100"></el-table-column>
          <el-table-column align="center" label="上传时间" prop="created"  show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.created | parseTime('{y}-{m}-{d} {h}:{i}') }}
            </template>        
          </el-table-column>        
        </el-table>
        <pagination :total="totalRes" :page.sync="listQueryRes.page" :limit.sync="listQueryRes.pageSize" @pagination="getResList"/>
      </template>
      
      
      
      <template v-if="curItem.type == 1">  
      	<el-form :inline="true" :model="listQueryContent" class="query-form">
        	<el-form-item>	
            <el-select v-model="curItem.type" @change="changeCurItem" placeholder="请选择状态">
              <el-option label="资源" :value="0" />
              <el-option label="资讯" :value="1" />
            </el-select>             
          </el-form-item> 
          <el-form-item>
            <el-input v-model="listQueryContent.title" :clearable = "true" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item>
            <el-cascader :options="categories" :props="cateProps"  :clearable = "true" v-model="listQueryContent.categories"></el-cascader>
          </el-form-item>           
           <el-form-item>
           		 <el-button type="primary" icon="el-icon-search"  @click="onSubmit">查询</el-button>
           		 <el-button type="primary" icon="el-icon-edit"  @click="onAddContent">关联</el-button>	
           </el-form-item>          	
        </el-form>
				<el-table  ref="multipleTable" key="2"  v-loading="loading" row-key="id" :data="listContent" border  @selection-change="handleSelectionChange">
  			 	<el-table-column align="center" width="70" type="selection"  :reserve-selection="true" ></el-table-column>
          <el-table-column align="center" label="id" prop="id" width="200"></el-table-column>
          <el-table-column align="center" label="标题" prop="title"></el-table-column>
					<el-table-column align="center"  label="分类" show-overflow-tooltip>
            <template slot-scope="scope">
               {{ scope.row.categories | parseCate(categories)}}
            </template>
          </el-table-column>
          
          
          <el-table-column align="center" label="点赞数" prop="likeNum" width="80" />
      		<el-table-column align="center" label="点击数" prop="clickNum" width="80" />
      		
          

      		
          
          
          <el-table-column align="center" label="修改时间" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.updateDate | parseTime('{y}-{m}-{d} {h}:{i}') }}
            </template>        
          </el-table-column>  
          
          <el-table-column align="center" label="创建时间"  show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.created | parseTime('{y}-{m}-{d} {h}:{i}') }}
            </template>        
          </el-table-column>             
       
                
        
          
          
         </el-table>
        
        <pagination :total="totalContent" :page.sync="listQueryContent.page" :limit.sync="listQueryContent.pageSize" @pagination="getContentList"/>
        
      </template>  
        
        
      </el-main>   	
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
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
export default {
  components: { Pagination,ElImageViewer},	
  data() {
    return {
			treeList:[],
			formVisible:false,
			formLoading:false,
			formData:{
				name:'',title:'',type:0,orderNo:0,resData:[],contentData:[]
			},
			formRules:{},
  		defaultProps: {children: 'children',label: 'title'},
			curItem:{type:1},
			listQueryRes:{page:1,pageSize:10},
			listRes:[],
			loading:false,
			totalRes:0,
			listQueryContent:{page:1,pageSize:10,title:''},
			cateProps:{children: 'children', label: 'cateName' ,value:'id'},
			categories:[],
			listContent:[],
			totalContent:0,	
		}
  },
  mounted(){
		this.id = this.$route.query.id;
		this.selectItme = [];
		this.getList();
		this.getResList();
		this.getCategories();
		this.getContentList();
  },
  methods: {
		changeCurItem(){
			this.$refs.multipleTable.clearSelection();
			if(this.curItem.type == '0'){
				this.getResList()
			}else if(this.curItem.type == '1'){
				this.getContentList()	
			}	
		},
		async getResList(){
			this.listQueryRes.channelCateId = this.curItem.channelCateId;
			var res = await request.get(config.getChannelRes,{params:this.listQueryRes});
			this.listRes = res.data || [];
			this.$nextTick(() => {
				this.listRes.forEach(item =>{
					if(item.sort != null && item.sort > -1){
					 this.$refs.multipleTable.toggleRowSelection(item,true);	
					}
				})				
			})
			this.totalRes = res.totalNum || 0;
		},		
		async getContentList(){
			this.listQueryContent.channelCateId = this.curItem.channelCateId
			var res = await request.get(config.getChannelContent,{ params:this.listQueryContent } );	
			this.listContent = res.data || [];
			this.$nextTick(() => {
				this.listContent.forEach(item =>{
					if(item.sort != null && item.sort > -1){
					 this.$refs.multipleTable.toggleRowSelection(item,true);	
					}
				})				
			})			
			this.totalContent = res.totalNum || 0;		 
		},
		async onAddContent(){
			if(!this.curItem.channelCateId){return}
			var _ids = this.selectContentItme.map((item,index) =>{ return item.id});
			
			var res = await request.put(config.setChannelCate+'/'+this.curItem.channelCateId,{type:1, contentData:_ids})
			this.listQueryContent.page = 1;
			this.getContentList();				
			
		},
		

		onSubmit(){
			if(this.curItem.type == '0'){
				this.getResList()
			}else if(this.curItem.type == '1'){
				this.getContentList()	
			}
		},
		async getCategories(){
			let res = await request.get(config.contentCate);
      if(res.code == '20000'){
        this.categories = res.data;
      }					
		},
		addChannelCate(){
			this.formVisible = !this.formVisible;
		},
		async getList(){
			var res = await request.get(config.getChannelCate,{params:{channelId:this.id}});
			this.treeList = res.data;	
		},
		async formSubmit(){
			this.formLoading = false;
			this.formData.channelId = this.id;
			var res = await request.post(config.addChannelCate,this.formData);
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
			this.formVisible = false;				
		},
		async append(data) {
			//console.log(data.id);
			var newChild = {
				name:'111',title:'新增',type:0,orderNo:0,resData:[],contentData:[], parentId:data.id,channelId:this.id
			};			
			var res = await request.post(config.addChannelCate,newChild);
			this.getList();
			/***
			const newChild = {
				name:'11',title:'新增',type:0,orderNo:0,resData:[],contentData:[],children:[]
			};
			if (!data.children) {
				this.$set(data, 'children', []);
			}
			data.children.push(newChild);
			**/
		},
		async remove(node, data) {
			var res = await request.delete(config.delChannelCate+'/'+data.id);
			this.getList();
			/**
			const parent = node.parent;
			const children = parent.data.children || parent.data;
			const index = children.findIndex(d => d.id === data.id);
			children.splice(index, 1);
			**/
		},
		loadDate(data){
			//console.log('aaaaaaaa',data);
			this.$refs.multipleTable.clearSelection();
			this.curItem.type = data.type;
			this.curItem.channelCateId = data.id;
			
			if(this.curItem.type == '0'){
				this.getResList()
			}else if(this.curItem.type == '1'){
				this.getContentList()	
			}	
		},
		handleSelectionChange(val){
			if(this.curItem.type == '0'){
				this.selectItme = val;
			}else if(this.curItem.type == '1'){
				this.selectContentItme = val;
			}
			//console.log(this.selectItme);
		},
		async onAddRes(){
			//if(this.selectItme.length == 0){return}
			if(!this.curItem.channelCateId){return}
			var _ids = this.selectItme.map((item,index) =>{ return item.id});
			var res = await request.put(config.setChannelCate+'/'+this.curItem.channelCateId,{type:0,resData:_ids})
			this.listQueryRes.page = 1;
			this.getResList();
		},
		categoriesChange(){
		}	
	},
  filters: {
    typeFilter(status) {
      const typeMap = { 0: '图片', 1: '视频', 2: '音频', 3: '文本' }
      return typeMap[status]
    },
		parseCate(cateIds,cateArr){
			var arr = cateIds;
			var data = cateArr;
			function getCity(arr, data, city = []) {
				if (typeof data === "object") {
						for (let i = 0; arr[i] !== undefined; i++) {
								for (let j = 0; data[j] !== undefined; j++) {
										if (arr[i] === data[j].id) {
												city.push(data[j].cateName);
										}
								}
						};
						for (let i = 0; data[i] !== undefined; i++) {
								getCity(arr, data[i].children, city);
						};
				}
				return city;
			}

			var str = getCity(arr,data).join('/')
			
			return str;
		}		
  },  
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