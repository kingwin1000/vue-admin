<template>
  <div class="app-container">
     <!-- 标题 -->
   	<header class="app-header">
    	<span class="title">{{$route.meta.title}}</span>
      <el-button type="danger" icon="el-icon-delete" @click.native="allDelItem">批量删除</el-button>
    </header> 
    <el-form :inline="true" :model="listQuery" class="query-form">
      <el-form-item>
        <el-input v-model="listQuery.title" :clearable = "true" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item>
      	<el-cascader :options="categories" :props="cateProps"  v-model="listQuery.categories"></el-cascader>
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
      <el-table-column align="center" width="50" type="selection"></el-table-column>
      <el-table-column align="center"  label="标题" prop="title" show-overflow-tooltip>
			</el-table-column>
      <el-table-column align="center"  label="分类" prop="categories" show-overflow-tooltip>
				<template slot-scope="scope">
        	 {{ scope.row.categories | parseCate(categories)}}
        </template>
			</el-table-column>
  		<el-table-column align="center" label="点赞数" prop="likeNum" width="80"></el-table-column>
      <el-table-column align="center" label="浏览数" prop="clickNum" width="80"></el-table-column>
      
      
      <el-table-column align="center" label="状态" prop="status"  width="80" >
        <template slot-scope="scope">
          <span style="color:red" v-if="scope.row.status == '0'">未发布</span>
          <span style="color:green" v-else-if="scope.row.status == '1'">已发布</span>
        </template>
      </el-table-column>
 
			<el-table-column align="center" label="修改时间" prop="updateDate"  show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.updateDate | parseTime('{y}-{m}-{d} {h}:{i}') }}
        </template>        
      </el-table-column>  
      
			<el-table-column align="center" label="创建时间" prop="created"  show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.created | parseTime('{y}-{m}-{d} {h}:{i}') }}
        </template>        
      </el-table-column>   
      
      
      <el-table-column align="center"  label="操作">
      	<el-button-group slot-scope="scope">
   				<el-button v-show="editNum !== scope.$index" type="primary" size="mini" @click.native.prevent="editWare(scope.row,scope.$index)">编辑</el-button> 
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
        
        
        <el-form-item label="文件" prop="file" label-width="100px" class="query-form-item">
          <SingleUpload 
          :ext="typeName[upLoadData.type]" 
          :type="uploadType[upLoadData.type]" 
          :size="sizeName[upLoadData.type]" 
          :imageUrl="imageUrl" @on-select="onSelect"></SingleUpload>
          <div class="el-upload__tip">只能上传{{typeName[upLoadData.type]}}文件，且不超过{{sizeName[upLoadData.type]}}M</div>
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
      <video v-if="videoType == '4'" ref="videoPlayer" controlsList="nodownload noremoteplayback" disablePictureInPicture οncοntextmenu="return false"  class="video-box" :src="videoUrl" controls></video>
      <video v-if="videoType == '5'" style="height:55px" ref="videoPlayer" controlsList="nodownload noremoteplayback" disablePictureInPicture οncοntextmenu="return false"  class="video-box" :src="videoUrl" controls></video>
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
			categories:[],
			cateProps:{children: 'children', label: 'cateName' ,value:'id'},
			
      list:[],
      total: 0,
      listQuery: {
        title: '',
        page: this.$route.query.page?Number(this.$route.query.page):1,
        pageSize: 10
      },
      upLoadFormVisible:false,
      formLoading:false,
      imageUrl:'',
      upLoadData:{
        resType:'0',
        resName:'',
        resUrl:'',
				resSize:''
      },
      uploadType:['','pdf','image','','video','audio'],
      typeName:['','pdf','jpg/png/gif/jpeg','','mp4','mp3/wma'],
      sizeName:['',100,3,'',20,20],
      upLoadRules:{
        resName: [{ required: true, message: "请输入用户名", trigger: "blur"}],
        resUrl: [{ required: true }]        
      },
      listLoading:false,
      showViewer:false,
      srcList:[],
      videoVisible:false,
      videoUrl:'',
      videoType:'',
      editNum:''
    }
  },
  mounted(){
    this.isNewAdd = false;
    this.timeInterval = null;
    this.selectItme = [];
    this.getList();
		this.getcontentCate();
  },
  methods: {
		async getcontentCate(){
			var res = await request.get(config.contentCate);	
			if(res.code == '20000'){
				this.categories = res.data;	
			}
		},
    onSubmit() {
      this.getList()
    },
    async getList() {
      this.loading = true;
      var res = await request.get(config.content,{ params:this.listQuery } );
      this.loading = false;
      this.list = res.data || [];
      this.total = res.totalNum || 0;
			/***
      if(res.data.length > 0){
        res.data.list[0].status = this.isNewAdd ? '0' : res.data.list[0].status ;
      }      
      if(this.isNewAdd){
        this.isNewAdd = false;
        this.upDateNewLine(0,this.list[0]);     
      }
			***/
    },
		upLoadWare(){
      this.upLoadFormVisible = true;	
		},
		hideForm(){
      this.upLoadFormVisible = !this.upLoadFormVisible;
      this.resetForm();
      return true;
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
		async upLoadFormSubmit(){
      if(this.upLoadData.file == ''){
        this.$message.error('课件上传文件不能为空！');return;
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
    onSelect(data){
			this.upLoadData.resUrl = data.resUrl;
			this.upLoadData.resSize = data.resSize;
			this.imageUrl = data.imgUrl;
    },
    selectUploadType(){
      this.imageUrl = ''; 
    },
    handleSelectionChange(val){
      this.selectItme = val;
    },
    allDelItem(){
      if(this.selectItme.length == 0){return}
      this.$confirm("确认删除所选记录吗?", "提示", {
          type: "warning",
      })
      .then(async () => {
          let _ids = this.selectItme.map((item,index) =>{ return item.id});
          var res = await request.post(config.delManyContent,{ids:_ids});
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
            var res = await request.delete(config.content+'/'+row.id);
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
    upDateNewLine(index, row){
      this.listLoading = true;
      clearInterval(this.timeInterval)
      let timeNum = 0;
      this.timeInterval = setInterval(async ()=>{
        var res = await request.get(config.queryListUrl,{params:{id:row.id}});
        timeNum++;
        if(res.code == '20000' && res.data.status == '2'){
          clearInterval(this.timeInterval)
          this.listLoading = false; 
          this.list[index] = res.data;
        }
        if(timeNum == 8){
          clearInterval(this.timeInterval)
          this.listLoading = false; 
          this.list[index] = res.data;          
        }
      },5000)
    },
    async transWare(index, row){
      this.list[index].status = 0;
      this.listLoading = true;
      var res = await request.get(config.transWareUrl,{params:{id:row.id}});
      if(res.code == '20000'){
        this.upDateNewLine(index,row);
      }else{
        this.$message.error("转化失败，请稍后再试！"); 
      }
    },
    closeViewer(){
      this.showViewer = false;
    },
    watchWare(index, row){
      if(row.type == '4' || row.type == '5'){
        this.videoVisible = true;
        this.videoUrl = row.preview_full_url[0]; 
        this.videoType = row.type;
        this.$nextTick(() => {
          this.$refs['videoPlayer'].play();
        })
      }else{
        this.showViewer = true;
        this.srcList =  [process.env.VUE_APP_BASE_API+row.resUrl];
      }
    },
    closeVideo(){
      this.videoType = '';
      this.videoVisible = false;
      this.videoUrl = '';
    },
    async editWare(row,index){
			this.$router.push({path:'/news/edit',query: {id:row.id}})
			/***
      if(this.editNum === ''){
        this.editNum = index;
      }else{
        this.editNum = '';
				
        //var res = await request.put(config.resources,{id:row.id,file_name:this.list[index].name});
        //var res = await request.put(config.resources+'/'+row.id,{resName:this.list[index].resName})
				//if(res.code == '20000'){
        //  this.$message.success("试卷编辑成功");
        //}
      }
			***/
    }
  },
  filters: {
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
.video-box{ width: 50%;;}
.video-dialog >>> .el-dialog{width: 50%;  background:#F1F3F4; border-radius: 5px;}
.video-dialog >>> .el-dialog__header{ display: none;}
.video-dialog >>> .el-dialog__body{ width: 100%; height: 100%; padding: 0;}
.video-box{width: 100%; height: 100%; z-index: 88; border-radius: 5px; overflow: hidden; vertical-align: middle; outline: none; background:rgba(0, 0, 0, 0);}
.video-close{ font-size: 30px; z-index: 99;  position: absolute; top:-15px; right:-15px; cursor: pointer; background:#fff; border-radius: 30px;}

.img-view >>> .el-icon-circle-close {color: #5F6266; background: #fff; border-radius: 50%;}

</style>