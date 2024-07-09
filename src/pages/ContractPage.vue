<template>
  <q-page class="flex flex-center">
    <div class="full-width q-pa-md">
      <div class="text-h5 text-center q-mb-md">
        Upload Your Smart Contract
      </div>
      <div class="row q-ma-md flex-center">
        <WasmUploadComponent
          @wasm-converted="onWasmConverted"
          @wasm-removed="onWasmRemoved"
          class="q-ma-md component-size"
        />
        <AbiUploadComponent
          @abi-converted="onAbiConverted"
          @abi-removed="onAbiRemoved"
          class="q-ma-md component-size"
        />
      </div>

      <q-card class="q-ma-md q-pa-md">
        <div>
          Contract Authorization Section
        </div>
        <!-- Dynamic authorization fields -->
        <div>
          <div class="q-mb-md">
            <q-input v-model="contract.actor" label="Contract Name" class="row q-ma-md" />
            <q-input v-model="contract.permission" label="Permission" class="row q-ma-md" />
          </div>
        </div>
      </q-card>
      <q-card class="q-ma-md q-pa-md">
        <div>
          Required Signers Section
        </div>

        <div v-for="(signer, index) in reqSignAccs" :key="index" class="row q-mb-md">
          <q-input v-model="signer.actor" label="Actor" class="col" />
          <q-input v-model="signer.permission" label="Permission" class="col" />
          <q-btn icon="delete" color="negative" @click="removeReqSignAccs(index)" />
        </div>
        <q-btn icon="add" color="primary" label="Add Actor/Permission" @click="addReqSignAccs" />
      </q-card>
      <q-btn label="Upload" color="primary" class="full-width" @click="createProposal" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createAndExecuteMultiSignProposal } from "src/lib/contracts"
import WasmUploadComponent from "src/components/WasmUploadComponent.vue"
import AbiUploadComponent from "src/components/AbiUploadComponent.vue"
import { Types as TypesMultiSign } from "src/lib/eosio-msig-contract-telos-mainnet"
import { Bytes, Name } from "@wharfkit/antelope"
import { useApiStore } from "src/stores/apiStore"
import { useContractStore } from "src/stores/contractStore"

const contract = reactive({ actor: "", permission: "" })
const wasmArray = ref("") // Holds the converted WASM file string
const abiBytes = ref<Bytes | null>(null) // Holds the serialized ABI Bytes
const apiStore = useApiStore()
const contractStore = useContractStore()
const chainName = ref(apiStore.activeChain)

function onWasmConverted(convertedString:string) {
  wasmArray.value = convertedString
}

function onAbiConverted(convertedBytes:Bytes) {
  abiBytes.value = convertedBytes
}
function onWasmRemoved() {
  wasmArray.value = "" // Reset to empty when the WASM file is removed
}

function onAbiRemoved() {
  abiBytes.value = null // Reset to null when the ABI file is removed
}
const reqSignAccs = reactive([
  { actor: "", permission: "" } // Initial empty signer
])
const addReqSignAccs = () => {
  reqSignAccs.push({ actor: "", permission: "" })
}
const removeReqSignAccs = (index:number) => {
  reqSignAccs.splice(index, 1)
}




const createProposal = async() => {
  try {
    // Convert the authorizations to the required type
    const contractAuth = [{
      actor: Name.from(contract.actor),
      permission: Name.from(contract.permission)
    }]

    const actionsForProposal = []

    // Check if wasmString has data and add actionWASM to actionsForProposal
    if (wasmArray.value) {
      // eslint-disable-next-line new-cap
      const actionWASM = new TypesMultiSign.action({
        account: "eosio",
        name: "setcode",
        authorization: contractAuth,
        data: {
          account: contract.actor,
          code: wasmArray.value,
          vmtype: 0,
          vmversion: 0
        }
      })
      actionsForProposal.push(actionWASM)
    }

    // Check if abiBytes has data and add actionABI to actionsForProposal
    if (abiBytes.value) {
      // eslint-disable-next-line new-cap
      const actionABI = new TypesMultiSign.action({
        account: "eosio",
        name: "setabi",
        authorization: contractAuth,
        data: {
          account: contract.actor,
          abi: abiBytes.value
        }
      })
      actionsForProposal.push(actionABI)
    }

    // Check if there are no actions to propose
    if (actionsForProposal.length === 0) {
      throw new Error("No data available for WASM or ABI to create actions")
    }

    // Convert reqSignAccs to the required type for the proposal
    const reqSignAccsConverted = reqSignAccs.map(item =>
    // eslint-disable-next-line new-cap
      new TypesMultiSign.permission_level({
        actor: Name.from(item.actor),
        permission: Name.from(item.permission)
      })
    )

    // Attempt to create the proposal with the actions
    const result = await createAndExecuteMultiSignProposal(chainName.value, reqSignAccsConverted, actionsForProposal)
    console.log("Proposal created:", result)
  } catch (error) {
    console.error("Error creating proposal:", error)
  }
}

// Watch for changes in chainName and react accordingly
watch(chainName, (newChain, oldChain) => {
  console.log(`Chain changed from ${oldChain} to ${newChain}`)
  // Perform any updates or refreshes needed when the chain changes
  contractStore.updateApiClient()
}, { immediate: true })

</script>

<style>
.full-width {
  width: 100%;
  max-width: 600px;
}
.component-size {
  width: 100%;
  max-width: 230px;
}
</style>
