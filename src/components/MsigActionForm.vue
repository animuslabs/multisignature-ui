<template>
  <q-card class="q-mt-md full-width">
    <q-card-section>
      <q-splitter v-model="actionSplitterModel">
        <template #before>
          <!-- Contract Section -->
          <q-card-section>
            <div>Contract Name</div>
            <q-input type="text" v-model="selectedAction.account" class="flex-grow q-mb-md" input-style="font-size:20px;" />
            <q-btn flat color="primary" dense @click="fetchContractDetails" class=" custom-button-size">
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
            <div>Action Name</div>
            <q-input
              v-model="selectedAction.name"
              :options="actionNamesOptions"
              class="flex-grow q-mb-md"
              @input="(e:string) => { selectedAction.name = e }"
              input-style="font-size:20px;"
              :error="!validActionName"
              hide-bottom-space
            />
            <div class="row no-wrap">
              <q-btn-dropdown
                flat
                color="primary"
                :options="actionNamesOptions"
                :disable="!dataFetched"
                label="Select Action"
                class=" q-mb-lg"
              >
                <q-list>
                  <q-item class="text-black" v-for="action of actionNamesOptions" clickable v-close-popup @click="selectedAction.name = action.value" :key="action.value">
                    <q-item-section>{{ action.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn color="primary" flat @click="populateStructure" class="q-ml-md" icon="format_align_left" style="height:36px;">
                <q-tooltip>
                  <p style="font-size: 20px;">
                    Fill action's struct
                  </p>
                </q-tooltip>
              </q-btn>
            </div>



            <!-- <q-btn label="Fill Action's Struct" color="primary" @click="populateStructure" class="q-ml-md" /> -->
            <!-- <div v-if="dataFetched" class="text-positive q-mt-sm">
              Actions available
            </div> -->
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
          <q-input v-model="auth.actor" label="Actor" class="col" input-style="font-size:20px;" />
          <q-input v-model="auth.permission" label="Permission" class="col" input-style="font-size:20px;" />
          <q-btn icon="delete" color="negative" flat @click="removeAuthorization(index)" />
        </div>
        <q-btn icon="add" color="primary" label="Add Authorization" flat @click="addAuthorization" />
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
            class="q-mt-md full-width textareaElement"
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
          class="q-mt-md textareaElement"
        />
        <div v-if="currentView === 'after'" class="text-left">
          <pre v-if="formattedActionStructure && formattedActionStructure !== 'No structure available'">{{ formattedActionStructure }}</pre>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { computed, reactive, watch, ref, watchEffect, onMounted } from "vue"
import { createAndExecuteMultiSignProposal } from "src/lib/contracts"
import { Name } from "@wharfkit/antelope"
import { Types as TypesMultiSign } from "src/lib/eosio-msig-contract-telos-mainnet"
import { useContractStore } from "src/stores/contractStore"
import { useSessionStore } from "src/stores/sessionStore"
import { ActionStructure, ActionField, BlankAction } from "src/lib/types"
import { debounce } from "quasar"
import { validAccountName } from "src/lib/util"

const contractStore = useContractStore()
const sessionStore = useSessionStore()

const currentView = ref("before")
const splitterModel = ref(50)
const actionSplitterModel = ref(50)

const dataFetched = ref(false)


onMounted(async() => {
  await fetchContractDetails()
})

const fetchContractDetails = async() => {
  if (selectedAction.account) {
    try {
      await contractStore.getContractDetails(selectedAction.account)
      dataFetched.value = true
      if (selectedAction.authorization.length == 0) { addAuthorization() }
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
  return contractStore.actionNamesAsStringArray.map(name => ({ label: name.toString(), value: name.toString() }))
})

const props = defineProps<{
selectedAction:BlankAction
}>()
const { selectedAction } = props

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

const validActionName = computed(() => {
  if (selectedAction.name.length == 0) return true
  return contractStore.actionNamesAsStringArray.includes(selectedAction.name)
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
  selectedAction.authorization.push({ actor: selectedAction.account || "", permission: "active" })
}

const removeAuthorization = (index:number) => {
  selectedAction.authorization.splice(index, 1)
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

  actionName = selectedAction.name

  console.log("Selected Action Name:", actionName)

  if (actionName) {
    const actionStructure = contractStore.actionStructures.find(
      structure => structure.name.toString() === actionName
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

watch(() => selectedAction.account, debounce(() => {
  console.log("New selected action.account:", selectedAction.account)
  if (!validAccountName(selectedAction.account)) return
  void fetchContractDetails()
}, 500))

watch(() => selectedAction.name, debounce(() => {
  if (!validActionName.value) return
  populateStructure()
}, 5))



</script>

<style scoped>

textarea{
  /* box-sizing: padding-box; */
  overflow:hidden;
  /* demo only: */
  padding:10px;
  width:250px;
  font-size:14px;
  margin:50px auto;
  display:block;
  border-radius:10px;
  border:6px solid #556677;
}
.textareaElement {
  width: 100%;
  border: transparent;
  overflow-x: auto;
  overflow-y: auto;
     resize: auto;
  font-size: 18px;
  line-height: 40px;

}
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
