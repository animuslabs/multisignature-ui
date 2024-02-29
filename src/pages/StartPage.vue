<template>
  <q-page class="flex flex-center">
    <q-list class="justify-center">
      <div class="text-h4 q-mt-lg text-center">
        Create a Multi Signature Proposal
      </div>
      <q-list class="full-width">
        <div v-for="(action,index) of selectedActions" :key="index">
          <div class="row justify-center">
            <msig-action-form :selected-action="action" class="full-width" v-if="refreshForm" />
          </div>
          <div class="row justify-center q-mt-xs q-gutter-md q-mb-xl">
            <q-btn label="reset" icon="refresh" @click="clearAction(index)" />
            <q-btn label="remove" icon="remove" v-if="selectedActions.length>1" @click="removeAction(index)" />
            <q-btn label="copy" icon="add" @click="addNewAction(action)" />
          </div>
        </div>
      </q-list>
      <div class="row justify-center">
        <q-card class="q-mt-md">
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
          <q-separator class="q-mt-md q-mb-md" color="primary" />
          <q-card-actions align="right">
            <q-btn label="Action" icon="add" color="primary" @click="addNewAction()" />
            <q-btn label="Create" color="green-8" :disable="disableCreate" @click="createProposal" />
          </q-card-actions>
        </q-card>
      </div>
    </q-list>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, reactive, watch, ref, onMounted, nextTick } from "vue"
import { createAndExecuteMultiSignProposal } from "src/lib/contracts"
import { Name } from "@wharfkit/antelope"
import { Types as TypesMultiSign } from "src/lib/eosio-msig-contract-telos-mainnet"
import { useContractStore } from "src/stores/contractStore"
import { useSessionStore } from "src/stores/sessionStore"
import { ActionStructure, ActionField, BlankAction } from "src/lib/types"
import { Action } from "@wharfkit/session"
import MsigActionForm from "src/components/MsigActionForm.vue"
import { toObject } from "src/lib/util"
import { Dialog, LocalStorage } from "quasar"

const contractStore = useContractStore()
const sessionStore = useSessionStore()

const currentView = ref("before")
const splitterModel = ref(50)
const actionSplitterModel = ref(50)

const blankAction:BlankAction = {
  account: "",
  name: "",
  authorization: [],
  data: {}
}

const dataFetched = ref(false)
const reqSignAccs = reactive([
  { actor: "", permission: "active" },
  { actor: "", permission: "active" }
])
onMounted(() => {
  addNewAction()
  console.log(sessionStore.whatChain)
  const exists = LocalStorage.getItem("reqSigners")
  if (exists) {
    reqSignAccs.splice(0, 100, ...exists as Array<any>)
  }
})
const refreshForm = ref(true)

const selectedActions:BlankAction[] = reactive([])

function addNewAction(action?:BlankAction) {
  if (action) selectedActions.push(reactive(toObject(action)))
  else {
    selectedActions.push(reactive(toObject(blankAction)))
  }
}
function removeAction(index:number) {
  selectedActions.splice(index, 1)
}
function clearAction(index:number) {
  refreshForm.value = false
  selectedActions[index] = toObject(blankAction)
  console.log(reactive(toObject(blankAction)))
  console.log(selectedActions[index])
  void nextTick(() => refreshForm.value = true)
}


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
  console.log(JSON.parse(JSON.stringify(selectedActions)))
  LocalStorage.set("reqSigners", reqSignAccs)
  try {
    const actions = selectedActions.map(selectedAction => {
      const actionName = selectedAction.name
      // Convert the data JSON string back to an object
      // selectedAction.data = JSON.parse(selectedAction.data

      // Convert the authorizations to the required type
      const authorizationsConverted = selectedAction.authorization.map(auth => ({
        actor: Name.from(auth.actor),
        permission: Name.from(auth.permission)
      }))

      // Construct the complete action object
      // eslint-disable-next-line new-cap
      const action = new TypesMultiSign.action({
        account: selectedAction.account,
        name: actionName,
        authorization: authorizationsConverted,
        data: selectedAction.data
      })
      return action
    })

    // Actions array for the proposal
    const actionsForProposal = actions
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
    const result = await createAndExecuteMultiSignProposal(reqSignAccsConverted, actionsForProposal)
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
  if (sessionStore.whatChain.toLowerCase() === "telos") return `<a style="font-size:25px;" href="https://explorer.telos.net/proposal/${name}">Proposal Link</a>`
  if (sessionStore.whatChain.toLowerCase() === "telostestnet") return `<a style="font-size:25px;" href="https://explorer-test.telos.net/proposal/${name}">Proposal Link</a>`
  if (sessionStore.whatChain.toLowerCase() === "eos") return `<a style="font-size:25px;" href="https://bloks.io/msig/${sessionStore.authorization.actor.toString()}/${name}">Proposal Link</a>`
  else return ""
}

const disableCreate = computed(() => {
  return !sessionStore.isLoggedIn
})

watch(() => sessionStore.chainUrl, () => {
  contractStore.updateApiClient()
})
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
