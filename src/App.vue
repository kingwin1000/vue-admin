<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style>
.app-container{ background:#fff; min-height:calc(100vh - 70px);} 
.app-header{ padding:0; height:50px;  overflow:hidden; text-align:right;}
.app-header .title{ float:left; font-size:23px; border-left:3px solid #1f2f3d; padding-left:10px; vertical-align:middle}
.query-form{ background:#FAFAFA; border-radius:4px; padding:23px 0 0 20px; margin-bottom:10px}
.el-table th.gutter {display: table-cell !important}
</style>