<template>
  <q-page padding class="flex flex-center">
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-sm">
          Account Information
        </div>
        <q-input v-model="initialAccountName" label="Account Name" filled />
        <q-btn label="Fetch Account Info" @click="fetchInitialAccountInfo" color="primary" class="q-mt-md" />
        <q-separator class="q-ma-md" />
        <div v-for="name in accountNames" :key="name" class="q-ma-md">
          <AccInfoComponent
            :account-name="name"
            :account-object="accountObjects[name]"
            @account-clicked="handleAccountClick"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue"
import AccInfoComponent from "src/components/AccInfoComponent.vue"
import { getAccInfo } from "src/lib/contracts"
import { SimpleAccountObject } from "src/lib/types"

const initialAccountName = ref("")
const accountObjects = reactive<{ [key:string]:SimpleAccountObject | null }>({})
const accountNames = ref<string[]>([])

const fetchAccountInfo = async(accountName:string) => {
  try {
    const fullAccountData = await getAccInfo(accountName)
    accountObjects[accountName] = {
      account_name: fullAccountData.account_name.toString(),
      permissions: fullAccountData.permissions
    }
  } catch (error) {
    console.error("Error fetching account data:", error)
    accountObjects[accountName] = null
  }
}

const fetchInitialAccountInfo = async() => {
  if (initialAccountName.value) {
    await handleAccountClick(initialAccountName.value)
  }
}

const handleAccountClick = async(accountName:string) => {
  if (!accountNames.value.includes(accountName)) {
    accountNames.value.push(accountName)
    await fetchAccountInfo(accountName)
  }
}
</script>

