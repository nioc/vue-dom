import { createRouter, createWebHashHistory } from 'vue-router'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'

// components
import Login from '@/components/Login.vue'
import Rooms from '@/components/Rooms.vue'
import RoomDetail from '@/components/RoomDetail.vue'
import Tag from '@/components/Tag.vue'
import UserView from '@/components/UserView.vue'

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
    children: [
      {
        path: '',
        name: 'rooms',
        component: Rooms,
        meta: {
          title: 'Pièces',
        },
      },
      {
        path: ':id',
        name: 'room',
        component: RoomDetail,
        props: true,
        meta: {
          title: 'Pièce',
        },
      },
    ],
  },
  {
    path: '/tags',
    children: [
      {
        path: '',
        name: 'tags',
        component: Tag,
        props: true,
        meta: {
          title: 'Tag',
        },
      },
      {
        path: ':tag',
        name: 'tag',
        component: Tag,
        props: true,
        meta: {
          title: 'Tag',
        },
      },
    ],
  },
  {
    path: '/views',
    children: [
      {
        path: '',
        name: 'views',
        component: UserView,
        meta: {
          title: 'Views',
        },
      },
      {
        path: ':code',
        name: 'view',
        props: true,
        component: UserView,
        meta: {
          title: 'View',
        },
      },
    ],
  },
  {
    path: '/scenarios',
    name: 'scenarios',
    component: () => import('@/components/Scenarios.vue'),
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
    component: () => import('@/components/About.vue'),
    meta: {
      title: 'A propos',
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/components/Profile.vue'),
    meta: {
      title: 'Profil',
    },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/components/Notifications.vue'),
    meta: {
      title: 'Notifications',
    },
  },
  {
    path: '/admin',
    children: [
      {
        path: '',
        name: 'admin',
        component: () => import('@/components/admin/Admin.vue'),
        meta: {
          title: 'Admin',
        },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/components/admin/Users.vue'),
        meta: {
          title: 'Admin utilisateurs',
        },
      },
      {
        path: 'users/:id',
        name: 'admin-user',
        props: true,
        component: () => import('@/components/admin/User.vue'),
        meta: {
          title: 'Admin utilisateur',
        },
      },
      {
        path: 'rooms',
        name: 'admin-rooms',
        component: () => import('@/components/admin/Rooms.vue'),
        meta: {
          title: 'Admin pièces',
        },
      },
      {
        path: 'rooms/:id',
        name: 'admin-room',
        props: true,
        component: () => import('@/components/admin/Room.vue'),
        meta: {
          title: 'Admin pièce',
        },
      },
      {
        path: 'equipments',
        name: 'admin-equipments',
        component: () => import('@/components/admin/Equipments.vue'),
        props: (route) => ({ search: route.query.search }),
        meta: {
          title: 'Admin équipements',
        },
      },
      {
        path: 'equipments/:id',
        name: 'admin-equipment',
        props: true,
        component: () => import('@/components/admin/Equipment.vue'),
        meta: {
          title: 'Admin équipement',
        },
      },
      {
        path: 'states',
        name: 'admin-states',
        component: () => import('@/components/admin/States.vue'),
        meta: {
          title: 'Admin états',
        },
      },
      {
        path: 'states/:id',
        name: 'admin-state',
        props: true,
        component: () => import('@/components/admin/State.vue'),
        meta: {
          title: 'Admin état',
        },
      },
      {
        path: 'actions',
        name: 'admin-actions',
        component: () => import('@/components/admin/Actions.vue'),
        meta: {
          title: 'Admin actions',
        },
      },
      {
        path: 'actions/:id',
        name: 'admin-action',
        props: true,
        component: () => import('@/components/admin/Action.vue'),
        meta: {
          title: 'Admin action',
        },
      },
      {
        path: 'system',
        name: 'admin-system',
        component: () => import('@/components/admin/System.vue'),
        meta: {
          title: 'Admin système',
        },
      },
      {
        path: 'scenarios',
        name: 'admin-scenarios',
        props: true,
        component: () => import('@/components/admin/Scenarios.vue'),
        meta: {
          title: 'Admin scénarios',
        },
      },
      {
        path: 'scenarios/:id',
        name: 'admin-scenario',
        props: true,
        component: () => import('@/components/admin/Scenario.vue'),
        meta: {
          title: 'Admin scénario',
        },
      },
      {
        path: 'nlp',
        name: 'admin-nlp',
        props: true,
        component: () => import('@/components/admin/Nlp.vue'),
        meta: {
          title: 'Admin traitement automatique du langage naturel',
        },
      },
      {
        path: 'intents/:id',
        name: 'admin-intent',
        props: true,
        component: () => import('@/components/admin/Intent.vue'),
        meta: {
          title: 'Admin intention',
        },
      },
      {
        path: 'entities/:id',
        name: 'admin-entity',
        props: true,
        component: () => import('@/components/admin/Entity.vue'),
        meta: {
          title: 'Admin entité',
        },
      },
      {
        path: 'channels',
        name: 'admin-channels',
        props: true,
        component: () => import('@/components/admin/Channels.vue'),
        meta: {
          title: 'Admin canaux de communication',
        },
      },
      {
        path: 'channels/:id',
        name: 'admin-channel',
        props: true,
        component: () => import('@/components/admin/Channel.vue'),
        meta: {
          title: 'Admin canal de communication',
        },
      },
      {
        path: 'views',
        name: 'admin-views',
        component: () => import('@/components/admin/UserViews.vue'),
        meta: {
          title: 'Admin vues utilisateur',
        },
      },
      {
        path: 'views/:id',
        name: 'admin-view',
        props: true,
        component: () => import('@/components/admin/UserView.vue'),
        meta: {
          title: 'Admin vue utilisateur',
        },
      },
    ],
  },
]

// create router
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// apply navigation guards
router.beforeEach((to, from, next) => {
  // check authentication
  const appStore = useAppStore()
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated && to.name !== 'login') {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
      replace: true,
    })
    return
  }
  if (authStore.isAuthenticated && to.name === 'login') {
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
  if (appStore.hasSidebarOpened) {
    appStore.setSidebarStatus(false)
  }
  next()
})

export default router
