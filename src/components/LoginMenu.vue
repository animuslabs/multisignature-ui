<template>
  <div class="q-pa-md">
    <div class="row no-wrap q-pa-md">
      <div class="column items-center">
        <div class="col avatar-badge-container">
          <q-badge
            v-if="whatChain"
            color="primary"
            :label="whatChain"
          />
        </div>
        <div class="col">
          <q-avatar>
            <img v-if="chainLogo" style="height: 50px; width: 50px" :src="chainLogo.toString()" class="avatar-image">
          </q-avatar>
        </div>

        <div class="col text-subtitle1 q-mt-lg q-mb-xs q-mr-xs">
          {{ loggedAccount }}
        </div>

        <!-- Updated q-btn for login/logout -->
        <q-btn
          :color="isLoggedIn ? 'negative' : 'primary'"
          :label="isLoggedIn ? 'Logout' : 'Login'"
          push
          size="sm"
          v-close-popup
          @click="isLoggedIn ? logout() : login()"
        />
        <!-- Removed the previous q-item for login/logout -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue"
import { useSessionStore } from "src/stores/sessionStore"
import { useRouter } from "vue-router"
export default defineComponent({
  name: "LoginMenu",
  setup() {
    const sessionStore = useSessionStore()
    const isLoggedIn = computed(() => sessionStore.isLoggedIn)
    const chainLogo = computed(() => sessionStore.chainLogo || "")
    const whatChain = computed(() => sessionStore.whatChain)
    const loggedAccount = computed(() => sessionStore.session?.actor)
    const toggleState = computed({
      get: () => sessionStore.multiSignToggleState,
      set: (value) => sessionStore.setToggleState(value)
    })
    const login = async() => {
      await sessionStore.login()
    }
    const logout = async() => {
      await sessionStore.logout()
    }
    const router = useRouter()
    const goToEditSigners = async() => {
      try {
        await router.push("config/edit-signers")
      } catch (err) {
        // Handle the navigation error
        console.error("Navigation failed:", err)
      }
    }

    return {
      isLoggedIn,
      login,
      logout,
      chainLogo,
      toggleState,
      loggedAccount,
      whatChain,
      goToEditSigners
    }
  }
})
</script>

<style scoped>
  .login-menu {
    display: flex;
    align-items: center;
    /* Add your styles here */
  }
  .avatar-badge-container {
  display: flex;
  align-items: center; /* Vertically center */
  justify-content: center; /* Horizontally center */
}

.avatar-image {
  height: 50px;
  width: 50px;
}

</style>
