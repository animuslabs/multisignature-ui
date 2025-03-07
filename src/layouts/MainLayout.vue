<template>
  <q-layout view="hhh lpR fff">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn
            @click="navigateToHome"
            flat
          >
            <q-avatar><img src="/Antelope-Logo.png"></q-avatar>
          </q-btn>
        </q-toolbar-title>
        <div class="q-gutter-md">
          <!-- Updated Navigation Buttons to Include Chain Context -->
          <q-btn
            @click="navigate('/m-sign')"
            flat
          >
            M-Sign
          </q-btn>
          <q-btn
            @click="navigate('/accmap')"
            flat
          >
            Acc Map
          </q-btn>
          <q-btn
            @click="navigate('/contract')"
            flat
          >
            Contract
          </q-btn>
          <q-btn
            @click="navigate('/proposals')"
            flat
          >
            Proposals
          </q-btn>
          <q-btn
            @click="navigate('/create-acc')"
            flat
          >
            Create Acc
          </q-btn>
          <!-- Dropdown Button for LoginMenu -->
          <q-btn-dropdown icon="person" color="primary">
            <LoginMenu />
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer
      reveal
      bordered
      class="bg-black text-white"
    >
      <q-toolbar class="footer-class">
        <div>
          <a href="https://boid.com">
            <img
              src="../assets/logo.png"
              alt=""
            >
          </a>
        </div>
        <div>
          <a href="https://www.animus.is/">
            <img
              src="../assets/animus-logo-small.png"
              alt=""
            >
          </a>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref, watch } from "vue"
import { useSessionStore } from "src/stores/sessionStore"
import { useRoute, useRouter } from "vue-router"
import LoginMenu from "src/components/LoginMenu.vue"

export default defineComponent({
  name: "MainLayout",
  components: {
    LoginMenu
  },
  setup() {
    const sessionStore = useSessionStore()
    const router = useRouter()
    const route = useRoute()
    const currentChain = ref(route.params.chain || "eos") // Default to 'eos' or logic to determine default

    // Watch for changes in route params and update currentChain accordingly
    watch(() => route.params.chain, (newChain) => {
      currentChain.value = newChain || "eos"
    })

    async function navigate(path:string) {
      // Append the current chain to the path dynamically
      const fullPath = `${path}/${currentChain.value}`
      try {
        await router.push(fullPath)
      } catch (error) {
        console.error("Failed to navigate:", error)
      }
    }

    async function navigateToHome() {
      // Navigate to the home (start page) of the current chain
      try {
        await router.push(`/m-sign/${currentChain.value}`)
      } catch (error) {
        console.error("Failed to navigate to home:", error)
      }
    }

    onMounted(async() => {
      // Potentially renew session based on the current chain
      await sessionStore.renew(currentChain.value.toString())
    })

    return {
      navigate,
      navigateToHome
    }
  }
})
</script>

<style>
.border-bottom {
  border-bottom: 1px solid var(--secondary);
}

.flex-wrap {
  display: flex;
  flex-wrap: wrap;
}
.order-inventory,
  .order-mint,
  .order-lore,
  .font-bold {
    font-weight: bold;
  }
.order-avatar {
  order: 1;
}

.order-inventory {
  order: 3;
}

.order-mint {
  order: 2;
}

.order-lore {
  order: 4;
}
.order-login {
  order: 5;
}
.order-logged-in {
  order: 6;
}

.toolbar-content {
  display: flex;
  flex-wrap: wrap;
}

.footer-class {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.footer-class div {
  flex: 0 0 auto;
  /* margin: 15px; */
}

.footer-class img {
  width: 50px;
  height: auto;
  /* filter: invert(54%) sepia(85%) saturate(4500%) hue-rotate(267deg) brightness(78%) contrast(62%); */
}

@media screen and (max-width: 480px) {
  .toolbar-content {
    flex-wrap: wrap;
  }

  .order-avatar {
    width: 33%;
    text-align: center;
    order: 1;

  }

  .order-inventory {
    order: 3;
    width: 33%;
    text-align: right;

  }

  .order-mint {
    order: 2;
    width: 33%;
    text-align: right;
  }

  .order-lore {
    order: 4;
    width: 50%;
    text-align: center;
  }

  .order-login {
    order: 5;
    width: 50%;
    text-align: center;
  }

  .order-logged-in {
    order: 5;
    width: 50%;
    text-align: center;
  }

  .footer-class {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    justify-items: center;
  }

  .footer-class div {
    width: auto;
    flex-grow: 0;
  }

  .footer-class div:nth-child(n+4) {
    grid-row: 1;
  }
}
</style>
