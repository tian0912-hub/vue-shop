import Vue from 'vue'
import VueRouter from 'vue-router'

// import Add from '../components/goods/Add'
// import Params from '../components/goods/Params'
// import Order from '../components/order/Order'
// import Echarts from '../components/echarts/Echarts'
// import Rights from '../components/right/Rights'
// import Roles from '../components/right/Roles'
// import List from '../components/goods/List'
// import Cate from '../components/goods/Cate'
// import Home from '../components/Home'
// import Welcome from '../components/Welcome'
// import Users from '../components/users/Users'
// import Login from '../components/Login'

const Order = () => import(/* webpackChunkName:"order_echarts" */ '../components/order/Order')
const Echarts = () => import(/* webpackChunkName:"order_echarts" */ '../components/echarts/Echarts')
const List = () => import(/* webpackChunkName:"list_add" */ '../components/goods/List')
const Add = () => import(/* webpackChunkName:"list_add" */ '../components/goods/Add')
const Cate = () => import(/* webpackChunkName:"cate_params" */ '../components/goods/Cate')
const Params = () => import(/* webpackChunkName:"cate_params" */ '../components/goods/Params')
const Users = () => import(/* webpackChunkName:"users_rights_roles" */ '../components/users/Users')
const Rights = () => import(/* webpackChunkName:"users_rights_roles" */ '../components/right/Rights')
const Roles = () => import(/* webpackChunkName:"users_rights_roles" */ '../components/right/Roles')
const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Login')
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Home')
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Welcome')
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/goods', component: List },
      { path: '/params', component: Params },
      { path: '/categories', component: Cate },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Echarts }

    ]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') { return next() }

  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')

  if (!tokenStr) { return next('/login') }

  next()
})

export default router
