
import { defineStore } from "pinia"
import { Signer } from "src/lib/types"
export const useSignersStore = defineStore("signers", {
  state: () => ({
    signers: [
      { actor: "boid.animus", permission: "active" },
      { actor: "imjohnatboid", permission: "active" }
      // ... other default signers ...
    ] as Signer[]
  }),
  getters: {
    signersState: (state) => state.signers
  },
  actions: {
    addSigner(actor:string, permission:string) {
      this.signers.push({ actor, permission })
    },
    removeSigner(index:number) {
      this.signers.splice(index, 1)
    },
    setSigners(signers:{ actor:string; permission:string }[]) {
      this.signers = signers
    }
  }
})
