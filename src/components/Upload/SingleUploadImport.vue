<template>

<el-upload
  ref="upload"
  class="avatar-uploader"
  :action="actionUploadUrl"
  :auto-upload = "false"
  :style="{background:color,borderColor:color}"
  drag
  name="file_info"
  :headers="headerDate"
  :show-file-list="false"
  :on-success="handleAvatarSuccess"
  :on-progress = "handleAvatarProgress"
  :before-upload="beforeAvatarUpload"
  :on-change="handleChange"
  >
  <img v-show="imageUrl" :src="imageUrl"  class="avatar">
  <i v-show="!imageUrl" class="el-icon-plus avatar-uploader-icon"></i>
  <el-progress  v-show="upLoading" :width="100" :height="100"  style=" padding:10px; top:0; background: #fff; left:0;  position: absolute;" type="circle" :percentage="loadNumber"></el-progress>
</el-upload>
<!--
<el-button type="primary" icon="el-icon-upload2" @click="upLoadData">上传</el-button> 

</div>
-->
</template>

<script>
import uploadImg from '@/assets/images/xlsx.png'
export default {
    props: {
        color: {
          type: String,
          default: "#FAFAFA"
        },			
        ext: {
          type: String
        },
        size: {
          default:2,
          type: Number
        },
        imageUrl:{
          default:'',
          type:String
        },
        actionUrl:{
          default:'',
          type:String
        },
        keyNum:{
          default:'',
          type:String         
        }
    },
    data() {
        return {
          uploadHttp:process.env.VUE_APP_BASE_UPLOAD_API,
          actionUploadUrl:process.env.VUE_APP_BASE_API+this.actionUrl,
          upLoading:false,
          isPicTyep:false,
          loadNumber:0,
					headerDate:{
						'SCHOOL-KEY':this.$store.getters.schoolKey,
					}
        };
    },
    mounted(){
      //console.log(this.actionUrl)
    },    
    methods: {		
      handleAvatarSuccess(res, file) {
        if(res.code == '20000'){
          var _imageUrl = uploadImg;
          this.loadNumber == 100;
          this.upLoading = false;
          this.$emit("on-select",res.data,_imageUrl,this.keyNum);  
        }else{
          this.$message.error("网络出现错误，请稍后再试");
        }                              
      },
      beforeAvatarUpload(file) {
        if(file.type.indexOf('image/') > -1){
          this.isPicTyep = true;
        }else{
          this.isPicTyep = false;
        }
        const name = file.name ? file.name : "";
        let ext = name ? name.substr(name.lastIndexOf(".") + 1, name.length): true; 
        ext = ext.toLowerCase();
        let isExt = true;
        if (this.ext) {
            isExt = this.ext.indexOf(ext) >= 0;
            if (!isExt) {
                this.$message.error("文件只能为 " + this.ext + " 格式!");
                return false;
            }
        } 
        const isLtSize = file.size / 1024 / 1024 < this.size;
        if (!isLtSize) {
          this.$message.error('上传文件大小不能超过 '+this.size+'MB!');
          return false;
        }
        return isExt && isLtSize; 
      },
      handleAvatarProgress(event, file, fileList){
        this.upLoading = true;
        this.loadNumber = parseInt(event.percent/1.2);
        //if(this.loadNumber == 100){
        //  this.upLoading = false;
        //}
      }, 
      handleChange(file){
        const name = file.name ? file.name : "";
        let ext = name ? name.substr(name.lastIndexOf(".") + 1, name.length): true; 
        ext = ext.toLowerCase();
        let isExt = true;
        if (this.ext) {
            isExt = this.ext.indexOf(ext) >= 0;
            if (!isExt) {
                this.$message.error("文件只能为 " + this.ext + " 格式!");
                return false;
            }
        } 
        const isLtSize = file.size / 1024 / 1024 < this.size;
        if (!isLtSize) {
          this.$message.error('上传文件大小不能超过 '+this.size+'MB!');
          return false;
        }
        this.$emit("on-select",'',uploadImg); 
      },
      upLoadData(){
        this.$refs.upload.submit();
      }       			
    }    
};
</script>
<style>
.avatar-uploader{width:120px; height:120px; text-align: center;}
.avatar-uploader .el-upload { border: 1px dashed #DCDFE6;border-radius: 6px;cursor: pointer;position: relative;overflow: hidden;width:100%; height:100%;}
.avatar-uploader .el-upload:hover {border-color: #409EFF;}
.avatar-uploader-icon {font-size: 28px;color: #8c939d;text-align: center;width:100%; height:100%;display:flex;justify-content:center; align-items:center;}
.avatar {max-width:100%;}
.avatar-uploader .el-upload-dragger{ width:118px; height:118px; border:none;border-radius: 6px; display:flex;justify-content:center; align-items:center;}
</style>
