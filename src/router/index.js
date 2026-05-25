import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/select-class',
    name: 'SelectClass',
    component: () => import('../views/SelectClassPage.vue')
  },
  {
    path: '/village',
    name: 'Village',
    component: () => import('../views/VillagePage.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsPage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const currentUser = localStorage.getItem('frozen_current_user')

  if (!currentUser && to.path !== '/') {
    next('/')
  } else {
    next()
  }
})

export default router
