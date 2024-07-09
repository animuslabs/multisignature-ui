import { Name } from "@wharfkit/antelope"
import { useSessionStore } from "src/stores/sessionStore"
import { ActionNameParams, TableNames as TableNamesBoid, RowType as RowTypeBoid, ActionNames } from "src/lib/boid-contract-structure"
import {
  Types as TypesMultiSign,
  RowType as RowTypeMsig,
  TableNames as TableNamesMsig,
  ActionNames as ActionProposalNames,
  ActionNameParams as ActionProposalNameParams
} from "src/lib/eosio-msig-contract-telos-mainnet"
import { TransactResult, ABI, TimePointSec, NameType } from "@wharfkit/session"
import { useSignersStore } from "src/stores/useSignersStore"
import { generateRandomName, expDate, serializeActionData } from "src/lib/reuseFunctions"
import { useContractStore } from "src/stores/contractStore"
import { toObject } from "src/lib/util"

const sessionStore = useSessionStore()
const signersStore = useSignersStore()
interface MsigResult {result:TransactResult, propName:NameType}
const reqSignAccsConverted = signersStore.signers.map((signer) =>
// eslint-disable-next-line new-cap
  new TypesMultiSign.permission_level({
    actor: Name.from(signer.actor),
    permission: Name.from(signer.permission)
  })
)
const contractStore = useContractStore()
contractStore.updateApiClient()

// gets the ABI for a given account
export const getABI = async(accountName:string) => {
  const api = contractStore.blockchainManager.getClientAPI()
  if (!api) {
    throw new Error("API client is not initialized")
  }
  try {
    // Access the `v1.chain.get_abi` method correctly
    const abi = await api.v1.chain.get_abi(accountName)
    return abi
  } catch (error) {
    console.error("Failed to fetch ABI:", error)
    throw error // Optionally re-throw the error to handle it in the calling context
  }
}

export const getAccInfo = async(accountName:string) => {
  const api = contractStore.blockchainManager.getClientAPI()
  if (!api) {
    throw new Error("API client is not initialized")
  }
  const accInfo = await api.v1.chain.get_account(accountName)
  console.log("Account info:", accInfo)
  return accInfo
}

export async function fetchDataFromTable<T extends TableNamesBoid>(tableName:T):Promise<RowTypeBoid<T>[] | undefined> {
  try {
    const boid = contractStore.blockchainManager.boid
    const tableData:RowTypeBoid<T>[] = await boid.table(tableName).query().all()
    console.log(`Data fetched from ${tableName}:`, tableData)
    return tableData
  } catch (error:any) {
    console.error(`Error fetching data from ${tableName}:`, error)
    throw error
  }
}

export async function fetchDataFromMsigTable<T extends TableNamesMsig>(tableName:T, acc:string):Promise<RowTypeMsig<T>[] | undefined> {
  try {
    const scope = Name.from(acc)
    const eosioMsig = contractStore.blockchainManager.eosioMsig
    const tableData:RowTypeMsig<T>[] = await eosioMsig.table(tableName, scope).query().all()
    return tableData
  } catch (error:any) {
    console.error(`Error fetching data from ${tableName}:`, error)
    throw error
  }
}

export async function createAction<A extends ActionNames>(
  chainName:string,
  actionName:A,
  action_data:ActionNameParams[A]
) {
  console.log("createAction called with", { actionName, action_data })
  let isItMultiSignMode = sessionStore.multiSignState
  try {
    console.log(`Creating action: ${String(actionName)} with data:`, action_data)
    const session = sessionStore.getSession(chainName)
    if (!session) throw new Error("Session not loaded")
    const boid = contractStore.blockchainManager.boid
    const action = boid.action(actionName, action_data)
    console.log("Action created:", action)

    if (!sessionStore.sessions) {
      console.error("Session is not defined")
      throw new Error("Session is not defined")
    }
    let result
    if (isItMultiSignMode) {
      // If multi-sign mode is enabled, create and execute a multi-sign proposal
      console.log("Executing action in multi-sign mode...")
      result = await createAndExecuteMultiSignProposal(chainName, reqSignAccsConverted, [action])
    } else {
      // Otherwise, execute a regular transaction
      console.log("Transacting action...")
      result = await session.transact({ action })
    }


    console.log("Transaction result:", result)
    return { result }
  } catch (error) {
    console.error("Error in createAction:", error)
    throw error
  }
}

