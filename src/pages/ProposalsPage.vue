<template>
  <q-page padding class="container">
    <div class="q-card-container">
      <q-card>
        <div class="q-ma-md q-pt-sm">
          active chain: {{ chain }} | active endpoint: {{ endpoint }} | signer: {{ user }}
        </div>
        <div class="row q-ma-md">
          <q-input dense class="top-input" outlined v-model="proposalAcc" label="Proposer's Account" />
          <q-btn dense color="primary" class="top-btn q-ml-md" label="Search" @click="searchProposals" />
        </div>
        <q-table
          :rows="transformedProposalsData"
          :columns="columns"
          dense
          wrap-cells
          class="q-ma-xs"
          row-key="proposal_name"
          @row-click="handleRowClick"
        >
          <template #body-cell-approvals="props">
            <q-td style="width: 45%;" :props="props">
              <ul>
                <q-list dense separator>
                  <q-item v-for="approval in props.row.approvals" :key="approval.level.actor">
                    <q-item-section>
                      {{ approval.level.actor }}@{{ approval.level.permission }}
                    </q-item-section>
                    <q-item-section side>
                      <q-icon v-if="approval.provided" name="check_circle" color="green" />
                      <q-icon v-else name="hourglass_empty" color="orange" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </ul>
            </q-td>
          </template>
          <template #body-cell-approval_count="props">
            <q-td :props="props" style="width: 10%;">
              {{ props.row.provided_approvals.length }}/{{ props.row.requested_approvals.length + props.row.provided_approvals.length }}
              <q-tooltip>Provided / Requested</q-tooltip>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" style="width: 25%;">
              <q-btn
                icon="bolt"
                color="amber-7"
                round
                dense
                size="sm"
                @click="executeAction(props.row)"
              >
                <q-tooltip>Execute</q-tooltip>
              </q-btn>
              <q-btn
                icon="close"
                color="red"
                round
                dense
                size="sm"
                @click="cancelAction(props.row)"
              >
                <q-tooltip>Cancel</q-tooltip>
              </q-btn>
              <q-btn
                icon="undo"
                color="blue-8"
                round
                dense
                size="sm"
                @click="unapproveAction(props.row)"
              >
                <q-tooltip>Unapprove</q-tooltip>
              </q-btn>
              <q-btn
                icon="check"
                color="green"
                round
                dense
                size="sm"
                @click="approveAction(props.row)"
              >
                <q-tooltip>Sign</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
      <q-card>
        <div class="q-ma-md q-pt-sm q-pb-md">
          <div v-if="selectedProposalDetails">
            <div><strong>Proposal Name:</strong> {{ selectedProposalDetails.proposal_name }}</div>
            <div><strong>Earliest Execution Time:</strong> {{ selectedProposalDetails.earliest_exec_time }}</div>
            <div>
              <strong>Transaction Details:</strong>
              <div class="transaction-details-container">
                <pre>{{ selectedProposalDetails.packed_transaction }}</pre>
              </div>
            </div>
          </div>
          <div v-else>
            Select a proposal to view details or no proposals available.
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>



<script lang="ts" setup>
import { ref, Ref, onMounted, watch, computed } from "vue"
import { useRoute } from "vue-router"
import { proposalsStore } from "src/stores/proposalsStore"
import { Types as TypesMultiSign, ActionNameParams as ActionProposalNameParams } from "src/lib/eosio-msig-contract-telos-mainnet"
import { formatTime } from "src/lib/reuseFunctions"
import { useSessionStore } from "src/stores/sessionStore"
import { useContractStore } from "src/stores/contractStore"
import { useApiStore } from "src/stores/apiStore"
import { toObject } from "src/lib/util"
import { Transaction, PackedTransaction } from "@wharfkit/antelope"

type Approval = {
  level:{
    actor:string;
    permission:string;
  };
  time:string;
  provided:boolean;
};

type TransformedProposal = {
  proposal_name:string;
  requested_approvals:Approval[];
  provided_approvals:Approval[];
  approvals:Approval[];
  hasMismatch:boolean;
};

type PackedTransactionData = Transaction | { error:string };

type ProposalDetails = {
  proposal_name:string;
  packed_transaction:PackedTransactionData;
  earliest_exec_time:string;
};

const store = proposalsStore()
const proposalAcc = ref("")

const route = useRoute()
const sessionStore = useSessionStore()
const contractStore = useContractStore()
const chain = computed(() => route.params.chain || sessionStore.whatChain || "Login!")
const proposalName = computed(() => route.params.proposalName?.toString() || "")
const apiStore = useApiStore()
const activeChain = computed(() => apiStore.activeChain)
const activeHyperionUrl = computed(() => apiStore.activeHyperionUrl.toString())

const isLoading = ref(false)
const error = ref("")

