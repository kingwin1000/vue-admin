<template>
<div class="app-container">
  <header class="app-header">
    <span class="title">{{$route.meta.title}}</span>
  </header>
  <div class="course-class" style="padding:0 15px;">
  	<el-form :model="formData" :rules="formRules" ref="dataForm">
        <el-form-item label="内容标题" prop="title"  label-width="120px" >
            <el-input v-model.trim="formData.title"  placeholder="请输入内容标题" auto-complete="off"></el-input>
        </el-form-item> 
         <el-form-item label="标题图片" label-width="120px" >
           <SingleUpload :imageUrl="imageUrl" @on-select="onSelect"></SingleUpload>           
        </el-form-item>         
         
        <el-form-item label="内容介绍" prop="introduct"  label-width="120px" >
            <el-input type="textarea" v-model.trim="formData.introduct" maxlength="100" show-word-limit placeholder="请输入内容介绍" auto-complete="off"></el-input>
        </el-form-item>   
        
        
        <el-form-item label="选择分类" prop="categories" label-width="120px" >
           	<el-cascader :options="categories"  @change="categoriesChange" v-model="formData.categories" :props="cateProps"></el-cascader> 	
        </el-form-item>           
        <el-form-item label="选择标签"  label-width="120px" >
          <el-select v-model="formData.tags" multiple placeholder="请选择"  @change="tagsChange">
            <el-option v-for="item in tags" :key="item.id" :label="item.tagName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="内容详情" prop="content" label-width="120px" >
        	<Tinymce ref="editor" v-model="formData.content" menubar="" :height="400" class="editor" />   
        </el-form-item>
         <el-form-item   label-width="120px" >	
            <el-button type="warning" icon="el-icon-edit-outline" :loading="loading" @click.native="handleSave">保存</el-button> 
         	<el-button type="primary" icon="el-icon-folder-checked" :loading="loading" @click.native="handleRelease">发布</el-button> 
         
         </el-form-item>            
  	</el-form>
  
  </div>
</div>
</template>
<script>
import config from '@/api/bgapi'
import request from '@/utils/request'
import SingleUpload from "@/components/Upload/SingleUpload";
import Tinymce from '@/components/Tinymce';
export default {
	components: { SingleUpload,Tinymce},
	data() {
		return {
			formData:{
				title:'',
				titleImg:'',
				introduct:'',
				categories:[],
				tags:[],
				content:'',
				status:0,
			},
			formRules: {
				 title: [{ required: true, message: "请输入标题名称!", trigger: "blur"}],
				 categories:[{ required: true, message: "请选择主分类!", trigger: "blur"}],
				 content:[{ required: true, message: "内容不能为空!", trigger: "blur"}],
			},
			categories:[],
			cateProps:{children: 'children', label: 'cateName' ,value:'id'},
			tags:[],
			imageUrl:'',
			loading:false
		}
	},
  mounted(){
    this.getCategories();
		this.getTags();
  },	
  methods: {
		async getCategories() {
			let res = await request.get(config.contentCate);
      if(res.code == '20000'){
        this.categories = res.data;
      }			
		},
		async getTags() {
			let res = await request.get(config.contentTags);
      if(res.code == '20000'){
        this.tags = res.data;
      }				
		},
    onSelect(data){
			this.formData.titleImg = data.resUrl;
			this.imageUrl = data.imgUrl;
    },
		categoriesChange(value){
			this.formData.categories = value;
		},
		tagsChange(value){
			this.formData.tags = value;
		},
    resetForm() {
      if (this.$refs["dataForm"]) {
        // 清空验证信息表单
        this.$refs["dataForm"].clearValidate();
        // 刷新表单
        this.$refs["dataForm"].resetFields();
				this.formData = {title:'',titleImg:'',introduct:'', categories:[], tags:[], content:'', status:0};
      	this.$refs.editor.setContent('');
				this.imageUrl = '';
			}
    },			
		handleSave(){
			this.$refs["dataForm"].validate(async valid => {
				if(valid){
					var res = await request.post(config.content,this.formData);	
					if(res.code == '20000'){
						this.$message.success('保存成功！');					
						this.resetForm();
					}else{
						this.$message.error('保存失败，请联系管理员！');	
					}
				}	
			})	
		},
		handleRelease(){
			this.$refs["dataForm"].validate(async valid => {
				if(valid){
					this.formData.status = 1;
					var res = await request.post(config.content,this.formData);	
					if(res.code == '20000'){
						this.$message.success('保存成功！');					
						this.resetForm();
					}else{
						this.$message.error('保存失败，请联系管理员！');	
					}
				}	
			})			
		}
		
	}
}
</script>
<style  scoped>
.editor-content { margin-top: 20px;}
</style>