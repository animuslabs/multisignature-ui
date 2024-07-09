import { defineStore } from "pinia"
import { LocalStorage } from "quasar"
import { sessionLogin, sessionLogout, sessionRestore } from "src/lib/session"
import { PermissionLevel, Session } from "@wharfkit/session"

export const useSessionStore = defineStore({
  id: "sessionStore",
  state: () => ({
    sessions: {} as { [chainName:string]:Session | undefined },
    multiSignToggleState: true
  }),
  getters: {
    getSession: (state) => (chainName:string) => state.sessions[chainName],
    isLoggedIn: (state) => (chainName:string) => state.sessions[chainName] !== undefined,
    username: (state) => (chainName:string) => state.sessions[chainName]?.actor.toString() || "",
    authorization: (state) => (chainName:string) => PermissionLevel.from(state.sessions[chainName]?.permissionLevel as PermissionLevel || { actor: "boid", permission: "active" }),
    multiSignState: (state) => state.multiSignToggleState
  },
  actions: {
    // Action to set the boolean property to a specific value for the multi sign modal
    setToggleState(value:boolean) {
      this.multiSignToggleState = value
    },
    async login(chainName:string) {
      const sessionData = await sessionLogin(chainName)
      if (sessionData) {
        this.sessions[chainName] = sessionData
        LocalStorage.set("session_" + chainName, sessionData.serialize())
      }
    },
    async logout(chainName:string) {
      await sessionLogout(chainName)
      LocalStorage.remove("session_" + chainName)
      this.sessions[chainName] = undefined
    },
    async renew(chainName:string) {
      try {
        const serializedSession = LocalStorage.getItem("session_" + chainName)
        if (serializedSession) {
          this.sessions[chainName] = await sessionRestore(chainName)
          if (this.sessions[chainName]) {
            LocalStorage.set("session_" + chainName, this.sessions[chainName].serialize())
          }
        } else {
          console.warn(`No session found in local storage for chain: ${chainName}`)
        }
      } catch (error) {
        console.error(`Failed to renew session for chain: ${chainName}`, error)
        throw new Error(`Failed to renew session for chain: ${chainName}`)
      }
    }
  }
})
