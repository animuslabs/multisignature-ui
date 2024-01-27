<template>
  <q-uploader
    label="Upload ABI File"
    @added="onAbiFileAdded"
    @removed="onAbiFileRemoved"
    :hide-upload-button="true"
    accept=".abi"
  />
</template>

<script setup lang="ts">
import { defineEmits } from "vue"
import jsonToRawAbi from "src/lib/jsonToRawAbi"
import { Bytes } from "@wharfkit/antelope"

const emit = defineEmits(["abi-converted", "abi-removed"])

function onAbiFileAdded(uploadedFiles:readonly File[]) {
  const file = uploadedFiles[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        const serializedAbi = serializeAbi(json)
        if (serializedAbi) {
          console.log("ABI file converted to hex string:", serializedAbi)
          emit("abi-converted", serializedAbi)
        } else {
          console.error("Failed to serialize ABI")
        }
      } catch (error) {
        console.error("Error parsing ABI file:", error)
      }
    }
    reader.readAsText(file)
  }
}

function serializeAbi(json:any):Bytes | null {
  const serializedAbi = jsonToRawAbi(json)
  return serializedAbi || null
}

function onAbiFileRemoved() {
  emit("abi-removed")
}
</script>
