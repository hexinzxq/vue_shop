import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import GoodsList from '../components/goods/GoodsList.vue'
import ClassifyParams from '../components/goods/ClassifyParams.vue'
import Order from '../components/order/Orders.vue'
import Reports from '../components/reports/Reports.vue'

Vue.use(VueRouter)

const routes = [
  {
    path:'/login',
    component:Login
  },
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/home',
    component:Home,
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        component:Welcome
      },
      {
        path:'/users',
        component:Users
      },
      {
        path:'/rights',
        component:Rights
      },
      {
        path:'/roles',
        component:Roles
      },
      {
        path:'/categories',
        component:Cate
      },
      {
        path:'/goods',
        component:GoodsList
      },
      {
        path:'/params',
        component:ClassifyParams
      },
      {
        path:'/orders',
        component:Order
      },
      {
        path:'/reports',
        component:Reports
      }
    ]
  }
]

const router = new VueRouter({
  routes,
})


// 挂载路由导航守卫(用作访问权限)
router.beforeEach((to ,from, next) =>{
  // to 将要访问的路径
  // from 代表从那个路径跳转1而来
  // next 是一个函数，表示放行
  //    ------next() 放行   next('/login')  强制跳转

  if(to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login');
  next();
})

export default router
