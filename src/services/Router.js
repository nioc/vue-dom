import Vue from 'vue'
import Router from 'vue-router'
import store from '@/services/Store'

// components
import Login from '@/components/Login'
import Objects from '@/components/Objects'
import ObjectDetail from '@/components/ObjectDetail'
import About from '@/components/About'

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
]

// create router
const router = new Router({ routes })

// apply navigation guards
router.beforeEach((to, from, next) => {
  // check authentication
  if (!store.state.isAuthenticated && to.name !== 'login') {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
      replace: true,
    })
    return
  }
  if (store.state.isAuthenticated && to.name === 'login') {
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
  // close hamburger (if existing)
  const burger = document.getElementById('navbar-burger')
  if (burger) {
    burger.classList.remove('is-active')
    document.getElementById('navbar-menu').classList.remove('is-active')
  }
  next()
})

export default router
