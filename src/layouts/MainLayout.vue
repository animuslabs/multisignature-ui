<template>
  <q-layout view="hhh lpR fff">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn
            @click="$router.push('/')"
            flat
          >
            Multi Sign APP
          </q-btn>
        </q-toolbar-title>
        <div class="q-gutter-md">
          <q-btn
            @click="$router.push('/contract')"
            flat
          >
            Contract
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
import { defineComponent, onMounted } from "vue"
import { useSessionStore } from "src/stores/sessionStore"
import LoginMenu from "src/components/LoginMenu.vue"
export default defineComponent({
  name: "MainLayout",
  components: {
    LoginMenu
  },
  setup() {
    const sessionStore = useSessionStore()
    onMounted(async() => {
      await sessionStore.renew()
    })
    return {
      LoginMenu
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
