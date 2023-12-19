import { ContractKit, Contract } from "@wharfkit/contract"
import { APIClient, APIClientOptions, Name } from "@wharfkit/antelope"
import { useSessionStore } from "src/stores/sessionStore"
import { ActionNameParams, Contract as BoidContract, TableNames, RowType, ActionNames, abi as boidABI } from "src/lib/boid-contract-structure"
import { Contract as EosioMsigContract, Types as TypesMultiSign } from "src/lib/eosio-msig-contract-telos-mainnet"
import { Action, TransactResult, ABI, TimePointSec } from "@wharfkit/session"
import { useSignersStore } from "src/stores/useSignersStore"
import { generateRandomName, expDate, serializeActionData } from "src/lib/reuseFunctions"

const sessionStore = useSessionStore()

const signersStore = useSignersStore()
const reqSignAccsConverted = signersStore.signers.map((signer) =>
// eslint-disable-next-line new-cap
  new TypesMultiSign.permission_level({
    actor: Name.from(signer.actor),
    permission: Name.from(signer.permission)
  })
)

// this gets the chain API URL from the active session from the sessionStore
const url = sessionStore.chainUrl
const apiClientOptions:APIClientOptions = { url }
console.log("chain API URL:", apiClientOptions.url)
const clientAPI = new APIClient(apiClientOptions)
const contractKit = new ContractKit({
  client: clientAPI
})

// gets the ABI for a given account
const getABI = async(accountName:string) => {
  const abi = await clientAPI.v1.chain.get_abi(accountName)
  return abi
}

// custom ABI for wt.boid::transfer
const wtboidTransferabi = ABI.from({
  structs: [
    {
      name: "transfer",
      base: "",
      fields: [
        {
          name: "from",
          type: "name"
        },
        {
          name: "to",
          type: "name"
        },
        {
          name: "quantity",
          type: "asset"
        },
        {
          name: "memo",
          type: "string"
        }
      ]
    }]
})

// abi for boid smart contract taken from local file
export const boid = new BoidContract(contractKit)

// abi for eosio.msig smart contract taken from local file
export const eosioMsig = new EosioMsigContract(contractKit)


export async function fetchDataFromTable<T extends TableNames>(tableName:T):Promise<RowType<T>[] | undefined> {
  try {
    const tableData:RowType<T>[] = await boid.table(tableName).query().all()
    console.log(`Data fetched from ${tableName}:`, tableData)
    return tableData
  } catch (error:any) {
    console.error(`Error fetching data from ${tableName}:`, error)
    throw error
  }
}

export async function createAction<A extends ActionNames>(
  actionName:A,
  action_data:ActionNameParams[A]
):Promise<TransactResult | undefined> {
  console.log("createAction called with", { actionName, action_data })
  let isItMultiSignMode = sessionStore.multiSignState
  try {
    console.log(`Creating action: ${String(actionName)} with data:`, action_data)
    const session = sessionStore.session
    if (!session) throw new Error("Session not loaded")
    const action = boid.action(actionName, action_data)
    console.log("Action created:", action)

    if (!sessionStore.session) {
      console.error("Session is not defined")
      throw new Error("Session is not defined")
    }
    let result
    if (isItMultiSignMode) {
      // If multi-sign mode is enabled, create and execute a multi-sign proposal
      console.log("Executing action in multi-sign mode...")
      result = await createAndExecuteMultiSignProposal(reqSignAccsConverted, [action])
    } else {
      // Otherwise, execute a regular transaction
      console.log("Transacting action...")
      result = await session.transact({ action })
    }


    console.log("Transaction result:", result)
    return result
  } catch (error) {
    console.error("Error in createAction:", error)
    throw error
  }
}

export async function createAndExecuteMultiSignProposal(
  reqSignAccs:TypesMultiSign.permission_level[],
  actions:TypesMultiSign.action[]
):Promise<TransactResult | undefined> {
  try {
    console.log("Creating proposal with data:", actions)

    // Serialize actions if needed
    const serializedActions = await Promise.all(actions.map(async action => {
      let abi
      switch (Name.from(action.account).toString()) {
        case "wt.boid":
          abi = wtboidTransferabi
          break
        case "boid":
          abi = boidABI
          break
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
    const session = sessionStore.session
    if (!session) throw new Error("Session not loaded")

    const proposerAcc = Name.from(sessionStore.username)
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
    const action = eosioMsig.action("propose", proposalData)
    const result = await session.transact({ action })
    console.log("Transaction result:", result)

    return result
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
