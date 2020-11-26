<template>
<div class="app-container">
  <header class="app-header">
    <span class="title">{{$route.meta.title}}</span>
    <el-button type="primary" icon="el-icon-edit" @click.native="handleAddFirstCategory()">添加一级分类</el-button>
  </header>
  <div class="course-class">
    <div class="class-main">
      <div class="classify">
        <div class="tree-top">
          <span class="tree-title" style="padding-left:40px;">菜单名称</span>
          <span class="tree-name">菜单文件名称</span>
          <span class="tree-order">是否显示</span>
          <span class="tree-order">排序</span>
          <span class="tree-btns">操作</span>
        </div> 
        <el-tree :data="data" node-key="id" v-loading="loading" default-expand-all :expand-on-click-node="false" :props="defaultProps">
          <div class="tree-li" slot-scope="{ node, data }">
              <span v-show="!data.extend" class="tree-title">{{ data.menuTitle }}</span>

              <span v-show="data.extend" class="tree-title">
                <el-input style=" width:80%" v-show="data.extend"  placeholder="请输入中文名称" size="mini" v-model.trim="data.menuTitle"  auto-complete="off"></el-input>
              </span>
              <span v-show="!data.extend" class="tree-name">{{ data.menuName }}</span>
              <span v-show="data.extend" class="tree-name">
                <el-input style=" width:80%" size="mini" v-model.trim="data.menuName" placeholder="请输入英文名称" auto-complete="off"></el-input>
              </span>
              <span class="tree-order">
              	<el-switch v-model="data.hidden" active-color="#ccc" inactive-color="#13ce66" @change="changeHidden(data)"></el-switch>
              </span>
              <span class="tree-order">
                <el-input-number size="mini" :min="0" @change = "() => updateOrder(data)"  v-model="data.orderNo"></el-input-number>
              </span>
              <span class="tree-btns">  
              <el-button-group>
                <el-button size="mini" type="primary" @click.native.prevent ="() => append(data)">添加子分类</el-button>
                <el-button v-show="data.extend" size="mini" type="warning" @click="() => edit(data)">保存</el-button>
                <el-button v-show="!data.extend" size="mini" type="primary" @click="() => edit(data)">编辑</el-button>
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
      defaultProps: {children: "children", label: "menuTitle"},
      formLoading:false
    }
  },
  mounted(){
    this.getList();
  },
  methods: {
		async changeHidden(_data){
			var res = await request.put(config.menu+'/'+_data.id,_data);
		},
    async getList() {
      this.loading = true; 
      let res = await request.get(config.menu); 
      this.loading = false;
      if(res.code == '20000'){
        this.data = res.data;
      }
    },
    handleAddFirstCategory() {
      var obj = {parentId:'0', orderNo:0, hidden:false, menuName:'',menuTitle:'',pathIds:['0'],extend:true};
      this.data.push(obj)
    },
    append(data) {
      const newChild = {parentId:data.id, orderNo:0, hidden:false, menuName:'',menuTitle:'',pathIds:[...data.pathIds,data.id],extend:true};
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    remove(data,node) {
      if(data.id){
        this.$confirm("确认删除当前分类吗?", "提示", {type: "warning",}).then(async () => {
          var res = await request.delete(config.menu+'/'+data.id);
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
      var res = await request.put(config.menu+'/'+data.id,_data);
      if(res && res.code == '20000'){
        this.getList();
      }
		},
    async edit(data){
      if(data.extend){
        if(data.menuTitle.length < 3 || data.menuName.length < 3){
          this.$message.error("菜单名称不少于3个字符！"); 	
        }else{
          var _id = data.id;
          if(_id){
            var _obj = {
              menuName:data.menuName,
              menuTitle:data.menuTitle,					
            }
            await request.put(config.menu+'/'+_id,_obj); 	
          }else{
            await request.post(config.menu,data);	
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