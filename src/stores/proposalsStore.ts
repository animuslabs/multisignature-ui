
import { defineStore } from "pinia"
import { Signer } from "src/lib/types"
import { Types as TypesMultiSign, ActionNameParams as ActionProposalNameParams } from "src/lib/eosio-msig-contract-telos-mainnet"
import { fetchDataFromMsigTable, createProposalAction } from "src/lib/contracts"
import { TransactResult, ABI, TimePointSec, NameType } from "@wharfkit/session"

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
    async approveProposalAction(actionData:ActionProposalNameParams["approve"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction("approve", actionData)
      return data
    },
    async unapproveProposalAction(actionData:ActionProposalNameParams["unapprove"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction("unapprove", actionData)
      return data
    },
    async execProposalAction(actionData:ActionProposalNameParams["exec"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction("exec", actionData)
      return data
    },
    async invalidateProposalAction(actionData:ActionProposalNameParams["invalidate"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction("invalidate", actionData)
      return data
    },
    async cancelProposalAction(actionData:ActionProposalNameParams["cancel"]):Promise<TransactResult | unknown> {
      const data = await createProposalAction("cancel", actionData)
      return data
    }
  }
})
