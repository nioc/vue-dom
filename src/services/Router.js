import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

// components
import Login from '@/components/Login'
import Rooms from '@/components/Rooms'
import RoomDetail from '@/components/RoomDetail'
import Tag from '@/components/Tag'

Vue.use(Router)

const custom = window.custom

// define routes
const routes = [
  {
    path: '/',
    name: 'home',
    component: Rooms,
    meta: {
      title: 'Home',
    },
  },
  {
    path: '/rooms',
    name: 'rooms',
    component: Rooms,
    meta: {
      title: 'Pièces',
    },
  },
  {
    path: '/rooms/:id',
    name: 'room',
    component: RoomDetail,
    props: true,
    meta: {
      title: 'Pièce',
    },
  },
  {
    path: '/tags',
    name: 'tags',
    component: Tag,
    props: true,
    meta: {
      title: 'Tag',
    },
  },
  {
    path: '/tags/:tag',
    name: 'tag',
    component: Tag,
    props: true,
    meta: {
      title: 'Tag',
    },
  },
  {
    path: '/scenarios',
    name: 'scenarios',
    component: () => import(/* webpackChunkName: "Scenarios" */ '@/components/Scenarios'),
    meta: {
      title: 'Scénarios',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Login',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "About" */ '@/components/About'),
    meta: {
      title: 'A propos',
    },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import(/* webpackChunkName: "Notifications" */ '@/components/Notifications'),
    meta: {
      title: 'Notifications',
    },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Admin'),
    meta: {
      title: 'Admin',
    },
  },
]

// create router
const router = new Router({ routes })

// apply navigation guards
router.beforeEach((to, from, next) => {
  // check authentication
  if (!store.state.app.isAuthenticated && to.name !== 'login') {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
      replace: true,
    })
    return
  }
  if (store.state.app.isAuthenticated && to.name === 'login') {
    next({
      name: 'home',
      replace: true,
    })
    return
  }
  // change title attribute
  if (to.meta.title) {
    let title = to.meta.title
    const params = to.params
    for (var property in params) {
      title = title.replace(':' + property, params[property])
    }
    document.title = title + ' | ' + custom.title
  }
  // close sidebar
  if (store.state.app.hasSidebarOpened) {
    store.commit('app/setSidebarStatus', false)
  }
  next()
})

export default router
