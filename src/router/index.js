import Vue from 'vue'
import Router from 'vue-router'
import { getMenu } from '@/api/user'
Vue.use(Router)

/* Layout */
import Layout from '@/layout';
import RouterPage from '@/layout/router';
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
	{ path: '*', redirect: '/404', hidden: true },
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
		redirect: '/index/index',
		component: Layout,
    meta: {
      title: '系统管理',
      icon:'system'
    }, 
		children: [
      {
        path: '/index/index',
        component: () => import('@/views/index/user'),
        meta: {
          title: '网站设置'
        }
      },
			
      {
				path: '/channel',
        redirect: '/channel/index',
				component: RouterPage,
        meta: {
          title: '频道管理'
        },
				children:[
					{
						path: '/channel/index',
						component: () => import('@/views/channel/index'),
						meta: {
							title: '频道管理'
						}
					},
					{
						path: '/channel/setting',
						component: () => import('@/views/channel/setting'),
						meta: {
							title: '频道配置',
							activeMenu:'/channel/index',
						},
						hidden:true
					}															
				]
      }												
		]			
	}
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */

function setRoutersType(list,parentName){
	var asyncRoutesType = [];
	list.forEach(item => {
		var _routObj = {};
		item.roles.push('admin')
		if(item.children && item.children.length > 0){
			if(item.parentId == '0'){
				_routObj.path = '/'+item.menuName;
				_routObj.redirect = _routObj.path+'/'+item.children[0].menuName;
				_routObj.component = Layout;
				_routObj.meta = {
					title: item.menuTitle,
					icon : item.menuName,
					breadcrumb:true,
					roles: item.roles,
				};
				_routObj.hidden = item.hidden;
				_routObj.name = item.id;
				_routObj.children = setRoutersType(item.children,item.menuName);	 				
				asyncRoutesType.push(_routObj);	
			}else{
				_routObj.path = '/'+parentName+'/'+item.menuName;
				_routObj.redirect = _routObj.path+'/'+item.children[0].menuName;
				_routObj.component = RouterPage;
				_routObj.meta = {
					title: item.menuTitle,
					icon : item.menuName,
					roles: item.roles,
					breadcrumb:false			
				};
				_routObj.hidden = item.hidden;
				_routObj.name = item.id;
				_routObj.children = setRoutersType(item.children,parentName+'/'+item.menuName); 
				asyncRoutesType.push(_routObj);				
			}
		}else{
			if(item.parentId == '0'){
				_routObj.path = '/'+item.menuName;
				_routObj.redirect = _routObj.path+'/'+item.menuName;
				_routObj.component = Layout;
				_routObj.meta = {
					icon : item.menuName,
					roles: item.roles,
					breadcrumb:true,	
				};
				_routObj.hidden = item.hidden;
				let _componentUrl = item.menuName+'/'+item.menuName;
				_routObj.children = [{
					path:item.menuName, 
					name:item.id,
					component : () => import(`@/views/${_componentUrl}`),
					meta :{
						 title: item.menuTitle,
						 roles: item.roles,
						 breadcrumb:true,
					}
				}]
				asyncRoutesType.push(_routObj);					
			}else{
				_routObj.path = item.menuName;
				var _componentUrl = parentName+'/'+item.menuName;
				 _componentUrl = _componentUrl.replace(/^\/*/g, '');
					_routObj.component = (resolve) => require([`@/views/${_componentUrl}`], resolve)
					_routObj.meta = {
						title: item.menuTitle,
						roles: item.roles,
						breadcrumb:true,	
						activeMenu: item.hidden ? '/'+parentName+'/index' : '/'+parentName+'/'+item.menuName,
					};
				_routObj.hidden = item.hidden;				
				asyncRoutesType.push(_routObj);
			}
		}
	})
	
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
