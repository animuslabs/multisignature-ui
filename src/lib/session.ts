import { networks } from "./config"
import { SessionKit, Session } from "@wharfkit/session"
import { WebRenderer } from "@wharfkit/web-renderer"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import { ref } from "vue"
import { useApiStore } from "src/stores/apiStore"

const apiStore = useApiStore()
let session = ref<Session | undefined>(undefined)

const webRenderer = new WebRenderer()
const sessionKit = new SessionKit({
  appName: "BoidAdmin",
  // Networks: 0 = Telos Mainnet, 1 = Telos Testnet, 2 = EOS Mainnet, 3 = WAX Mainnet
  chains: [
    {
      id: networks[0]!.chainId,
      url: apiStore.$state.chainUrls.Telos! || "",
      logo: networks[0]!.logo
    },
    {
      id: networks[1]!.chainId,
      url: apiStore.$state.chainUrls.TelosTestnet! || "",
      logo: networks[1]!.logo
    },
    {
      id: networks[2]!.chainId,
      url: apiStore.$state.chainUrls.EOS! || "",
      logo: networks[2]!.logo
    }
    // {
    //   id: networks[3]!.chainId,
    //   url: apiStore.$state.chainUrls.WAX! || "",
    //   logo: networks[3]!.logo
    // }
  ],
  ui: webRenderer,
  walletPlugins: [new WalletPluginAnchor()]
})

export async function sessionLogin():Promise<Session | undefined> {
  try {
    const response = await sessionKit.login()
    session.value = response.session
    return response.session
  } catch (error) {
    console.error("Failed to login:", error)
    throw error // Re-throw the error if you need to handle it higher up in your application
  }
}

export async function sessionLogout():Promise<Session | undefined> {
  await sessionKit.logout()
  session.value = undefined
  return session.value
}

export async function sessionRestore():Promise<Session | undefined> {
  const loginResult = await sessionKit.restore()
  session.value = loginResult
  return loginResult
}
