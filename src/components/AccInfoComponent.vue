<template>
  <div>
    <div class="account-info">
      <strong>Account: {{ accountName }}</strong>
    </div>
    <q-toggle v-model="showKeys" label="Show Keys" class="q-mb-md" />

    <div v-if="accountObject">
      <q-table
        dense
        :rows="formattedPermissions"
        :columns="columns"
      >
        <template #body="props">
          <q-tr :props="props">
            <q-td key="permName" :props="props">
              {{ props.row.permName }}
            </q-td>
            <q-td key="threshold" :props="props">
              {{ props.row.threshold }}
            </q-td>
            <q-td key="keys" :props="props" v-if="showKeys">
              <div v-for="(key, keyIndex) in props.row.keys" :key="`key-${keyIndex}`">
                {{ key.key }} (Weight: {{ key.weight }})
              </div>
            </q-td>
            <q-td key="accounts" :props="props">
              <div v-for="(account, accountIndex) in props.row.accounts" :key="`account-${accountIndex}`">
                <q-btn flat @click="emitAccount(account.permission.actor)" class="lower-case">
                  {{ account.permission.actor }}@{{ account.permission.permission }}
                </q-btn>
              </div>
            </q-td>
            <q-td key="weight" :props="props">
              <div v-for="(account, accountIndex) in props.row.accounts" :key="`account-${accountIndex}`">
                <q-btn flat disable>
                  {{ account.weight }}
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div v-else>
      No account information available
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, computed, ref } from "vue"
import { QTable, QTableProps, QTr, QTd, QToggle } from "quasar"
import { SimpleAccountObject } from "src/lib/types"

const props = defineProps({
  accountName: String,
  accountObject: Object as () =>SimpleAccountObject | null
})
const emits = defineEmits(["accountClicked"])
const showKeys = ref(false)

const columns = computed(():QTableProps["columns"] => {
  const cols:QTableProps["columns"] = [
    { name: "permName", label: "Perm Name", field: "permName", align: "left" },
    { name: "threshold", label: "Threshold", field: "threshold", align: "left" },
    { name: "accounts", label: "Accounts", field: "accounts", align: "left" },
    { name: "weight", label: "Weight", field: "weight", align: "left" }
  ]

  if (showKeys.value) {
    cols.splice(2, 0, { name: "keys", label: "Keys", field: "keys", align: "left" })
  }

  return cols
})

const emitAccount = (accountName:string) => {
  emits("accountClicked", accountName)
}

const formattedPermissions = computed(() => {
  return props.accountObject?.permissions.map(permission => ({
    permName: permission.perm_name,
    threshold: permission.required_auth.threshold,
    keys: permission.required_auth.keys,
    accounts: permission.required_auth.accounts
  })) || []
})
</script>
<style scoped>
.account-info {
  background-color: rgb(211, 211, 211); /* Add a gray background color */
  color: rgb(5, 172, 5); /* Change the text color to green */
  padding: 10px; /* Optional: Add padding for spacing */
}

.lower-case {
  text-transform: lowercase; /* Transform the text to lowercase */
}
</style>
