import { defineStore } from "pinia"
import { getContractDetails } from "src/lib/contracts"
import { APIClient, APIClientOptions, Name, NameType } from "@wharfkit/antelope"
import { useSessionStore } from "src/stores/sessionStore"

interface ActionDetails {
  actionNames:NameType[];
  actionStructures:any[]; // Replace 'any' with a more specific type if possible
  clientAPI:APIClient | null;
}

export const useContractStore = defineStore("useContractStore", {
  state: ():ActionDetails => ({
    actionNames: [],
    actionStructures: [],
    clientAPI: null as APIClient | null
  }),
  getters: {
    // Getter to get action names as string array
    actionNamesAsStringArray: (state) => {
      return state.actionNames.map(name => name.toString())
    },
    // Getter to get the structure for a specific action
    getActionStructure: (state) => {
      return (actionName:NameType) => {
        const index = state.actionNames.findIndex(name => name === actionName)
        return index !== -1 ? state.actionStructures[index] : undefined
      }
    }
  },
  actions: {
    initializeApiClient() {
      const sessionStore = useSessionStore()
      const url = sessionStore.chainUrl

      const apiClientOptions:APIClientOptions = { url }
      this.clientAPI = new APIClient(apiClientOptions)
    },

    updateApiClient() {
      // Call this method when the session data changes
      this.initializeApiClient()
    },
    setActionDetails(actionNames:NameType[], actionStructures:any[]) {
      this.actionNames = actionNames
      this.actionStructures = actionStructures
    },
    async getContractDetails(contractName:string) {
      try {
        const { actionNames, actionStructures } = await getContractDetails(contractName)
        this.setActionDetails(actionNames, actionStructures)
      } catch (error) {
        console.error("Error in getContractDetails:", error)
        throw error // Re-throw the error to handle it in the component
      }
    }
  }
})
