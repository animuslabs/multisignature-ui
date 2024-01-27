<template>
  <q-uploader
    label="Upload WASM File"
    @added="onWasmFileAdded"
    @removed="onWasmFileRemoved"
    :hide-upload-button="true"
    accept=".wasm"
  />
</template>

<script setup lang="ts">
import { QUploader } from "quasar"

const emit = defineEmits(["wasm-converted", "wasm-removed"])

function onWasmFileAdded(uploadedFiles:readonly File[]) {
  const file = uploadedFiles[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const arrayBuffer = e.target.result as ArrayBuffer
        const hexString = arrayBufferToHexString(arrayBuffer)
        // console.log("WASM file converted to hex string:", hexString)
        emit("wasm-converted", hexString)
      }
    }
    reader.readAsArrayBuffer(file)
  }
}

function arrayBufferToHexString(buffer:ArrayBuffer):string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}
function onWasmFileRemoved() {
  emit("wasm-removed")
}
</script>
