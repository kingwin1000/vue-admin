<template>
  <div class="app-container">
     <!-- 标题 -->
   	<header class="app-header">
    	<span class="title">{{$route.meta.title}}</span>
      <div class="back" @click="goBack">
        <i class="el-icon-back" ></i>
        <el-divider direction="vertical"></el-divider>
        <el-button type="text">返回</el-button>
      </div>
    </header> 
    <el-container  style="padding:0">
      <el-aside class="classify" width="300px">
  			<div class="tit-path">
        	频道配置
          <el-button-group class="tit-btn">
          	<el-button type="primary" icon="el-icon-document-add" size="mini" @click.native="addChannelCate">添加</el-button>
          	<el-button type="primary" icon="el-icon-s-tools" size="mini">设置</el-button>
        	</el-button-group>
        </div>
        
        <el-tree  :data="treeList" :props="defaultProps" :highlight-current="true" :expand-on-click-node="false" node-key="id" default-expand-all>	
            <div class="tree-path" slot-scope="{ node, data }">
              <span v-show="!data.extend" class="tree-title">{{  data.name }}</span>
              <span v-show="data.extend" class="tree-title">
                <el-input style="width:100%;"  placeholder="输入英文名称" size="mini" v-model.trim="data.name" auto-complete="off"></el-input>
              </span>
              <el-button-group class="tit-btn">
              	
                <el-button v-show="data.extend" type="warning" size="mini" icon="el-icon-document-checked" @click.stop="() => append(data)"></el-button>
                <el-button v-show="!data.extend" type="primary" size="mini" icon="el-icon-edit" @click.stop="() => changeState(data)"></el-button>
                
                <el-button v-if="data.parentId == '0'" :disabled="data.extend" type="primary" size="mini" icon="el-icon-document-add" @click.stop="() => appendChild(data)"></el-button>
                
                <el-button type="danger" icon="el-icon-delete" size="mini" @click.stop="() => remove(node, data)"></el-button>
             </el-button-group>
            </div>
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
           		<el-button-group>
           		 <el-button type="primary" icon="el-icon-search"  @click="onSubmit">查询</el-button>
           		 <el-button type="primary" icon="el-icon-edit"  @click="onAddRes">关联</el-button>	
           		</el-button-group>
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
           		<el-button-group>
           		 <el-button type="primary" icon="el-icon-search"  @click="onSubmit">查询</el-button>
           		 <el-button type="primary" icon="el-icon-edit"  @click="onAddContent">关联</el-button>	
           		</el-button-group>
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
			formLoading:false,
			formData:{
				name:'',type:0,orderNo:0,resData:[],contentData:[]
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
		goBack(){
			this.$router.back();
		},		
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
			let _data = {title:'newBranch',type:0,orderNo:0,extend:true};
			this.treeList.push(_data);		
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
			this.getList();
		},
		changeState(data){
			if(data.id){
				data.extend	 = true;
			}			
		},
		async appendChild(data){
			const newChild = {parentId:data.id, orderNo:0, hidden:false, name:'',channelId:this.id, extend:true};
	    if (!data.children) {
        this.$set(data, 'children', []);
      }	
			data.children.push(newChild);
		},
		async append(data) {
			console.log(data.id);
			if(!data.name){this.$message.error('请输入英文分类名称！');return;}
			if(data.id){
				var res = await request.put(config.setChannelCate+'/'+data.id,{name:data.name});
				if(res.code == '20000'){
					data.extend	 = false;
				}				
			}else{
				data.id = data.id ? data.id : '0';
				var newChild = {
					name:data.name,type:0,orderNo:0,parentId:data.id,channelId:this.id
				};	
				console.log(newChild);		
				var res = await request.post(config.addChannelCate,newChild);
				if(res.code == '20000'){
					data.extend	 = false;
				}
			}
		},
		async remove(node, data) {
			if(data.id){
				var res = await request.delete(config.delChannelCate+'/'+data.id);
				this.getList();
			}else{
				const parent = node.parent;
				const children = parent.data.children || parent.data;
				const index = children.findIndex(d => d.id === data.id);
				children.splice(index, 1);
			}
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
.tit-path{ padding:0 0 0 8px;  margin:0px 0 20px; font-size:16px; }
.tit-btn{ float:right; border-radius:25px; margin-top:3px;}
.tit-btn >>> button.el-button{height:25px; line-height:25px; padding:0 8px;}

.tree-path{flex: 1; display: flex; align-items: center; font-size:14px; justify-content: space-between;}
.custom-tree-node { height:50px; padding:0; margin:0; vertical-align:middle; border:1px solid blue;}	
.classify { background:#FAFAFA; padding:10px}
.classify >>> .el-tree-node__content{height: 40px; line-height: 40px; padding-right:10px;}
.tree-title >>> .el-input__inner{ padding-left:5px; margin-left:-5px;}
</style>