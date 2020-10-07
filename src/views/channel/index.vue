<template>
  <div class="app-container">
     <!-- 标题 -->
   	<header class="app-header">
    	<span class="title">{{$route.meta.title}}</span>
      <el-button type="primary" icon="el-icon-edit" @click.native="allDelItem">添加频道</el-button>
    </header> 

    <!-- 表单 -->
		<div class="query-form" style="padding:0 15px;">
    	<div class="tree">
      	
      </div>
    </div>
  </div>
</template>
<script>
import request from '@/utils/request'
import config from '@/api/bgapi'


export default {
  data() {
    return {}
  },
  mounted(){

  },
  methods: {},
  filters: {},  
}
</script>
<style scoped>

</style>