async function fetchProposerName(proposalName:string) {
  console.log("Logging in with URL:", activeHyperionUrl.value)
  if (!activeHyperionUrl.value) {
    console.error("Active Hyperion URL is not defined.")
    return
  }

  isLoading.value = true
  error.value = ""

  try {
    const proposerName = await store.getProposalByName(activeHyperionUrl.value, proposalName)
    if (proposerName) {
      proposalAcc.value = proposerName
      await searchProposals()
    } else {
      error.value = "No proposer found for the given proposal name."
    }
  } catch (err) {
    error.value = "Failed to fetch data due to an error."
    console.error("Failed to fetch proposal by name:", err)
  } finally {
    isLoading.value = false
  }
}


const endpoint = computed(() => apiStore.activeUrl || "N/A")
const user = computed(() => sessionStore.username || "Login!")


const proposalsData:Ref<TypesMultiSign.approvals_info[]> = ref([])
const transformedProposalsData:Ref<TransformedProposal[]> = ref([])
const proposalsDetails:Ref<TypesMultiSign.proposal[]> = ref([])

const proposalsTransactionDetails = ref({} as ProposalDetails[])
const selectedProposalDetails = ref<ProposalDetails | null>(null)

const searchProposals = async() => {
  try {
    // Fetch proposals data
    const data = await store.getProposals(proposalAcc.value)
    proposalsData.value = data || []
    transformedProposalsData.value = transformProposalsData(proposalsData.value)

    // Fetch proposal details data
    const proposalsDetailsData = await store.getProposalDetailsData(proposalAcc.value)
    proposalsDetails.value = proposalsDetailsData || []

    // Transform the proposal details data
    const transformedDetailsData = proposalsDetailsData.map(item => {
      let decodedTransaction
      try {
        const packedData = PackedTransaction.from({ packed_trx: item.packed_transaction })
        decodedTransaction = packedData.getTransaction() // This should decode the transaction
        // Keep decodedTransaction as an object
      } catch (error) {
        console.error("Error decoding transaction for proposal:", item.proposal_name.toString(), error)
        decodedTransaction = { error: "Decoding error" } // Use an object for error handling
      }

      return {
        proposal_name: item.proposal_name.toString(),
        packed_transaction: decodedTransaction, // This is now an object
        earliest_exec_time: item.earliest_exec_time ? formatTime(item.earliest_exec_time.toString()) : "N/A"
      }
    })

    console.log("Transformed details:", transformedDetailsData)
    proposalsTransactionDetails.value = transformedDetailsData // Store all transformed details in the reactive variable
  } catch (error) {
    console.error("Error in searchProposals:", error)
  }
}

// Watch for changes in the active chain to fetch data
watch(activeChain, (newChain, oldChain) => {
  if (newChain !== oldChain) {
    // fetchProposals() // Define this method to fetch data based on the new chain
  }
}, { immediate: true })

// Watch the proposalName and fetch proposer's account when it changes
watch(proposalName, async(newProposalName) => {
  if (newProposalName) {
    await fetchProposerName(newProposalName)
  }
  await searchProposals().then(() => {
    handleProvidedProposalParameter()
  })
}, { immediate: true })

// when router parameter is provided, get proposal details
const handleProvidedProposalParameter = () => {
  const detail = proposalsTransactionDetails.value.find(p => p.proposal_name === proposalName.value)
  console.log("Found details:", detail)

  // If details are found, store them in the selectedProposalDetails for display
  if (detail) {
    selectedProposalDetails.value = detail
  } else {
    // If no details are found, set selectedProposalDetails to null or an empty object
    selectedProposalDetails.value = {} as ProposalDetails
    console.log("No details found for selected proposal.")
  }
}

const columns:{ name:string; label:string; field:string | ((row:TransformedProposal) =>any); required?:boolean; align?:"left" | "right" | "center" }[] = [
  { name: "proposal_name", required: true, label: "Proposal Name", align: "left", field: (row:TransformedProposal) => row.proposal_name },
  { name: "approvals", required: true, label: "Approvals", align: "left", field: "approvals" },
  { name: "approval_count", required: true, label: "Count", align: "left", field: "approval_count" },
  { name: "actions", required: true, label: "Actions", align: "left", field: "actions" }
]


// Function to transform the data
const transformProposalsData = (data:TypesMultiSign.approvals_info[]):TransformedProposal[] => {
  return data.map(item => {
    const combinedApprovals = [
      ...item.requested_approvals.map(approval => ({
        level: {
          actor: approval.level.actor.toString(),
          permission: approval.level.permission.toString()
        },
        time: formatTime(approval.time.toString()),
        provided: false
      })),
      ...item.provided_approvals.map(approval => ({
        level: {
          actor: approval.level.actor.toString(),
          permission: approval.level.permission.toString()
        },
        time: formatTime(approval.time.toString()),
        provided: true
      }))
    ]

    return {
      proposal_name: item.proposal_name.toString(),
      approvals: combinedApprovals,
      requested_approvals: combinedApprovals.filter(approval => !approval.provided),
      provided_approvals: combinedApprovals.filter(approval => approval.provided),
      hasMismatch: false // no need to check for mismatch
    }
  })
}

