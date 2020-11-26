<template>
<div class="app-container">
  <header class="app-header">
    <span class="title">{{$route.meta.title}}</span>
    <el-button type="primary" icon="el-icon-edit" @click.native="handleAddFirstCategory()">添加标签</el-button>
  </header>
  <div class="course-class">
    <div class="class-main">
      <div class="classify">
        <div class="tree-top">
          <span class="tree-title" style="padding-left:40px;">标签名称</span>
            <span class="tree-order">排序</span>
            <span class="tree-btns">操作</span>
        </div> 
        <el-tree :data="data" node-key="id" v-loading="loading" default-expand-all :expand-on-click-node="false" :props="defaultProps">
          <div class="tree-li" slot-scope="{ node, data }">
              <span v-show="!data.extend" class="tree-title">{{ data.tagName }}</span>
              <span v-show="data.extend" class="tree-title">
                <el-input style=" width:80%" v-show="data.extend"  placeholder="请输入中文名称" size="mini" v-model.trim="data.tagName"  auto-complete="off"></el-input>
              </span>
              <span class="tree-order">
                <el-input-number size="mini" :min="0" @change = "() => updateOrder(data)"  v-model="data.orderNo"></el-input-number>
              </span>
              <span class="tree-btns">  
              <el-button-group>
                <el-button v-if="data.extend" size="mini" type="warning" @click="() => edit(data)">保存</el-button>
                <el-button v-else size="mini" type="primary" @click="() => edit(data)">编辑</el-button>
                
                <el-button size="mini" type="danger"  @click="() => remove(data,node)">删除</el-button>
              </el-button-group>
              </span>
          </div>
        </el-tree>
      </div>      
    </div>
  </div>
</div>
</template>
<script>
import config from '@/api/bgapi'
import request from '@/utils/request'
export default {
  data() {
    return {
      loading: false,
      data:[],
      defaultProps: {children: "children", label: "tagName"},
      formLoading:false
    }
  },
  mounted(){
    this.getList();
  },
  methods: {
    async getList() {
      this.loading = true; 
      let res = await request.get(config.contentTags); 
      this.loading = false;
      if(res.code == '20000'){
        this.data = res.data;
      }
    },
    handleAddFirstCategory() {
      var obj = {orderNo:0, hidden:false, tagName:'',extend:true};
      this.data.push(obj)
    },
    append(data) {
      const newChild = {orderNo:0, hidden:false, tagName:'',extend:true};
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    remove(data,node) {
      if(data.id){
        this.$confirm("确认删除当前分类吗?", "提示", {type: "warning",}).then(async () => {
          var res = await request.delete(config.contentTags+'/'+data.id);
          if(res && res.code == '20000'){
            this.$message.success("删除成功");  
            this.getList();	
          }
        });
      }else{
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      }
    },
    async updateOrder(data){
      var _data = {orderNo:data.orderNo};
      var res = await request.put(config.contentTags+'/'+data.id,_data);
      if(res && res.code == '20000'){
        this.getList();
      }
		},
    async edit(data){
			console.log(data.extend);
      if(data.extend){
        if(data.tagName.length < 3){
          this.$message.error("菜单名称不少于3个字符！"); 	
        }else{
          var _id = data.id;
          if(_id){
            var _obj = {
              tagName:data.tagName,
            }
            await request.put(config.contentTags+'/'+_id,_obj); 	
          }else{
            await request.post(config.contentTags,data);	
          }
          data.extend = !data.extend;
        }
      }else{
        data.extend = !data.extend;
      }
    }
  }
}
</script>
<style  scoped>
.classify{border:1px solid #e1e1e1; border-bottom:0; min-width:800px;}
.classify >>> .el-tree-node__content{height: 40px; border-bottom: 1px solid #e1e1e1;line-height: 40px;}
.classify >>> .el-tree-node__expand-icon{ padding:0 15px;}
.classify >>> .el-tree__empty-block{ border-bottom: 1px solid #e1e1e1;}
.tree-li{flex: 1; display: flex; align-items: center; font-size:14px; justify-content: space-between;}
.tree-title{flex:1; border-right:1px solid #e1e1e1;}
.tree-name{width:200px; border-right:1px solid #e1e1e1; text-align:center;}
.tree-order{width:200px; border-right:1px solid #e1e1e1; text-align:center;}
.tree-btns{ width:250px; text-align:center;}
.tree-top{height: 42px; display:flex; font-size:14px; font-weight:bold; border-bottom: 1px solid #e1e1e1;line-height: 42px; background:#F5F7FA}
</style>