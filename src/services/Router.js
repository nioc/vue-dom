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
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "Profile" */ '@/components/Profile'),
    meta: {
      title: 'Profil',
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
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Users'),
    meta: {
      title: 'Admin utilisateurs',
    },
  },
  {
    path: '/admin/users/:id',
    name: 'admin-user',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/User'),
    meta: {
      title: 'Admin utilisateur',
    },
  },
  {
    path: '/admin/rooms',
    name: 'admin-rooms',
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Rooms'),
    meta: {
      title: 'Admin pièces',
    },
  },
  {
    path: '/admin/rooms/:id',
    name: 'admin-room',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Room'),
    meta: {
      title: 'Admin pièce',
    },
  },
  {
    path: '/admin/equipments',
    name: 'admin-equipments',
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Equipments'),
    props: (route) => ({ search: route.query.search }),
    meta: {
      title: 'Admin équipements',
    },
  },
  {
    path: '/admin/equipments/:id',
    name: 'admin-equipment',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Equipment'),
    meta: {
      title: 'Admin équipement',
    },
  },
  {
    path: '/admin/states',
    name: 'admin-states',
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/States'),
    meta: {
      title: 'Admin états',
    },
  },
  {
    path: '/admin/states/:id',
    name: 'admin-state',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/State'),
    meta: {
      title: 'Admin état',
    },
  },
  {
    path: '/admin/actions',
    name: 'admin-actions',
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Actions'),
    meta: {
      title: 'Admin actions',
    },
  },
  {
    path: '/admin/actions/:id',
    name: 'admin-action',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Action'),
    meta: {
      title: 'Admin action',
    },
  },
  {
    path: '/admin/system',
    name: 'admin-system',
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/System'),
    meta: {
      title: 'Admin système',
    },
  },
  {
    path: '/admin/scenarios',
    name: 'admin-scenarios',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Scenarios'),
    meta: {
      title: 'Admin scénarios',
    },
  },
  {
    path: '/admin/scenarios/:id',
    name: 'admin-scenario',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Scenario'),
    meta: {
      title: 'Admin scénario',
    },
  },
  {
    path: '/admin/nlp',
    name: 'admin-nlp',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Nlp'),
    meta: {
      title: 'Admin traitement automatique du langage naturel',
    },
  },
  {
    path: '/admin/intents/:id',
    name: 'admin-intent',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Intent'),
    meta: {
      title: 'Admin intention',
    },
  },
  {
    path: '/admin/entities/:id',
    name: 'admin-entity',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Entity'),
    meta: {
      title: 'Admin entité',
    },
  },
  {
    path: '/admin/channels',
    name: 'admin-channels',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Channels'),
    meta: {
      title: 'Admin canaux de communication',
    },
  },
  {
    path: '/admin/channels/:id',
    name: 'admin-channel',
    props: true,
    component: () => import(/* webpackChunkName: "Admin" */ '@/components/admin/Channel'),
    meta: {
      title: 'Admin canal de communication',
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
    for (const property in params) {
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
