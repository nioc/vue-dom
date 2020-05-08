import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

// components
import Login from '@/components/Login'
import Objects from '@/components/Objects'
import ObjectDetail from '@/components/ObjectDetail'
import Scenarios from '@/components/Scenarios'
import Tag from '@/components/Tag'
import About from '@/components/About'
import Notifications from '@/components/Notifications'

Vue.use(Router)

const custom = window.custom

// define routes
const routes = [
  {
    path: '/',
    name: 'home',
    component: Objects,
    meta: {
      title: 'Home',
    },
  },
  {
    path: '/objects',
    name: 'objects',
    component: Objects,
    meta: {
      title: 'Objets',
    },
  },
  {
    path: '/objects/:id',
    name: 'object',
    component: ObjectDetail,
    props: true,
    meta: {
      title: 'Objet',
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
    component: Scenarios,
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
    component: About,
    meta: {
      title: 'A propos',
    },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: Notifications,
    meta: {
      title: 'Notifications',
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
