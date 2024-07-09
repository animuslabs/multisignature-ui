import { Bytes, Name, ABI, Serializer } from "@wharfkit/antelope"
import axios from "axios"
import { ApiResponse } from "src/lib/types"
import { getABI } from "src/lib/contracts"

export async function bytesToJson<T>(bytes:Bytes):Promise<T> {
  try {
    // Check if bytes are empty
    if (bytes.length === 0) {
      console.warn("Empty bytes, returning default value.")
      return {} as T // Return an empty object (or a more appropriate default value)
    }

    // Decode bytes to string
    const decoder = new TextDecoder() // Assumes UTF-8 encoding
    const jsonString = decoder.decode(bytes.array)

    // Parse string to JSON
    const data = JSON.parse(jsonString)

    return data
  } catch (error:any) {
    console.error("Error converting bytes to JSON:", error)
    throw new Error("Error converting bytes to JSON: " + error.message)
  }
}
export function stringToBytes(str:string):Bytes {
  return Bytes.fromString(str, "utf8")
}

// Method to convert Uint8Array to comma-separated string
export const arrayToString = (array:Uint8Array) => {
  return Array.from(array).join(", ")
}

export function generateRandomName():Name {
  const characters = "abcdefghijklmnopqrstuvwxyz12345"
  let result = ""

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters[randomIndex]
  }

  return Name.from(result)
}

function getFutureDate(days:number):string {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() + days)

  // Ensuring the date format is YYYY-MM-DD
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, "0")
  const day = String(currentDate.getDate()).padStart(2, "0")

  const futureDate = `${year}-${month}-${day}T00:00:00`
  return futureDate
}

// Example usage: Get date 14 days in the future
export const expDate:string = getFutureDate(14)


// serialization of actions for transaction
export function serializeActionData(action:any, abi:ABI) {
  try {
    // Ensure action and ABI are provided
    if (!action || !abi) {
      throw new Error("Action or ABI is missing for serialization")
    }
    return Serializer.encode({ object: action.data, abi, type: action.name })
  } catch (error) {
    console.error("Error serializing action data:", error)
    throw error
  }
}

export const formatTime = (time:string):string => {
  // Create a new Date object from the input time string
  const date = new Date(time)

  // Extract the individual components of the date and time
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0") // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  // Format the date and time components as desired
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export const getProposalsDataHyperion = async(
  url:string,
  executed?:boolean,
  proposal?:string,
  proposer?:string,
  account?:string,
  reqAcc?:string,
  providedAcc?:string
):Promise<ApiResponse> => {
  try {
    // Prepare query parameters dynamically
    const params = new URLSearchParams()

    // Append parameters only if they exist
    if (executed !== undefined) params.append("executed", executed.toString()) // Append only if executed is provided
    if (proposer) params.append("proposer", proposer)
    if (proposal) params.append("proposal", proposal)
    if (account) params.append("account", account)
    if (reqAcc) params.append("reqAcc", reqAcc)
    if (providedAcc) params.append("providedAcc", providedAcc)

    // Construct the request URL with query parameters
    const response = await axios.get(`${url}/v2/state/get_proposals?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error("Error fetching proposals data from Hyperion:", error)
    throw error // Re-throw the error to handle it further up in your application
  }
}

export const deserializeActionData = async(action:any, abiAcc:string) => {
  if (!action || !action.data || !action.name) {
    console.error("Invalid or incomplete action data provided:", action)
    throw new Error("Invalid or incomplete action data.")
  }

  console.log("Starting to fetch ABI for account:", abiAcc)
  const abiResponse = await getABI(abiAcc)
  console.log("ABI fetched:", abiResponse)

  if (!abiResponse || !abiResponse.abi) {
    throw new Error(`No ABI found for account: ${abiAcc}`)
  }

  const abi = ABI.from(abiResponse.abi)
  if (!abi) {
    throw new Error(`Failed to parse ABI for account: ${abiAcc}`)
  }
  console.log("action name:", action.name)
  const data = new Uint8Array(Buffer.from("0000000000901c3d88130000004072f4801cb5d9", "hex"))
  console.log("Decoding action data using ABI...")
  try {
    const decodedData = Serializer.decode({
      object: data,
      abi,
      type: action.name
    })
    console.log("Decoded data:", decodedData)
    return decodedData
  } catch (error) {
    console.error("Failed to decode action data:", error)
    throw error
  }
}
