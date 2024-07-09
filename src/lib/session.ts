import { networks } from "./config"
import { SessionKit, Session } from "@wharfkit/session"
import { WebRenderer } from "@wharfkit/web-renderer"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import { ref } from "vue"
import { useApiStore } from "src/stores/apiStore"

const apiStore = useApiStore()
let session = ref<Session | undefined>(undefined)

const webRenderer = new WebRenderer()

function createSessionKit(chainName:string):SessionKit {
  const chainInfo = networks.find(n => n.name === chainName)
  if (!chainInfo) {
    throw new Error(`No configuration found for chain: ${chainName}`)
  }
  return new SessionKit({
    appName: "BoidAdmin",
    chains: [
      {
        id: chainInfo.chainId,
        url: apiStore.$state.chainUrls[chainName] || "",
        logo: chainInfo.logo
      }
    ],
    ui: webRenderer,
    walletPlugins: [new WalletPluginAnchor()]
  })
}

// Export functions that create a session for a specific chain name
export async function sessionLogin(chainName:string):Promise<Session | undefined> {
  const sessionKit = createSessionKit(chainName)
  try {
    const response = await sessionKit.login()
    session.value = response.session
    return response.session
  } catch (error) {
    console.error(`Failed to login on chain ${chainName}:`, error)
    throw error
  }
}

export async function sessionLogout(chainName:string):Promise<Session | undefined> {
  const sessionKit = createSessionKit(chainName)
  await sessionKit.logout()
  session.value = undefined
  return session.value
}

export async function sessionRestore(chainName:string):Promise<Session | undefined> {
  const sessionKit = createSessionKit(chainName)
  const loginResult = await sessionKit.restore()
  session.value = loginResult
  return loginResult
}
