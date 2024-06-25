import { defineStore } from "pinia"
import { chainEndpoints, hyperionEndpoints } from "src/lib/config"
import { APIClient } from "@wharfkit/antelope"


type ApiResponse = {
  chain:string;
  node_name:string;
  url:string;
  chain_id?:string;
  server_version_string?:string;
  head_block_time?:string;
  duration:number;
  success:boolean;
  error?:string;
};

type ApiResponses = Record<string, ApiResponse>;


export const useApiStore = defineStore("apiStore", {
  state: () => ({
    responses: {} as ApiResponses,
    chainUrls: {
      telos: chainEndpoints[1]?.endpoints[0]?.url || "",
      eos: chainEndpoints[0]?.endpoints[0]?.url || "",
      telostestnet: chainEndpoints[2]?.endpoints[0]?.url || "",
      wax: chainEndpoints[3]?.endpoints[0]?.url || ""
    } as Record<string, string>,
    hyperionUrls: {
      telos: hyperionEndpoints[0]?.endpoints[0]?.url || "",
      eos: hyperionEndpoints[1]?.endpoints[0]?.url || "",
      telostestnet: hyperionEndpoints[2]?.endpoints[0]?.url || "",
      wax: hyperionEndpoints[3]?.endpoints[0]?.url || ""
    } as Record<string, string>,
    clientAPI: new APIClient({ url: chainEndpoints[1]?.endpoints[0]?.url || "" }),
    activeChain: "Telos",
    activeUrl: chainEndpoints[1]?.endpoints[0]?.url || "",
    activeHyperionUrl: hyperionEndpoints[0]?.endpoints[0]?.url || ""
  }),
  getters: {
    getResponsesByChain: (state) => {
      return (chainName:string) => {
        // Initialize an empty object to hold the filtered responses
        const filteredResponses:ApiResponses = {}

        // Find the chain object by the specified name to get its endpoints
        const chain = chainEndpoints.find(c => c.chain === chainName)

        if (!chain) {
          console.error("No such chain found:", chainName)
          return {} // or return undefined, depending on how you want to handle this case
        }

        // Create a set of URLs for quick lookup
        const endpointUrls = new Set(chain.endpoints.map(endpoint => endpoint.url))

        // Filter responses where the endpoint URL is in the set of chain endpoint URLs
        Object.entries(state.responses).forEach(([endpoint, data]) => {
          if (endpointUrls.has(endpoint)) {
            filteredResponses[endpoint] = data
          }
        })
        console.log(`Filtered responses for ${chainName}:`, filteredResponses)
        return filteredResponses
      }
    },
    getUrlForChain: (state) => {
      return (chainName:string) => {
        const url = state.chainUrls[chainName] || ""
        console.log(`URL for ${chainName}:`, url)
        return url
      }
    },
    getHyperionUrlForChain: (state) => {
      return (chainName:string) => {
        const url = state.hyperionUrls[chainName] || ""
        console.log(`Hyperion URL for ${chainName}:`, url)
        return url
      }
    }
  },
  actions: {
    updateChainUrl(chainName:string, newUrl:string) {
      // Update the URL for the given chain
      if (Object.keys(this.chainUrls).includes(chainName)) {
        this.chainUrls[chainName] = newUrl
        console.log(`Updated URL for ${chainName} to: ${newUrl}`)
      } else {
        console.error(`Chain name ${chainName} is not valid`)
      }
    },
    updateHyperionUrl(chainName:string, newUrl:string) {
      // Update the URL for the given chain
      if (Object.keys(this.hyperionUrls).includes(chainName)) {
        this.hyperionUrls[chainName] = newUrl
        console.log(`Updated Hyperion URL for ${chainName} to: ${newUrl}`)
      } else {
        console.error(`Chain name ${chainName} is not valid`)
      }
    },
    setResponse(endpoint:string, data:ApiResponse) {
      this.responses[endpoint] = data
    },
    setActiveChain(chainName:string) {
      const newUrl = this.chainUrls[chainName] // Access URL directly
      const newHyperionUrl = this.hyperionUrls[chainName]
      if (newUrl && newHyperionUrl) {
        this.activeChain = chainName
        this.activeUrl = newUrl
        this.activeHyperionUrl = newHyperionUrl
        console.log(`Active chain set to ${chainName} with URL ${this.activeUrl}`)
      } else {
        console.error(`Attempted to set invalid chain name or URL not found: ${chainName}`)
        // Optionally set to a default URL or handle error more robustly
      }
    }
  }
})
