<template>
  <q-page class="flex flex-center">
    <q-list class="justify-center">
      <q-list class="full-width">
        <q-card-section>
        <div class="text-h6 text-center">
          <q-tooltip>Used when payer and creator are different</q-tooltip>
          Create New Account
        </div>
        <q-separator class="q-mt-md q-mb-md" color="primary" />
        <div class="row justify-center">
        <!-- Input Fields -->
        <q-input
          v-model="newAccDataForm.accCreator"
          label="Account Creator"
          dense
          outlined
          class="q-ma-xs"
          input-style="font-size:14px;"
        />
        <q-input
          v-model="newAccDataForm.accToCreate"
          label="New Account Name"
          dense
          outlined
          class="q-ma-xs"
          input-style="font-size:14px;"
        />
      </div>
        <q-input
          v-model="newAccDataForm.ownerPublicKey"
          label="Owner Public Key"
          dense
          outlined
          class="q-ma-xs"
          input-style="font-size:14px;"
        />
        <q-input
          v-model="newAccDataForm.activePublicKey"
          label="Active Public Key"
          dense
          outlined
          class="q-ma-xs"
          input-style="font-size:14px;"
        />
        <div class="row justify-center">
        <q-input
          v-model="newAccDataForm.resourcesPayer"
          label="Resources Payer"
          dense
          outlined
          class="q-ma-xs"
          input-style="font-size:14px;"
        />
        <q-input
          v-model="newAccDataForm.ramQuantity"
          label="RAM in Bytes"
          type="number"
          dense
          outlined
          class="q-ma-xs"
          input-style="font-size:14px;"
        />
        </div>
        <div class="row justify-center">
        <q-input
          v-model="newAccDataForm.quantityCPU"
          label="Stake CPU"
          dense
          outlined
          class="q-ma-xs"
          input-style="font-size:14px;"
        />
        <q-input
          v-model="newAccDataForm.quantityNET"
          label="Stake NET"
          dense
          outlined
          class="q-ma-xs"
          input-style="font-size:14px;"
        />
      </div>
      </q-card-section>
            <q-card>
            </q-card>
            <q-card>
            </q-card>
      </q-list>
      <div class="row justify-center">
        <q-card class="q-ma-xs">
          <q-card-section>
            <div>
              Required Signers Section
            </div>
            <div v-for="(item, index) in reqSignAccs" :key="index" class="row q-mb-md">
              <q-input v-model="item.actor" label="Actor" class="col" />
              <q-input v-model="item.permission" label="Permission" class="col" />
              <q-btn icon="delete" color="negative" flat @click="removeReqSignAccs(index)" />
            </div>
            <q-btn icon="add" color="primary" label="Add Actor/Permission" @click="addReqSignAccs" class="q-mr-sm" />
            <q-btn icon="close" color="primary" label="Clear" @click="resetReqAuth" />
          </q-card-section>
          <q-separator class="q-ma-xs" color="primary" />
          <q-card-section allign="right">
            <q-btn label="Create" color="green-8" :disable="disableCreate" @click="createProposal" />
          </q-card-section>
        </q-card>
      </div>
    </q-list>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, reactive, watch, ref, onMounted, nextTick } from "vue"
import { createAndExecuteMultiSignProposal } from "src/lib/contracts"
import { Name, Action } from "@wharfkit/antelope"
import { Types as TypesMultiSign } from "src/lib/eosio-msig-contract-telos-mainnet"
import { ActionNameParams, abi } from 'src/lib/eosio.Types';
import { useContractStore } from "src/stores/contractStore"
import { useSessionStore } from "src/stores/sessionStore"
import { useApiStore } from "src/stores/apiStore"
import { Dialog, LocalStorage } from "quasar"

const contractStore = useContractStore()
const sessionStore = useSessionStore()
const apiStore = useApiStore()
const chainName = ref(apiStore.activeChain)
// Fetch the username using the getter from sessionStore
const username = computed(() => sessionStore.username(chainName.value))

// Reactive data structure for newaccount
const newAccDataForm = reactive({
  accCreator: username.value,
  accToCreate: "",
  ownerPublicKey: "",
  activePublicKey: "",
  resourcesPayer: "",
  quantityCPU: "1.0000 TLOS",
  quantityNET: "0.2000 TLOS",
  ramQuantity: 12000
})

const reqSignAccs = reactive([
  { actor: "", permission: "active" },
  { actor: "", permission: "active" }
])
onMounted(() => {
  console.log(apiStore.activeChain)
  const exists = LocalStorage.getItem("reqSigners")
  if (exists) {
    reqSignAccs.splice(0, 100, ...exists as Array<any>)
  }
})

function resetReqAuth() {
  reqSignAccs.splice(0, 9999)
  addReqSignAccs()
  addReqSignAccs()
  LocalStorage.remove("reqSigners")
}

const addReqSignAccs = () => {
  reqSignAccs.push({ actor: "", permission: "active" })
}

const removeReqSignAccs = (index:number) => {
  reqSignAccs.splice(index, 1)
}

