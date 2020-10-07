import Vue from 'vue'
import Router from 'vue-router'
import { getMenu } from '@/api/user'
Vue.use(Router)

/* Layout */
import Layout from '@/layout'
/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    hidden: false,
    redirect: '/index/index',
    component: Layout,
    meta: {
      title: '系统管理',
      icon:'system'
    },    
    children: [
      {
        path: '/index/index',
        component: () => import('@/views/index/index'),
        meta: {
          title: '首页',
          breadcrumb:false,
        },
        hidden:true,
      },
      {
        path: '/index/setting',
        component: () => import('@/views/index/user'),
        meta: {
          title: '网站设置'
        }
      },      
      {
        path: '/channel/index',
        component: () => import('@/views/channel/index'),
        meta: {
          title: '频道管理'
        }
      }
    ]
  },
  {
    path: '/system',
    hidden: false,
    redirect: '/system/role',
    component: Layout,
    meta: {
      title: '系统设置',
      icon:'system'
    },    
    children: [
      {
        path: '/system/role',
        component: () => import('@/views/system/role'),
        meta: {
          title: '角色管理'
        }
      },
      {
        path: '/system/admin',
        component: () => import('@/views/system/admin'),
        meta: {
          title: '账号管理'
        }
      },
      {
        path: '/system/menu',
        component: () => import('@/views/system/menu'),
        meta: {
          title: '菜单管理'
        }
      },      
    ]
  },
  {
    path: '/ad',
    hidden: false,
    redirect: '/ad/index',
    component: Layout,
    meta: {
      title: '资源管理',
      icon:'system'
    },    
    children: [
      {
        path: '/ad/index',
        component: () => import('@/views/ad/index'),
        meta: {
          title: '资源列表'
        }
      }  
    ]
  },

  {
    path: '/news',
    hidden: false,
    redirect: '/news/create',
    component: Layout,
    meta: {
      title: '资讯管理',
      icon:'system'
    },    
    children: [
      {
        path: '/news/create',
        component: () => import('@/views/content/create'),
        meta: {
          title: '添加资讯'
        }
      }, 			
      {
        path: '/content/categories',
        component: () => import('@/views/content/categories'),
        meta: {
          title: '资讯分类树'
        }
      },		

      {
        path: '/news/tags',
        component: () => import('@/views/content/tags'),
        meta: {
          title: '资讯标签'
        }
      }, 
	
      {
        path: '/news/list',
        component: () => import('@/views/content/list'),
        meta: {
          title: '资讯列表'
        }
      },
      {
        path: '/news/edit',
        component: () => import('@/views/content/edit'),
        meta: {
          title: '资讯编辑'
        },
				hidden:true
      },
     
    ]
  },  
  
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */

function setRoutersType(list,parentName){
	console.log('list',list)
	var asyncRoutesType = [];
  /**
     *
  list.forEach(item => {

   		var _routObj = {};
		if(item.children && item.children.length > 0){
			if(item.parentId == '0'){
				_routObj.path = '/'+item.menuTitle;	
				_routObj.redirect = _routObj.path+'/'+item.children[0].menuTitle;
				_routObj.component = Layout;
				_routObj.meta = {
					title: item.menuName,
					icon : item.menuTitle,
					breadcrumb:true,
					roles:['324'],		
				}
				_routObj.hidden = item.hidden;
				_routObj.name = item.id; 
				_routObj.children = setRoutersType(item.children,item.menuTitle);				
				asyncRoutesType.push(_routObj);	
			}else{



			}
		}else{
			if(item.parentId == '0'){
				_routObj.path = '/'+item.menuTitle;
				_routObj.redirect = _routObj.path+'/'+item.menuTitle;
				_routObj.component = Layout;
				_routObj.meta = {
					icon : item.menuTitle,
					roles: item.roles,
					//breadcrumb:item.type == '1' ? true : false,	
					//activeMenu: item.active_path
				};
				_routObj.hidden = item.hidden;
				
				let _componentUrl = item.menuTitle+'/'+item.menuTitle;
				_routObj.children = [{
					path:item.menuTitle, 
					name:item.id,
					component : () => import(`@/views/${_componentUrl}`),	
					meta :{
						 title: item.menuName,
						 roles: ['324'],
						 breadcrumb:item.type == '1' ? true : false,
						 //activeMenu: item.active_path		
					}
				}]
				asyncRoutesType.push(_routObj);					
			}else{

				_routObj.path = item.menuTitle;
				var _componentUrl = parentName+'/'+item.menuTitle;
				_routObj.component =  require(`@/views/${_componentUrl}`).default;
				_routObj.meta = {
					title: item.menuName,
					roles:['324'],
					breadcrumb:false,	
					activeMenu: parentName+'/'
				};
				_routObj.hidden = item.hidden;
				asyncRoutesType.push(_routObj);
			}
		}
	})
	** */

	return asyncRoutesType;	
}


export async function asyncRoutes() {
  var _menu = await getMenu()
  if (_menu.code = 20000) {
   var _data = setRoutersType(_menu.data);
    return _data;
  } else {
    return []
  }
}

/**
export const asyncRoutes = [
  { path: '*', redirect: '/404', hidden: true }
];
 */
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
