import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import EntityView from './views/EntityView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/entity/:id',
    component: EntityView,
  },
  {
    path: '/entity/lookup/:lookupAttr/:lookupVal',
    component: EntityView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
