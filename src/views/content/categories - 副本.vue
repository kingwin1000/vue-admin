<template>
<div class="app-container">
  <header class="app-header">
    <span class="title">{{$route.meta.title}}</span>
    <el-button type="primary" icon="el-icon-edit" @click.native="handleAddFirstCategory()">添加一级分类</el-button>
  </header>
  <div class="course-class">
    <div class="class-main">
        <tree-table ref="TreeTable" :data="data"  row-key="id" default-expand-all :tree-props="{children: 'children'}" border>
          <el-table-column align="center" label="菜单名称" show-overflow-tooltip>
            <template slot-scope="scope">
    					<span  v-show="!scope.row.extend" >{{ scope.row.cateName }}</span>
              <span v-show="scope.row.extend">
                <el-input style="width:80%" v-show="scope.row.extend"  placeholder="请输入中文名称" size="mini" v-model.trim="scope.row.cateName"  auto-complete="off"></el-input>
              </span>           
            </template>
          </el-table-column>          
          

          <el-table-column label="排序" width="180">
            <template slot-scope="scope">
           	 <el-input-number size="mini" :min="0" @change = "() => updateOrder(data)"  v-model="scope.row.orderNo"></el-input-number>
            </template>
          </el-table-column>
        
        
          <el-table-column label="操作" width="280">
                <el-button-group slot-scope="scope">
                  <el-button size="mini" type="primary" @click.native.prevent ="() => append(scope.row)">添加子分类</el-button>
                  <el-button v-show="scope.row.extend" size="mini" type="warning" @click="() => edit(scope.row)">保存</el-button>
                  <el-button v-show="!scope.row.extend" size="mini" type="primary" @click="() => edit(scope.row)">编辑</el-button>
                  <el-button size="mini" type="danger"  @click="() => remove(scope.row,scope)">删除</el-button>
                </el-button-group>          	
          </el-table-column>
        </tree-table>
     
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
      defaultProps: {children: "children", label: "cateName"},
      formLoading:false,
    }
  },
  mounted(){
    this.getList();
  },
  methods: {
    async getList() {
      this.loading = true; 
      let res = await request.get(config.contentCate); 
      this.loading = false;
      if(res.code == '20000'){
        this.data = res.data;
      }
    },
    handleAddFirstCategory() {
			var _orderNo = this.data.length+1;
			var _id = new Date().getTime()+'';
      var obj = {parentId:'0', id:_id, orderNo:_orderNo, hidden:false, cateName:'',pathIds:['0'],extend:true};
      this.data.push(obj)
    },
    append(data) {
			var _orderNo = this.data.length+1;
			var _id = new Date().getTime()+'';
      const newChild = {parentId:data.id, id:_id, orderNo:_orderNo, hidden:false, cateName:'',pathIds:[...data.pathIds,data.id],extend:true};
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    remove(data,index) {
      if(data.id && data.id.length != 13){
        this.$confirm("确认删除当前分类吗?", "提示", {type: "warning",}).then(async () => {
          var res = await request.delete(config.contentCate+'/'+data.id);
          if(res && res.code == '20000'){
            this.$message.success("删除成功");  
            this.getList();	
          }
        });
      }else{
				this.$refs.TreeTable.delete(data)
				console.log(index);
				//if(data.parentId == '0'){
				//	this.data.splice(index-1, 1);
				//}
				//console.log(index);
				
				//console.log(data);
				//console.log(this.data);
      //  const parent = node.parent;
       // const children = parent.data.children || parent.data;
       // var index = data.findIndex(d => d.id === this.data.id);
       // 
      }
    },
    async updateOrder(data){
      var _data = {orderNo:data.orderNo};
      var res = await request.put(config.contentCate+'/'+data.id,_data);
      if(res && res.code == '20000'){
        this.getList();
      }
		},
		goToUp(data){
			console.log(data);
		},
    async edit(data){
      if(data.extend){
        if(data.cateName.length < 3){
          this.$message.error("菜单名称不少于3个字符！"); 	
        }else{
          var _id = data.id;
          if(_id){
            var _obj = {
              cateName:data.cateName,
            }
            await request.put(config.contentCate+'/'+_id,_obj); 	
          }else{
            var res = await request.post(config.contentCate,data);
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