const createProposal = async() => {
  LocalStorage.set("reqSigners", reqSignAccs)
  try {
        const newAccData: ActionNameParams["newaccount"] ={
        creator: newAccDataForm.accCreator,
        name: newAccDataForm.accToCreate,
        owner: ({
            accounts: [],
            keys: [
                {
                key: newAccDataForm.ownerPublicKey,
                weight: 1
                }
            ],
            waits: [],
            threshold: 1
        }),
        active: ({
            accounts: [],
            keys: [{
                key: newAccDataForm.activePublicKey,
                weight: 1
                }
            ],
            waits: [],
            threshold: 1
        })
    }
    // eslint-disable-next-line new-cap
    const actionNewAcc = new TypesMultiSign.action({
        account: "eosio",
        name: "newaccount",
        authorization: [{
            actor: Name.from(newAccDataForm.accCreator),
            permission: Name.from("active")
        }],
        data: newAccData,
        abi: abi
    })

    const buyRAMbytesData: ActionNameParams["buyrambytes"] = ({
    payer: newAccDataForm.resourcesPayer,
    receiver: newAccDataForm.accToCreate,
    bytes: newAccDataForm.ramQuantity
    })
// eslint-disable-next-line new-cap
    const actionBuyRam = new TypesMultiSign.action({
        account: "eosio",
        name: "buyrambytes",
        authorization: [{
            actor: Name.from(newAccDataForm.resourcesPayer),
            permission: Name.from("active")
        }],
        data: buyRAMbytesData,
        abi: abi
    })

    const delegateBWData: ActionNameParams["delegatebw"] = ({
        from: newAccDataForm.resourcesPayer,
        receiver: newAccDataForm.accToCreate,
        stake_net_quantity: newAccDataForm.quantityNET,
        stake_cpu_quantity: newAccDataForm.quantityCPU,
        transfer: true
    })
// eslint-disable-next-line new-cap
    const actionDelegateBW = new TypesMultiSign.action({
        account: "eosio",
        name: "delegatebw",
        authorization: [{
            actor: Name.from(newAccDataForm.resourcesPayer),
            permission: Name.from("active")
        }],
        data: delegateBWData,
        abi: abi
    })
    console.log("actionNewAcc:", actionNewAcc)
    console.log("actionBuyRam:", actionBuyRam)
    console.log("actionDelegateBW:", actionDelegateBW)
    console.log("reqSignAccs:", reqSignAccs)
    console.log("ABI", abi)
    // Actions array for the proposal
    const actionsForProposal = [actionNewAcc, actionBuyRam, actionDelegateBW]
    console.log("actionsForProposal:", actionsForProposal)
    // Convert reqSignAccs to the required type for the proposal
    const reqSignAccsConverted = reqSignAccs.map(item =>
      // eslint-disable-next-line new-cap
      new TypesMultiSign.permission_level({
        actor: Name.from(item.actor),
        permission: Name.from(item.permission)
      })
    )
    console.log("reqSignAccsConverted:", reqSignAccsConverted)

    // Attempt to create the proposal with the actions
    const result = await createAndExecuteMultiSignProposal(chainName.value, reqSignAccsConverted, actionsForProposal)
    console.log("Proposal created:", result)

    Dialog.create({
      title: "Proposal created",
      message: proposalDialogText(result?.propName.toString() || ""),
      color: "positive",
      html: true
    })
  } catch (error:any) {
    console.error("Error creating proposal:", error)
    Dialog.create({
      title: "Error creating proposal",
      message: error.message,
      color: "negative"
    })
  }
}
function proposalDialogText(name:string) {
  if (!name) {
    console.error("Invalid proposal name received")
    return "" // Or provide a default error message
  }

  const lowerChain = apiStore.activeChain.toLowerCase()
  switch (lowerChain) {
    case "telos":
      return `<a style="font-size:25px;" href="https://explorer.telos.net/proposal/${name}">Proposal Link</a>`
    case "telostestnet":
      return `<a style="font-size:25px;" href="https://explorer-test.telos.net/proposal/${name}">Proposal Link</a>`
    case "eos":
      return `<a style="font-size:25px;" href="https://cofee.bloks.io/msig/${sessionStore.username(apiStore.activeChain)}/${name}">Proposal Link</a>`
    default:
      return ""
  }
}


const disableCreate = computed(() => {
  return !sessionStore.isLoggedIn
})

watch(() => apiStore.activeChain, () => {
  contractStore.updateApiClient()
})

// Watch for changes in chainName and react accordingly
watch(chainName, (newChain, oldChain) => {
  console.log(`Chain changed from ${oldChain} to ${newChain}`)
  newAccDataForm.accCreator = sessionStore.username(newChain) // Update accCreator dynamically
  // Perform any updates or refreshes needed when the chain changes
  contractStore.updateApiClient()
}, { immediate: true })
</script>

<style scoped>
.q-card {
  width: 600px;
  max-width: 90%;
}
.show-only-before .q-splitter__after {
  display: none;
}

.show-only-after .q-splitter__before {
  display: none;
}

.custom-button-size {
  height: 40px;
  width: 180px;
}
</style>
