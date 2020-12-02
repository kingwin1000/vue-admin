<template>
  <div class="app-container">
     <!-- 标题 -->
   	<header class="app-header">
    	<span class="title">{{$route.meta.title}}</span>
      <el-button type="warning" icon="el-icon-upload" @click.native="upLoadWare">上传资源</el-button>
      <el-button type="danger" icon="el-icon-delete" @click.native="allDelItem">批量删除</el-button>
    </header> 
    <el-form :inline="true" :model="listQuery" class="query-form">
      <el-form-item>
        <el-input v-model="listQuery.resName" :clearable = "true" placeholder="课件名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button-group>
          <el-button type="primary" icon="el-icon-search"  @click="onSubmit">查询</el-button>
          <el-button type="primary" icon="el-icon-refresh"  @click="onSubmit">刷新</el-button>
        </el-button-group>
      </el-form-item>
    </el-form> 
    <!-- 表单 -->
    
    <el-table v-loading="loading" :data="list" border  @selection-change="handleSelectionChange">
      <el-table-column align="center" width="100" type="selection"></el-table-column>
      <el-table-column align="center" width="300" label="资源名称" prop="resName" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-if="editNum === scope.$index" size="mini"  v-model="scope.row.resName"></el-input>
          <span v-else>{{scope.row.resName}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="类型" prop="resType"  width="100">
        <template slot-scope="scope">
          <template>{{ scope.row.resType | typeFilter }}</template>
        </template>
      </el-table-column>
  		<el-table-column align="center" label="大小" prop="resSize" width="100"></el-table-column>
      <el-table-column align="center" label="状态" prop="status"  width="100" >
        <template slot-scope="scope">
          <span style="color:green" v-if="scope.row.status == '0'">正常</span>
          <span style="color:red" v-else-if="scope.row.status == '1'">禁止</span>
        </template>
      </el-table-column>
      
			<el-table-column align="center" label="缩略图" prop="resUrl">
        <template slot-scope="scope">
        	<el-image class="view-img" :src="scope.row.resUrl | setResUrl" lazy></el-image>
        </template>        
      </el-table-column>      
       
			<el-table-column align="center" label="上传时间" prop="created"  show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.created | parseTime('{y}-{m}-{d} {h}:{i}') }}
        </template>        
      </el-table-column>
      <el-table-column align="center"  label="操作">
      	<el-button-group slot-scope="scope">
        	<el-button  type="primary" size="mini" @click.native.prevent="watchWare(scope.$index, scope.row)">预览</el-button>
   				<el-button v-show="editNum !== scope.$index" type="primary" size="mini" @click.native.prevent="editWare(scope.row,scope.$index)">编辑</el-button>
          <el-button v-show="editNum === scope.$index" type="warning" size="mini" @click.native.prevent="editWare(scope.row,scope.$index)">确认</el-button>   
          <el-button type="danger" size="mini"  @click.native.prevent="handleDel(scope.$index, scope.row)">删除</el-button> 
        </el-button-group>
      </el-table-column>      
         
    </el-table>
    <pagination v-show="total > listQuery.pageSize" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList"/>



    <el-dialog title="上传资源" :visible.sync="upLoadFormVisible" :before-close="hideForm" :close-on-click-modal="false" width="45%" top="5vh">	
      <el-form ref="upLoadForm"  :model="upLoadData" :rules="upLoadRules">
        <el-form-item label="资源类型"  prop="resType" label-width="100px" class="query-form-item">        
          <el-select v-model="upLoadData.resType" @change="selectUploadType" style=" width:250px;">
            <el-option label="图片" value="0" />
            <el-option label="视频" value="1" />
            <el-option label="音频" value="2" />
            <el-option label="文本" value="3" />            
          </el-select>
        </el-form-item> 
        <el-form-item label="资源名称"  prop="resName" label-width="100px" class="query-form-item">
          <el-input  v-model="upLoadData.resName" placeholder="请输入课件名称" style=" width:250px;"></el-input>
        </el-form-item>
        <el-form-item v-if="upLoadData.resType == '3'" label="文本内容"  label-width="100px" class="query-form-item">
        	<el-input type="textarea" :rows="5" placeholder="请输入文本内容，可适当加HTML标签" style="width:400px;" v-model="upLoadData.resContent"></el-input>
        </el-form-item>
        <el-form-item v-else label="文件"  label-width="100px" class="query-form-item">
          <SingleUpload 
          :ext="typeName[upLoadData.resType]" 
          :type="uploadType[upLoadData.resType]" 
          :size="sizeName[upLoadData.resType]" 
          :imageUrl="imageUrl" @on-select="onSelect"></SingleUpload>
          <div class="el-upload__tip">只能上传{{typeName[upLoadData.resType]}}文件，且不超过{{sizeName[upLoadData.resType]}}M</div>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" style="text-align:right">
        <el-button @click.native="hideForm">取消</el-button>
        <el-button type="primary" :loading="formLoading" @click.native="upLoadFormSubmit()">提交</el-button>
      </div>      
    </el-dialog>
    
    <el-image-viewer v-if="showViewer" class="img-view" :on-close="closeViewer"  :url-list="srcList" /> 
    
    <el-dialog title :visible.sync="videoVisible" class="video-dialog" :close-on-click-modal="false">	
      <i class="el-icon-circle-close video-close" @click="closeVideo"></i>
      <video v-if="videoType == '1'" ref="videoPlayer" controlsList="nodownload noremoteplayback" disablePictureInPicture οncοntextmenu="return false"  class="video-box" :src="videoUrl" controls></video>
      <video v-if="videoType == '2'" style="height:55px" ref="videoPlayer" controlsList="nodownload noremoteplayback" disablePictureInPicture οncοntextmenu="return false"  class="video-box" :src="videoUrl" controls></video>
    </el-dialog>
    
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import config from '@/api/bgapi'
import { parseTime } from '@/utils'
import SingleUpload from "@/components/Upload/SingleUpload";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
export default {
  components: { Pagination,SingleUpload,ElImageViewer},
  data() {
    return {
			loading: false,
			upLoadFormVisible:false,
			total: 0,
      listQuery: {
        resName: '',
        page: this.$route.query.page?Number(this.$route.query.page):1,
        pageSize: 15
      },
      upLoadData:{
        resType:'0',
        resName:'',
        resUrl:'',
				resContent:'',
				resSize:''
      },	
      upLoadRules:{
        resName: [{ required: true, message: "请输入资源名称", trigger: "blur"}],
        resUrl: [{ required: true }]        
      },					
			list:[],
      formLoading:false,
      imageUrl:'',
      uploadType:['image','video','audio'],
      typeName:['jpg/png/gif/jpeg','mp4','mp3/wma'],
      sizeName:[5,20,20],
      showViewer:false,
      srcList:[],
      videoVisible:false,
      videoUrl:'',
      videoType:'',
      editNum:''
    }
  },
  mounted(){
    this.selectItme = [];
    this.getList();
  },
  methods: {
		async upLoadFormSubmit(){
      if(this.upLoadData.file == ''){
        this.$message.error('资源文件文件不能为空！');return;
      }
      this.formLoading = true;
      var res = await request.post(config.resources,this.upLoadData);
      this.formLoading = false;
      this.upLoadFormVisible = false;
      this.resetForm();
      if(res.code == '20000'){
        this.$message.success("课件添加成功"); 
        this.isNewAdd  = true;
        this.listQuery.page = 1;
        this.getList();
      }
    },		
    onSubmit() {
      this.getList()
    },
    async getList() {
      this.loading = true;
      var res = await request.get(config.resources,{params:this.listQuery});
      this.loading = false;
      this.list = res.data || [];
      this.total = res.totalNum || 0;
    },
    handleSelectionChange(val){
      this.selectItme = val;
    },
		hideForm(){
      this.upLoadFormVisible = !this.upLoadFormVisible;
      this.resetForm();
      return true;
    },
    selectUploadType(){
      this.imageUrl = ''; 
    },
		onSelect(data){
			this.upLoadData.resUrl = data.resUrl;
			this.upLoadData.resSize = data.resSize;
			this.imageUrl = data.imgUrl;
    },
    closeVideo(){
      this.videoType = '';
      this.videoVisible = false;
      this.videoUrl = '';
    },
		upLoadWare(){
      this.upLoadFormVisible = true;	
		},
    resetForm() {
      if (this.$refs["upLoadForm"]) {
        // 清空验证信息表单
        this.$refs["upLoadForm"].clearValidate();
        // 刷新表单
        this.$refs["upLoadForm"].resetFields();
        this.imageUrl = '';
      }
    },
    allDelItem(){
      if(this.selectItme.length == 0){return}
      this.$confirm("确认删除所选记录吗?", "提示", {
          type: "warning",
      })
      .then(async () => {
          let _ids = this.selectItme.map((item,index) =>{ return item.id});
          var res = await request.post(config.delManyRes,{ids:_ids});
          if(res.code == '20000'){
            this.$message.success("删除成功");  
            this.getList();	
          }
      })
      .catch(() => {
          this.$message.info("取消删除");
      });
    },
    handleDel(index, row){
      if (row.id) {
        this.$confirm("确认删除该记录吗?", "提示", {
            type: "warning",
        })
        .then(async () => {
            var res = await request.delete(config.resources+'/'+row.id);
            if(res.code == '20000'){
              this.$message.success("删除成功");  
              this.getList();	
            }
        })
        .catch(() => {
            this.$message.info("取消删除");
        });
      }
    },
    closeViewer(){
      this.showViewer = false;
    },
    watchWare(index, row){
      if(row.resType == '1' || row.resType == '2'){
        this.videoVisible = true;
        this.videoUrl = process.env.VUE_APP_BASE_API+row.resUrl; 
        this.videoType = row.resType;
        this.$nextTick(() => {
          this.$refs['videoPlayer'].play();
        })
      }else{
        this.showViewer = true;
        this.srcList =  [process.env.VUE_APP_BASE_API+row.resUrl];
      }
    },
    async editWare(row,index){
      if(this.editNum === ''){
        this.editNum = index;
      }else{
        this.editNum = '';
        var res = await request.put(config.resources+'/'+row.id,{resName:this.list[index].resName})
      }
    }										 								 					
	},
  filters: {
    typeFilter(status) {
      const typeMap = { 0: '图片', 1: '视频', 2: '音频', 3: '文本' }
      return typeMap[status]
    },
		setResUrl(img){
			return process.env.VUE_APP_BASE_API+img;	
		}
  },  
}
</script>
<style scoped>
.video-box{ width: 50%;}
.video-dialog >>> .el-dialog{width: 50%;  background:#F1F3F4; border-radius: 5px;}
.video-dialog >>> .el-dialog__header{ display: none;}
.video-dialog >>> .el-dialog__body{ width: 100%; height: 100%; padding: 0;}
.video-box{width: 100%; height: 100%; z-index: 88; border-radius: 5px; overflow: hidden; vertical-align: middle; outline: none; background:rgba(0, 0, 0, 0);}
.video-close{ font-size: 30px; z-index: 99;  position: absolute; top:-15px; right:-15px; cursor: pointer; background:#fff; border-radius: 30px;}
.img-view >>> .el-icon-circle-close {color: #5F6266; background: #fff; border-radius: 50%;}
.view-img >>> img{height:40px; margin:0; line-height:0; width:auto; border:1px solid #DFE6EC; padding:1px; vertical-align:middle;}
</style>