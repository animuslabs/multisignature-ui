<template>
  <q-page class="flex flex-center">
    <q-card class="q-mt-md">
      <q-card-section class="text-center">
        <div class="text-h6">
          Create a Multi Signature Proposal
        </div>
        <q-separator class="q-mt-md q-mb-md" color="primary" />
        <q-splitter v-model="actionSplitterModel">
          <template #before>
            <!-- Contract Section -->
            <q-card-section>
              <div>Contract Section</div>
              <q-input type="text" v-model="selectedAction.account" label="contract name" class="flex-grow q-mb-md" />
              <q-btn color="primary" dense @click="fetchContractDetails" class="q-ml-md custom-button-size">
                Fetch Contract
                <template v-if="dataFetched">
                  <q-icon name="thumb_up" class="q-ml-sm text-green" />
                </template>
              </q-btn>
            </q-card-section>
          </template>

          <template #after>
            <!-- Actions Section -->
            <q-card-section>
              <q-select
                v-model="selectedAction.name"
                :options="actionNamesOptions"
                :disable="!dataFetched"
                option-value="value"
                label="action name"
                class="q-mt-md q-mb-lg"
              />

              <q-btn label="Fill Action's Struct" color="primary" @click="populateStructure" class="q-ml-md" />
              <div v-if="dataFetched" class="text-positive q-mt-sm">
                Actions available
              </div>
            </q-card-section>
          </template>
        </q-splitter>
      </q-card-section>
      <q-separator class="q-mt-md q-mb-md" color="primary" />
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
          <q-btn icon="add" color="primary" label="Add Authorization" @click="addAuthorization" />
        </div>
      </q-card-section>
      <q-separator class="q-mt-md q-mb-md" color="primary" />
      <q-card-section>
        <div>Data Section</div>
        <div inline class="q-mb-md">
          <q-radio v-model="currentView" label="JSON" val="before" />
          <q-radio v-model="currentView" label="BOTH" val="both" />
          <q-radio v-model="currentView" label="STRUCT" val="after" />
        </div>

        <q-splitter v-if="currentView === 'both'" v-model="splitterModel">
          <template #before>
            <!-- Text area for data as JSON -->
            <div>Data (JSON)</div>
            <q-input
              type="textarea"
              v-model="selectedActionDataJson"
              class="q-mt-md"
              style="min-height: 300px"
            />
          </template>
          <template #after>
            <!-- Display action structure -->
            <div>Action's original structure</div>
            <div class="text-left" v-if="formattedActionStructure && formattedActionStructure !== 'No structure available'">
              <pre>{{ formattedActionStructure }}</pre>
            </div>
          </template>
        </q-splitter>

        <div v-else>
          <div v-if="currentView === 'before'">
            Data (JSON)
          </div>
          <div v-if="currentView === 'after'">
            Action's original structure
          </div>
          <q-input
            v-if="currentView === 'before'"
            type="textarea"
            v-model="selectedActionDataJson"
            class="q-mt-md"
            style="min-height: 300px"
          />
          <div v-if="currentView === 'after'" class="text-left">
            <pre v-if="formattedActionStructure && formattedActionStructure !== 'No structure available'">{{ formattedActionStructure }}</pre>
          </div>
        </div>
      </q-card-section>
      <q-separator class="q-mt-md q-mb-md" color="primary" />
      <q-card-section>
        <div>
          Required Signers Section
        </div>

        <div v-for="(item, index) in reqSignAccs" :key="index" class="row q-mb-md">
          <q-input v-model="item.actor" label="Actor" class="col" />
          <q-input v-model="item.permission" label="Permission" class="col" />
          <q-btn icon="delete" color="negative" @click="removeReqSignAccs(index)" />
        </div>
        <q-btn icon="add" color="primary" label="Add Actor/Permission" @click="addReqSignAccs" />
      </q-card-section>
      <q-separator class="q-mt-md q-mb-md" color="primary" />
      <q-card-actions align="right">
        <q-btn label="Create" color="green" @click="createProposal" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, reactive, watch, ref } from "vue"
import { createAndExecuteMultiSignProposal } from "src/lib/contracts"
import { Name } from "@wharfkit/antelope"
import { Types as TypesMultiSign } from "src/lib/eosio-msig-contract-telos-mainnet"
import { useContractStore } from "src/stores/contractStore"
import { useSessionStore } from "src/stores/sessionStore"
import { ActionStructure, ActionField } from "src/lib/types"

const contractStore = useContractStore()
const sessionStore = useSessionStore()

const currentView = ref("before")
const splitterModel = ref(50)
const actionSplitterModel = ref(50)

const dataFetched = ref(false)

const fetchContractDetails = async() => {
  if (selectedAction.account) {
    try {
      await contractStore.getContractDetails(selectedAction.account)
      dataFetched.value = true
      console.log("Action Structures:", contractStore.actionStructures)
    } catch (error) {
      console.error("Error fetching contract details:", error)
      dataFetched.value = false
    }
  } else {
    console.error("Please enter a contract name")
    dataFetched.value = false
  }
}

const actionNamesOptions = computed(() => {
  return contractStore.actionNamesAsStringArray.map(name => ({ label: name, value: name }))
})

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
const selectedActionStructure = computed(() => {
  let actionName:string
  if (typeof selectedAction.name === "object" && selectedAction.name !== null) {
    actionName = (selectedAction.name as { value:string }).value
  } else {
    actionName = selectedAction.name as string
  }
  console.log("selectedAction.name:", actionName)

  if (actionName) {
    const actionStructure = contractStore.actionStructures.find(
      structure => structure.name === actionName
    )
    console.log("Found structure:", actionStructure)
    return actionStructure || null
  }
  return null
})


const formattedActionStructure = computed(() => {
  console.log("selectedActionStructure.value:", selectedActionStructure.value)
  if (selectedActionStructure.value) {
    const structureString = JSON.stringify(selectedActionStructure.value, null, 2)
    console.log("Structure String:", structureString)
    return structureString
  }
  return "No structure available"
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
    const actionName = isActionNameObject(selectedAction.name) ? selectedAction.name.value : selectedAction.name
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
      name: actionName,
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

function isActionNameObject(name:any):name is { label:string; value:string } {
  return name && typeof name === "object" && "value" in name
}

const populateDataJsonTemplate = (actionStructure:ActionStructure) => {
  const template:Record<string, any> = {}
  actionStructure.fields.forEach((field:ActionField) => {
    // Add default values or placeholders based on the field type
    switch (field.type) {
      case "name":
        template[field.name] = "namehere"
        break
      case "asset":
        template[field.name] = "0.0000 SYMBOL" // Replace SYMBOL with actual symbol if known
        break
      case "uint32":
        template[field.name] = 0
        break
      case "bool":
        template[field.name] = false
        break
      // Add cases for other types as needed
      default:
        template[field.name] = ""
    }
  })
  selectedAction.data = template // Update the reactive data object
  selectedActionDataJson.value = JSON.stringify(template, null, 2) // Update the JSON string
}
const populateStructure = () => {
  let actionName:string

  if (isActionNameObject(selectedAction.name)) {
    actionName = selectedAction.name.value
  } else {
    actionName = selectedAction.name // Here, it is treated as a string
  }
  console.log("Selected Action Name:", actionName)

  if (actionName) {
    const actionStructure = contractStore.actionStructures.find(
      structure => structure.name === actionName
    )

    console.log("Found Action Structure:", actionStructure)

    if (actionStructure) {
      populateDataJsonTemplate(actionStructure)
    } else {
      console.error("Action structure not found for:", actionName)
    }
  } else {
    console.error("No action selected")
  }
}

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
