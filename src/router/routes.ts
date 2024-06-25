import { RouteRecordRaw } from "vue-router"

const routes:RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/StartPage.vue") },
      { path: "contract", component: () => import("pages/ContractPage.vue") },
      { path: "accmap", component: () => import("pages/AccountMapPage.vue") },
      {
        // Base proposals route
        path: "proposals",
        component: () => import("pages/ProposalsPage.vue"),
        children: [
          {
            // Handle optional chain and proposalName as query parameters
            path: ":chain?/:proposalName?",
            component: () => import("pages/ProposalsPage.vue"),
            props: (route) => ({
              chain: route.params.chain,
              proposalName: route.params.proposalName
            })
          }
        ]
      }
    ]
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue")
  }
]

export default routes
