import { defineStore } from "pinia"
import { LocalStorage } from "quasar"
import { sessionLogin, sessionLogout, sessionRestore } from "src/lib/session"
import { PermissionLevel, Session } from "@wharfkit/session"
import { endpoints } from "src/lib/config"

export const useSessionStore = defineStore({
  id: "sessionStore",
  state: () => ({
    session: undefined as Session | undefined,
    multiSignToggleState: true // to be used for toggling the multi sign modal on and off
  }),
  // Getters
  getters: {
    isLoggedIn: (state) => state.session !== undefined,
    username: (state) => state.session?.actor.toString() || "",
    authorization: (state) => PermissionLevel.from(state.session?.permissionLevel as PermissionLevel || { actor: "boid", permission: "active" }),
    sessionState: (state) => state,
    whatChain: (state) => state.session?.chain.name || "",
    chainUrl: (state) => state.session?.chain.url || endpoints[0]?.[1],
    chainLogo: (state) => state.session?.chain.getLogo() || "",
    multiSignState: (state) => state.multiSignToggleState
  },

  // Actions
  actions: {
    // Action to set the boolean property to a specific value for the multi sign modal
    setToggleState(value:boolean) {
      this.multiSignToggleState = value
    },
    async login() {
      const sessionData = await sessionLogin()
      if (sessionData) {
        const serializedSession = sessionData.serialize()
        LocalStorage.set("session", serializedSession)
        console.log("Local Session Chain URL:", sessionData.chain.url)
      }
      this.session = sessionData
    },

    async logout() {
      await sessionLogout()
      LocalStorage.remove("session")
      this.session = undefined
    },

    async renew() {
      const serializedSession = LocalStorage.getItem("session")
      if (serializedSession) {
        this.session = await sessionRestore()
        if (this.session) {
          LocalStorage.set("session", this.session.serialize())
        }
      }
    }
  }
})
