<template>
<el-upload
  class="avatar-uploader"
  :action="actionUrl"
  :style="{background:color,borderColor:color}"
  drag
  name="file_info"
  :headers="headerDate"
  :show-file-list="false"
  :on-success="handleAvatarSuccess"
  :on-progress = "handleAvatarProgress"
  :before-upload="beforeAvatarUpload">
  <img v-show="imageUrl" :src="imageUrl | filterImage"  class="avatar">
  <i v-show="!imageUrl" class="el-icon-plus avatar-uploader-icon"></i>
  <el-progress  v-show="upLoading" :width="100" :height="100"  style=" padding:10px; top:0; background: #fff; left:0;  position: absolute;" type="circle" :percentage="loadNumber"></el-progress>
</el-upload>
</template>

<script>
import uploadImg from '@/assets/images/upload.png'
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
        keyNum:{
          default:'',
          type:String         
        },
        type:{
          default:'image',
          type:String         
        }        
    },
    data() {
        return {
          uploadHttp:process.env.VUE_APP_BASE_API,
          actionUrl:process.env.VUE_APP_BASE_API+'/api/upload',
          upLoading:false,
          isPicTyep:false,
          loadNumber:0,
					headerDate:{
            'X-Token':this.$store.getters.token,
					}
        };
    },
    mounted(){
			this.resSize = 0;
    },    
    methods: {		
      handleAvatarSuccess(res, file) {
        if(res.code == '20000'){
          this.upLoading = false;
          if(this.type == 'image'){
            var _imageUrl = process.env.VUE_APP_BASE_API + res.data;
          }else{
            var _imageUrl = this.uploadImg;
          }
					var _data = {
						imgUrl:_imageUrl,
						resUrl:res.data,
						resSize:this.resSize
					};
          this.$emit("on-select",_data);  
        }else{
          this.$message.error("网络出现错误，请稍后再试");
        }                              
      },
      beforeAvatarUpload(file) {
        if(this.type != 'image'){
          this.uploadImg = require('@/assets/images/'+this.type+'.png');
        }else{
          this.uploadImg = '';
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
				this.resSize = (file.size / 1024 ).toFixed(2) + 'KB';
        if (!isLtSize) {
          this.$message.error('上传文件大小不能超过 '+this.size+'MB!');
          return false;
        }
        return isExt && isLtSize; 
      },
      handleAvatarProgress(event, file, fileList){
        this.upLoading = true;
        this.loadNumber = parseInt(event.percent);
      },        			
    },  
    computed: {},
    watch: {},
		filters: {
			filterImage(value) {
        if(value.indexOf('nem/') == '0'){
          return process.env.VUE_APP_BASE_UPLOAD_API + value;
        }else{
          return value;
        }
			}
		},	       
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
