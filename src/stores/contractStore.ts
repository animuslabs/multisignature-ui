import { defineStore } from "pinia"
import { getContractDetails } from "src/lib/contracts"
import { NameType } from "@wharfkit/antelope"
import BlockchainManager from "src/lib/initializeContracts"
import { Contract as BoidContract } from "src/lib/boid-contract-structure"
import { Contract as EosioMsigContract } from "src/lib/eosio-msig-contract-telos-mainnet"

const blockchainManager = new BlockchainManager()

interface ActionDetails {
  blockchainManager:BlockchainManager;
  targetContract:string;
  actionNames:NameType[];
  actionStructures:any[];
}

export const useContractStore = defineStore("useContractStore", {
  state: ():ActionDetails => ({
    blockchainManager: new BlockchainManager(),
    targetContract: "",
    actionNames: [],
    actionStructures: []
  }),
  getters: {
    boidContract():BoidContract | unknown {
      return this.blockchainManager.boid
    },
    eosioMsigContract():EosioMsigContract | unknown {
      return this.blockchainManager.eosioMsig
    },
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
      blockchainManager.initializeApiClient()
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
        this.targetContract = contractName
        const { actionNames, actionStructures } = await getContractDetails(contractName)
        this.setActionDetails(actionNames, actionStructures)
      } catch (error) {
        console.error("Error in getContractDetails:", error)
        this.targetContract = ""
        throw error // Re-throw the error to handle it in the component
      }
    }
  }
})
