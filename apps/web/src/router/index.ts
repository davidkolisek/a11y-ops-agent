import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import ScanView from '@/views/ScanView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Accessibility Scanner — A11yOps' },
    },
    {
      path: '/scan',
      name: 'scan',
      component: ScanView,
      meta: { title: 'Scan & Report — A11yOps' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'A11yOps'
  document.title = title
})
