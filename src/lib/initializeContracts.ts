import { APIClient, APIClientOptions } from "@wharfkit/antelope"
import { ContractKit } from "@wharfkit/contract"
import { Contract as BoidContract } from "src/lib/boid-contract-structure"
import { Contract as EosioMsigContract } from "src/lib/eosio-msig-contract-telos-mainnet"
import { useApiStore } from "src/stores/apiStore"
import { watch } from "vue"

class BlockchainManager {
  private clientAPI:APIClient | null = null
  private contractKit:ContractKit | null = null
  private boidContract:BoidContract | null = null
  private eosioMsigContract:EosioMsigContract | null = null
  private apiStore = useApiStore()

  constructor() {
    this.setupReactivity()
    this.initializeApiClient()
  }

  initializeApiClient() {
    try {
      const url = this.apiStore.activeUrl
      const apiClientOptions:APIClientOptions = { url }
      this.clientAPI = new APIClient(apiClientOptions)
      this.contractKit = new ContractKit({ client: this.clientAPI })
      this.initializeContracts()
    } catch (error) {
      console.error("Failed to initialize API client or contracts:", error)
    }
  }

  setupReactivity() {
    watch(() => this.apiStore.activeUrl, (newUrl) => {
      if (newUrl && this.clientAPI) { // Ensure there is a meaningful change
        this.initializeApiClient()
      }
    }, { immediate: true })
  }

  private initializeContracts() {
    if (this.contractKit) {
      this.boidContract = new BoidContract(this.contractKit)
      this.eosioMsigContract = new EosioMsigContract(this.contractKit)
    }
  }

  public getClientAPI():APIClient | null {
    if (!this.clientAPI) {
      console.error("APIClient is not initialized.")
    }
    return this.clientAPI
  }

  get boid() {
    if (!this.boidContract) {
      throw new Error("Boid contract is not initialized")
    }
    return this.boidContract
  }

  get eosioMsig() {
    if (!this.eosioMsigContract) {
      throw new Error("EOSIO Multisig contract is not initialized")
    }
    return this.eosioMsigContract
  }
}

export default BlockchainManager
