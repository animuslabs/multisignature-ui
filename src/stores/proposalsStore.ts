
import { defineStore } from "pinia"
import { Signer } from "src/lib/types"
import { Types as TypesMultiSign, ActionNameParams as ActionProposalNameParams } from "src/lib/eosio-msig-contract-telos-mainnet"
import { fetchDataFromMsigTable, createProposalAction } from "src/lib/contracts"
import { TransactResult } from "@wharfkit/session"
import { getProposalsDataHyperion } from "src/lib/reuseFunctions"

export const proposalsStore = defineStore("proposals", {
  state: () => ({
    signers: [] as Signer[],
    proposals: [] as TypesMultiSign.approvals_info[],
    proposalDetails: [] as TypesMultiSign.proposal[]
  }),
  getters: {
    signersState: (state) => state.signers,
    getProposalDetails: (state) => state.proposalDetails
  },
  actions: {
    async getProposals(scope:string):Promise<TypesMultiSign.approvals_info[]> {
      const proposals = await fetchDataFromMsigTable("approvals2", scope)
      console.log("Proposals:", proposals)
      this.proposals = proposals as TypesMultiSign.approvals_info[]
      return proposals as TypesMultiSign.approvals_info[]
    },
    async getProposalDetailsData(scope:string):Promise<TypesMultiSign.proposal[]> {
      const proposals = await fetchDataFromMsigTable("proposal", scope)
      console.log("Proposals Details:", proposals)
      this.proposalDetails = proposals as TypesMultiSign.proposal[]
      return proposals as TypesMultiSign.proposal[]
    },
    async approveProposalAction(chainName:string, actionData:ActionProposalNameParams["approve"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction(chainName, "approve", actionData)
      return data
    },
    async unapproveProposalAction(chainName:string, actionData:ActionProposalNameParams["unapprove"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction(chainName, "unapprove", actionData)
      return data
    },
    async execProposalAction(chainName:string, actionData:ActionProposalNameParams["exec"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction(chainName, "exec", actionData)
      return data
    },
    async invalidateProposalAction(chainName:string, actionData:ActionProposalNameParams["invalidate"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction(chainName, "invalidate", actionData)
      return data
    },
    async cancelProposalAction(chainName:string, actionData:ActionProposalNameParams["cancel"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction(chainName, "cancel", actionData)
      return data
    },
    async getProposalByName(url:string, proposal:string):Promise<string> {
      try {
        const data = await getProposalsDataHyperion(url, undefined, proposal)
        const proposerName = data.proposals?.[0]?.proposer
        if (!proposerName) {
          throw new Error(`No proposer found for the proposal '${proposal}'. The proposal may not exist.`)
        }
        return proposerName
      } catch (error:any) {
        console.error("Error fetching proposer name:", error.message)
        throw error
      }
    }
  }
})
