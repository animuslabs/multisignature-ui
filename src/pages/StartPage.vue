<template>
  <q-page class="flex flex-center">
    <q-card class="q-mt-md">
      <q-card-section class="text-center">
        <div class="text-h6">
          Create a Multi Signature Proposal
        </div>
        <q-card-section>
          <div>
            Contract Section
          </div>
          <!-- Separate fields for account and name -->
          <q-input type="text" v-model="selectedAction.account" label="contract name" class="q-mt-md" />
          <q-input type="text" v-model="selectedAction.name" label="action name" class="q-mt-md" />
        </q-card-section>
        <q-card-section>
          <div>
            Authorization Section
          </div>
          <!-- Dynamic authorization fields -->
          <div class="q-mt-md">
            <div v-for="(auth, index) in selectedAction.authorization" :key="index" class="row q-mb-md">
              <q-input v-model="auth.actor" label="Actor" class="col" />
              <q-input v-model="auth.permission" label="Permission" class="col" />
              <q-btn icon="delete" color="negative" @click="removeAuthorization(index)" />
            </div>
            <q-btn icon="add" label="Add Authorization" @click="addAuthorization" />
          </div>
        </q-card-section>
        <q-card-section>
          <div>
            Data Section in JSON Format
          </div>
          <!-- Text area for data as JSON -->
          <q-input
            type="textarea"
            v-model="selectedActionDataJson"
            label="Data (JSON)"
            class="q-mt-md"
            style="min-height: 300px"
          />
        </q-card-section>
        <q-card-section>
          <div>
            Required Signers Section
          </div>

          <div v-for="(item, index) in reqSignAccs" :key="index" class="row q-mb-md">
            <q-input v-model="item.actor" label="Actor" class="col" />
            <q-input v-model="item.permission" label="Permission" class="col" />
            <q-btn icon="delete" color="negative" @click="removeReqSignAccs(index)" />
          </div>
          <q-btn icon="add" label="Add Actor/Permission" @click="addReqSignAccs" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Create" color="green" @click="createProposal" />
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { onMounted, computed, reactive } from "vue"
import { createAndExecuteMultiSignProposal } from "src/lib/contracts"
import { Name } from "@wharfkit/antelope"
import { Types as TypesMultiSign } from "src/lib/eosio-msig-contract-telos-mainnet"

const selectedAction = reactive({
  account: "",
  name: "",
  authorization: [{ actor: "", permission: "" }],
  data: {}
})

const selectedActionDataJson = computed({
  get: () => JSON.stringify(selectedAction.data, null, 2),
  set: (value) => {
    try {
      selectedAction.data = JSON.parse(value)
    } catch (error) {
      console.error("Error parsing action data JSON:", error)
    }
  }
})

const addAuthorization = () => {
  selectedAction.authorization.push({ actor: "", permission: "" })
}

const removeAuthorization = (index:number) => {
  selectedAction.authorization.splice(index, 1)
}

const reqSignAccs = reactive([
  { actor: "accexample01", permission: "active" },
  { actor: "accexample02", permission: "active" }
])

const addReqSignAccs = () => {
  reqSignAccs.push({ actor: "", permission: "" })
}

const removeReqSignAccs = (index:number) => {
  reqSignAccs.splice(index, 1)
}

const createProposal = async() => {
  try {
    // Convert the data JSON string back to an object
    selectedAction.data = JSON.parse(selectedActionDataJson.value)

    // Convert the authorizations to the required type
    const authorizationsConverted = selectedAction.authorization.map(auth => ({
      actor: Name.from(auth.actor),
      permission: Name.from(auth.permission)
    }))

    // Construct the complete action object
    // eslint-disable-next-line new-cap
    const action = new TypesMultiSign.action({
      account: selectedAction.account,
      name: selectedAction.name,
      authorization: authorizationsConverted,
      data: selectedAction.data
    })

    // Actions array for the proposal
    const actionsForProposal = [action]
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
  } catch (error) {
    console.error("Error creating proposal:", error)
  }
}


onMounted(() => {

})

</script>

<style scoped>
.q-card {
  width: 600px;
  max-width: 90%;
}
</style>