// only used not in multi sign mode
export async function createProposalAction<A extends ActionProposalNames>(
  chainName:string,
  actionName:A,
  action_data:ActionProposalNameParams[A]
) {
  console.log("createAction called with", { actionName, action_data })
  try {
    console.log(`Creating action: ${String(actionName)} with data:`, action_data)

    const session = sessionStore.getSession(chainName)
    if (!session) throw new Error("Session not loaded")

    const eosioMsig = contractStore.blockchainManager.eosioMsig
    const action = eosioMsig.action(actionName, action_data)
    console.log("Action created:", action)

    if (!sessionStore.getSession(chainName)) {
      console.error("Session is not defined")
      throw new Error("Session is not defined")
    }

    console.log("Transacting action...")
    const result = await session.transact({ action })

    // Check if result contains the expected data fields
    if (!result) {
      throw new Error("Decoding error: Nothing to decode, you must set one of data, json, object")
    }

    console.log("Transaction result:", result)
    return { result }
  } catch (error:any) {
    console.error("Error in createProposalAction:", error)

    // Add detailed logging for better error diagnosis
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Stack trace:", error.stack)
    }

    // Check if error response contains additional data
    if (error.json) {
      console.error("Error response JSON:", error.json)
    } else if (error.data) {
      console.error("Error response data:", error.data)
    } else {
      console.error("Error object:", toObject(error))
    }

    throw error // Re-throw the error after logging details
  }
}

export async function createAndExecuteMultiSignProposal(
  chainName:string,
  reqSignAccs:TypesMultiSign.permission_level[],
  actions:TypesMultiSign.action[]
):Promise<MsigResult | undefined> {
  try {
    console.log("Creating proposal with data:", actions)

    // Serialize actions if needed
    const serializedActions = await Promise.all(actions.map(async action => {
      let abi
      switch (Name.from(action.account).toString()) {
        // Add cases for other accounts and their ABIs
        default: {
          // Fetch ABI dynamically for accounts not pre-configured
          const abiAcc = action.account.toString()
          const abiResponse = await getABI(abiAcc)
          if (!abiResponse.abi) {
            throw new Error(`ABI not found for account: ${action.account}`)
          }
          abi = ABI.from(abiResponse.abi)
          if (!abi) {
            throw new Error(`ABI not found for account: ${action.account}`)
          }
          break
        }
      }
      const serializedData = serializeActionData(action, abi)
      return TypesMultiSign.action.from({ ...action, data: serializedData })
    }))

    // Prepare the proposal data
    const session = sessionStore.getSession(chainName)
    if (!session) throw new Error("Session not loaded")

    const proposerAcc = Name.from(sessionStore.username(chainName))
    const propName = generateRandomName()
    const expiration = TimePointSec.from(expDate)
    const proposalData = TypesMultiSign.propose.from({
      proposer: proposerAcc,
      proposal_name: propName,
      requested: reqSignAccs,
      trx: {
        expiration,
        ref_block_num: 0,
        ref_block_prefix: 0,
        max_net_usage_words: 0,
        max_cpu_usage_ms: 0,
        delay_sec: 0,
        context_free_actions: [],
        actions: serializedActions,
        transaction_extensions: []
      }
    })

    console.log("Proposal data prepared:", proposalData)

    // Execute the transaction
    const eosioMsig = contractStore.blockchainManager.eosioMsig
    const action = eosioMsig.action("propose", proposalData)
    const result = await session.transact({ action })
    console.log("Transaction result:", result)

    return { result, propName }
  } catch (error) {
    console.error("Error in createAndExecuteProposal:", error)
    throw error
  }
}

export async function getContractDetails(contractName:string) {
  // Get the ABI for the contract
  const response = await getABI(contractName)
  if (!response.abi) {
    throw new Error("ABI not found for the contract")
  }

  const abi = ABI.from(response.abi)

  // Extract action names
  const actionNames = abi.actions.map(action => action.name)

  // Get the structure for each action
  const actionStructures = actionNames.map(name => {
    // The 'type' of the action corresponds to the name of the struct
    const actionType = abi.getActionType(name)
    if (actionType) {
      return abi.getStruct(actionType)
    } else {
      return undefined
    }
  })
  console.log("Action details:", { actionNames, actionStructures })
  return {
    actionNames,
    actionStructures
  }
}
