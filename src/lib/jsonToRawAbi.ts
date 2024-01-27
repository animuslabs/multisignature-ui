import { Serializer, ABI, Bytes } from "@wharfkit/antelope"

const jsonToRawAbi = (json:any):Bytes | null => {
  try {
    // Assuming 'json' is the correctly formatted ABI JSON object
    const abiObject = ABI.from(json) // Convert JSON to ABI object
    const serializedAbi = Serializer.encode({ object: abiObject, type: ABI }) // Serialize ABI object
    return serializedAbi // Return serialized data as Uint8Array
  } catch (error) {
    console.error("Error serializing ABI:", error)
    return null
  }
}

export default jsonToRawAbi
