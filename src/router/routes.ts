import { RouteRecordRaw } from "vue-router"
import { useApiStore } from "src/stores/apiStore"

// Define routes for each main function, and within each, handle the chain-specific paths
const routes:RouteRecordRaw[] = [
  {
    path: "/",
    redirect: () => {
      const apiStore = useApiStore()
      return `/m-sign/${apiStore.activeChain || "telos"}`
    }
  },
  {
    path: "/m-sign/:chain?",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/StartPage.vue"),
        props: true // Enables passing the route params as props
      }
    ]
  },
  {
    path: "/contract/:chain?",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/ContractPage.vue"),
        props: true
      }
    ]
  },
  {
    path: "/accmap/:chain?",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/AccountMapPage.vue"),
        props: true
      }
    ]
  },
  {
    path: "/proposals/:chain",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/ProposalsPage.vue"),
        props: true
      },
      {
        path: ":proposalName?",
        component: () => import("pages/ProposalsPage.vue"),
        props: true
      }
    ]
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue")
  }
]

export default routes