const executeAction = async(row:TransformedProposal) => {
  const user = sessionStore.username
  console.log("User:", user)

  const executeData:ActionProposalNameParams["exec"] = {
    proposer: proposalAcc.value,
    proposal_name: row.proposal_name,
    executer: user
  }

  try {
    console.log("Execute action data:", executeData)
    await store.execProposalAction(executeData)
    console.log("Execute action executed for:", row)
  } catch (error) {
    console.error("Error in executeAction:", error)
  }
}

const cancelAction = async(row:TransformedProposal) => {
  const user = sessionStore.username
  console.log("User:", user)

  const cancelData:ActionProposalNameParams["cancel"] = {
    proposer: proposalAcc.value,
    proposal_name: row.proposal_name,
    canceler: user
  }

  try {
    console.log("Cancel action data:", cancelData)
    await store.cancelProposalAction(cancelData)
    console.log("Cancel action executed for:", row)
  } catch (error) {
    console.error("Error in cancelAction:", error)
  }
}

const unapproveAction = async(row:TransformedProposal) => {
  const user = sessionStore.username
  const approvalToUnsign = row.provided_approvals.find(approval => approval.level.actor === user)
  console.log("Data:", proposalAcc.value, row.proposal_name, approvalToUnsign?.level.actor, approvalToUnsign?.level.permission)
  if (approvalToUnsign) {
    const unsignData:ActionProposalNameParams["unapprove"] = {
      proposer: proposalAcc.value,
      proposal_name: row.proposal_name,
      // eslint-disable-next-line new-cap
      level: new TypesMultiSign.permission_level({
        actor: approvalToUnsign.level.actor,
        permission: approvalToUnsign.level.permission
      })
    }

    await store.unapproveProposalAction(unsignData)
    setTimeout(() => searchProposals(), 1000)
    await searchProposals()
    console.log("Unsign action for:", row)
  } else {
    console.log("No approval found to unsign for:", row)
  }
}

const approveAction = async(row:TransformedProposal) => {
  const user = sessionStore.username
  console.log("User:", user)
  const approvalToSign = row.requested_approvals.find(approval => approval.level.actor === user)
  console.log("Data to approve:", proposalAcc.value, row.proposal_name, approvalToSign?.level.actor, approvalToSign?.level.permission)

  if (approvalToSign) {
    const approveData:ActionProposalNameParams["approve"] = {
      proposer: proposalAcc.value,
      proposal_name: row.proposal_name,
      // eslint-disable-next-line new-cap
      level: new TypesMultiSign.permission_level({
        actor: approvalToSign.level.actor,
        permission: approvalToSign.level.permission
      })
    }

    try {
      console.log("Approve action data:", toObject(approveData))
      await store.approveProposalAction(approveData)
      console.log("Approve action executed for:", row)
      setTimeout(() => searchProposals(), 1000)
    } catch (error) {
      console.error("Error in approveAction:", error)
    }
  } else {
    console.log("No approval found to sign for:", row)
  }
}

const handleRowClick = (evt:Event, row:any, index:number) => {
  const detail = proposalsTransactionDetails.value.find(p => p.proposal_name === row.proposal_name)
  console.log("Found details:", detail)

  // If details are found, store them in the selectedProposalDetails for display
  if (detail) {
    selectedProposalDetails.value = detail
  } else {
    // If no details are found, set selectedProposalDetails to null or an empty object
    selectedProposalDetails.value = {} as ProposalDetails
    console.log("No details found for selected proposal.")
  }
}

watch([() => sessionStore.whatChain, () => sessionStore.chainUrl], () => {
  contractStore.updateApiClient()
})

onMounted(async() => {
  if (proposalAcc.value) {
    await searchProposals()
  }
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: row inline;
  align-items: top;
  justify-content: center;
  height: 100vh;
  overflow-y: auto;
  max-height: fit-content;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.q-card-container {
  width: 100%;
  max-width: 600px;
  height: 100%;
  max-height: 100%;
  margin: auto;
  position: absolute;
}
.transaction-details-container {
  max-height: 100%;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.top-btn {
  width: 80px;
  height: 40px;

}
.top-input {
  width: 140px;
}
.q-table .q-td,
.q-table .q-th {
  padding: 0px 8px; /* Reduce padding inside table cells */
  font-size: 12px; /* Optional: reduce font size for a more compact look */
}
</style>
