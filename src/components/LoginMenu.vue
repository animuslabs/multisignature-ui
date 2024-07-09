<template>
  <div class="q-pa-md login-menu">
    <div class="row no-wrap">
      <div class="fit column content-center">
        <div class="fit column login-actions">
          <div class="q-mb-xs">
            <q-badge
              v-if="whatChain"
              color="primary"
              :label="whatChain"
            />
          </div>
          <div>
            <q-avatar v-if="chainLogo">
              <img style="height: 50px; width: 50px" :src="chainLogo.toString()" class="avatar-image">
            </q-avatar>
          </div>
          <div class="col text-subtitle1 q-mt-xs q-mb-xs q-mr-xs">
            {{ loggedAccount || 'Not Logged In' }}
          </div>
        </div>
        <div class="fit column content-center login-actions">
          <div class="overflow: auto;">
            <q-btn
              :color="isLoggedIn ? 'negative' : 'primary'"
              :label="isLoggedIn ? 'Logout' : 'Login'"
              push
              size="md"
              dense
              class="q-mt-md q-mb-sm"
              @click="isLoggedIn ? logout() : login()"
            />
          </div>
          <div class="overflow: auto;">
            <q-btn-dropdown
              ref="chainDropdown"
              label="Switch Chain"
              color="primary"
              push
              size="md"
              dense
              no-caps
            >
              <q-list>
                <q-item
                  v-for="chain in chainOptions"
                  :key="chain.value"
                  clickable
                  @click="switchChain(chain)"
                >
                  <q-item-section>{{ chain.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue"
import { useSessionStore } from "src/stores/sessionStore"
import { useApiStore } from "src/stores/apiStore"
import { useRouter, useRoute } from "vue-router"

export default defineComponent({
  name: "LoginMenu",
  setup() {
    const sessionStore = useSessionStore()
    const apiStore = useApiStore()
    const router = useRouter()
    const route = useRoute()
    const whatChain = ref(apiStore.activeChain)
    const isLoggedIn = computed(() => sessionStore.isLoggedIn(whatChain.value))
    const chainLogo = computed(() => sessionStore.getSession(whatChain.value)?.chain.getLogo() || "")
    const loggedAccount = computed(() => sessionStore.getSession(whatChain.value)?.actor)
    const selectedChain = ref()
    const chainDropdown = ref()

    const chainOptions = [
      { label: "EOS", value: "eos" },
      { label: "Telos", value: "telos" },
      { label: "Telos Testnet", value: "telostestnet" }
    ]

    const switchChain = async(chain:{ label:string, value:string }) => {
      try {
        console.log("Switching to chain:", chain.value)
        const currentPathType = route.path.split("/")[1] // Assumes paths are like /contract/eos
        const newPath = `/${currentPathType}/${chain.value}`
        apiStore.setActiveChain(chain.value)
        await router.push(newPath)
        if (chainDropdown.value) {
          chainDropdown.value.hide()
        }
        await sessionStore.renew(chain.value) // Renew session for the new chain
      } catch (error) {
        console.error(`Failed to switch to chain: ${chain.value}`, error)
        if (chainDropdown.value) {
          chainDropdown.value.hide()
        }
      }
    }


    const login = async() => {
      await sessionStore.login(whatChain.value)
    }

    const logout = async() => {
      await sessionStore.logout(whatChain.value)
    }

    // Watch for changes in the active chain
    watch(() => apiStore.activeChain, (newChain) => {
      whatChain.value = newChain
      // You might want to force refresh or re-fetch data here
    }, { immediate: true })


    return {
      whatChain,
      isLoggedIn,
      chainLogo,
      loggedAccount,
      login,
      logout,
      switchChain,
      selectedChain,
      chainOptions
    }
  }
})
</script>

<style scoped>
.login-menu {
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-image {
  height: 50px;
  width: 50px;
}
.login-details {
  flex-grow: 1;
}
.login-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
