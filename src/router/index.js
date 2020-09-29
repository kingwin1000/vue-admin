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
    children: [
      {
        path: '/index/index',
        component: () => import('@/views/index/index'),
        meta: {
          title: '个人中心1'
        }
      },
      {
        path: '/index/user',
        component: () => import('@/views/index/user'),
        meta: {
          title: '个人中心'
        }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
/**
function setRoutersType(list){

  for(let i = 0; i<list.length; i++){
    var item = list[i];
    if(item.component == '/layout'){
      item.component = Layout;
    }else{
      item.component =  require(`@/views${item.component}`).default
    }
    if(item.children && item.children.length > 0){
      setRoutersType(item.children)
    }
  }
  console.log(list)
  return list;
}
**/
export async function asyncRoutes() {
  var _menu = await getMenu()
  if (_menu.code = 20000) {
    // var _data = setRoutersType(_menu.data);
    return []
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
