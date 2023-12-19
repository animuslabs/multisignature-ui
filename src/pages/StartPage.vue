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
          <div class="row">
            <q-input type="text" v-model="selectedAction.account" label="contract name" class="q-mt-md" />
            <q-btn label="Fetch Contract Details" @click="fetchContractDetails" class="q-ml-md" />
          </div>
          <q-select
            v-model="selectedAction.name"
            :options="actionNamesOptions"
            option-value="value"
            label="action name"
            class="q-mt-md"
          /><q-btn label="Populate Action Structure" @click="populateStructure" class="q-ml-md" />
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
import { onMounted, computed, reactive, toRaw } from "vue"
import { createAndExecuteMultiSignProposal } from "src/lib/contracts"
import { Name } from "@wharfkit/antelope"
import { Types as TypesMultiSign } from "src/lib/eosio-msig-contract-telos-mainnet"
import { useContractStore } from "src/stores/contractStore"
const contractStore = useContractStore()

const fetchContractDetails = async() => {
  if (selectedAction.account) {
    try {
      await contractStore.getContractDetails(selectedAction.account)
      console.log("Action Structures:", contractStore.actionStructures)
    } catch (error) {
      console.error("Error fetching contract details:", error)
    }
  } else {
    console.error("Please enter a contract name")
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


onMounted(() => {

})
interface ActionField {
  name:string;
  type:string; // You can make this more specific if you have a finite set of types
}

interface ActionStructure {
  fields:ActionField[];
}
type ActionNameType = string | { label:string; value:string };

interface SelectedAction {
  account:string;
  name:ActionNameType;
  authorization:{ actor:string; permission:string }[];
  data:Record<string, any>;
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


</script>

<style scoped>
.q-card {
  width: 600px;
  max-width: 90%;
}
</style>
