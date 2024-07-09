import { route } from "quasar/wrappers"
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from "vue-router"

import routes from "./routes"
import { useApiStore } from "src/stores/apiStore"

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function(/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === "history" ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Navigation guard to set the active chain
  Router.beforeEach((to, from, next) => {
    const apiStore = useApiStore() // Pass the store instance if needed
    // Check if the route has a chain parameter; if not, default to 'Telos'
    const chain = to.params.chain || "telos"
    apiStore.setActiveChain(chain.toString())
    next()
  })

  return Router
})
