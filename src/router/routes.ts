import { RouteRecordRaw } from "vue-router"

const routes:RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/StartPage.vue") },
      { path: "contract", component: () => import("pages/ContractPage.vue") },
      { path: "accmap", component: () => import("pages/AccountMapPage.vue") },
      { path: "proposals", component: () => import("pages/ProposalsPage.vue") }
    ]
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue")
  }
]

export default routes
