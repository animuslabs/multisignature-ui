import type { Action, Checksum256Type, NameType } from "@wharfkit/antelope"
import {
  ABI,
  Blob,
  Bytes,
  Checksum256,
  Name,
  Struct,
  TimePoint,
  TimePointSec,
  UInt16,
  UInt32,
  UInt8,
  VarUInt
} from "@wharfkit/antelope"
import type { ActionOptions, ContractArgs, PartialBy, Table } from "@wharfkit/contract"
import { Contract as BaseContract } from "@wharfkit/contract"
export const abiBlob = Blob.from(
  "DmVvc2lvOjphYmkvMS4yABAGYWN0aW9uAAQHYWNjb3VudARuYW1lBG5hbWUEbmFtZQ1hdXRob3JpemF0aW9uEnBlcm1pc3Npb25fbGV2ZWxbXQRkYXRhBWJ5dGVzCGFwcHJvdmFsAAIFbGV2ZWwQcGVybWlzc2lvbl9sZXZlbAR0aW1lCnRpbWVfcG9pbnQOYXBwcm92YWxzX2luZm8ABAd2ZXJzaW9uBXVpbnQ4DXByb3Bvc2FsX25hbWUEbmFtZRNyZXF1ZXN0ZWRfYXBwcm92YWxzCmFwcHJvdmFsW10ScHJvdmlkZWRfYXBwcm92YWxzCmFwcHJvdmFsW10HYXBwcm92ZQAECHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lBWxldmVsEHBlcm1pc3Npb25fbGV2ZWwNcHJvcG9zYWxfaGFzaAxjaGVja3N1bTI1NiQGY2FuY2VsAAMIcHJvcG9zZXIEbmFtZQ1wcm9wb3NhbF9uYW1lBG5hbWUIY2FuY2VsZXIEbmFtZQRleGVjAAMIcHJvcG9zZXIEbmFtZQ1wcm9wb3NhbF9uYW1lBG5hbWUIZXhlY3V0ZXIEbmFtZQlleHRlbnNpb24AAgR0eXBlBnVpbnQxNgRkYXRhBWJ5dGVzCmludmFsaWRhdGUAAQdhY2NvdW50BG5hbWUMaW52YWxpZGF0aW9uAAIHYWNjb3VudARuYW1lFmxhc3RfaW52YWxpZGF0aW9uX3RpbWUKdGltZV9wb2ludBJvbGRfYXBwcm92YWxzX2luZm8AAw1wcm9wb3NhbF9uYW1lBG5hbWUTcmVxdWVzdGVkX2FwcHJvdmFscxJwZXJtaXNzaW9uX2xldmVsW10ScHJvdmlkZWRfYXBwcm92YWxzEnBlcm1pc3Npb25fbGV2ZWxbXRBwZXJtaXNzaW9uX2xldmVsAAIFYWN0b3IEbmFtZQpwZXJtaXNzaW9uBG5hbWUIcHJvcG9zYWwAAw1wcm9wb3NhbF9uYW1lBG5hbWUScGFja2VkX3RyYW5zYWN0aW9uBWJ5dGVzEmVhcmxpZXN0X2V4ZWNfdGltZQx0aW1lX3BvaW50PyQHcHJvcG9zZQAECHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lCXJlcXVlc3RlZBJwZXJtaXNzaW9uX2xldmVsW10DdHJ4C3RyYW5zYWN0aW9uC3RyYW5zYWN0aW9uEnRyYW5zYWN0aW9uX2hlYWRlcgMUY29udGV4dF9mcmVlX2FjdGlvbnMIYWN0aW9uW10HYWN0aW9ucwhhY3Rpb25bXRZ0cmFuc2FjdGlvbl9leHRlbnNpb25zC2V4dGVuc2lvbltdEnRyYW5zYWN0aW9uX2hlYWRlcgAGCmV4cGlyYXRpb24OdGltZV9wb2ludF9zZWMNcmVmX2Jsb2NrX251bQZ1aW50MTYQcmVmX2Jsb2NrX3ByZWZpeAZ1aW50MzITbWF4X25ldF91c2FnZV93b3Jkcwl2YXJ1aW50MzIQbWF4X2NwdV91c2FnZV9tcwV1aW50OAlkZWxheV9zZWMJdmFydWludDMyCXVuYXBwcm92ZQADCHByb3Bvc2VyBG5hbWUNcHJvcG9zYWxfbmFtZQRuYW1lBWxldmVsEHBlcm1pc3Npb25fbGV2ZWwGAAAAQG16azUHYXBwcm92ZQAAAAAARIWmQQZjYW5jZWwAAAAAAACAVFcEZXhlYwAAgMomuWj2dAppbnZhbGlkYXRlAAAAAEBhWumtB3Byb3Bvc2UAAABQm95azdQJdW5hcHByb3ZlAAQAAMDRbHprNQNpNjQAABJvbGRfYXBwcm92YWxzX2luZm8AgMDRbHprNQNpNjQAAA5hcHByb3ZhbHNfaW5mbwAAAADgaPZ0A2k2NAAADGludmFsaWRhdGlvbgAAANFgWumtA2k2NAAACHByb3Bvc2FsAAAAAAA="
)
export const abi = ABI.from(abiBlob)
export class Contract extends BaseContract {
  constructor(args:PartialBy<ContractArgs, "abi" | "account">) {
    super({
      client: args.client,
      abi,
      account: Name.from("eosio.msig")
    })
  }

  action<T extends ActionNames>(
    name:T,
    data:ActionNameParams[T],
    options?:ActionOptions
  ):Action {
    return super.action(name, data, options)
  }

  table<T extends TableNames>(name:T, scope?:NameType):Table<RowType<T>> {
    return super.table(name, scope, TableMap[name])
  }
}
export interface ActionNameParams {
    approve:ActionParams.Approve
    cancel:ActionParams.Cancel
    exec:ActionParams.Exec
    invalidate:ActionParams.Invalidate
    propose:ActionParams.Propose
    unapprove:ActionParams.Unapprove
}
export namespace ActionParams {
    export interface Approve {
        proposer:NameType
        proposal_name:NameType
        level:Types.permission_level
        proposal_hash?:Checksum256Type
    }
    export interface Cancel {
        proposer:NameType
        proposal_name:NameType
        canceler:NameType
    }
    export interface Exec {
        proposer:NameType
        proposal_name:NameType
        executer:NameType
    }
    export interface Invalidate {
        account:NameType
    }
    export interface Propose {
        proposer:NameType
        proposal_name:NameType
        requested:Types.permission_level[]
        trx:Types.transaction
    }
    export interface Unapprove {
        proposer:NameType
        proposal_name:NameType
        level:Types.permission_level
    }
}
export namespace Types {
    @Struct.type("permission_level")
    export class permission_level extends Struct {
        @Struct.field(Name)
          actor!:Name

        @Struct.field(Name)
          permission!:Name
    }
    @Struct.type("action")
    export class action extends Struct {
        @Struct.field(Name)
          account!:Name

        @Struct.field(Name)
          name!:Name

        @Struct.field(permission_level, { array: true })
          authorization!:permission_level[]

        @Struct.field(Bytes)
          data!:Bytes
    }
    @Struct.type("approval")
    export class approval extends Struct {
        @Struct.field(permission_level)
          level!:permission_level

        @Struct.field(TimePoint)
          time!:TimePoint
    }
    @Struct.type("approvals_info")
    export class approvals_info extends Struct {
        @Struct.field(UInt8)
          version!:UInt8

        @Struct.field(Name)
          proposal_name!:Name

        @Struct.field(approval, { array: true })
          requested_approvals!:approval[]

        @Struct.field(approval, { array: true })
          provided_approvals!:approval[]
    }
    @Struct.type("approve")
    export class approve extends Struct {
        @Struct.field(Name)
          proposer!:Name

        @Struct.field(Name)
          proposal_name!:Name

        @Struct.field(permission_level)
          level!:permission_level

        @Struct.field(Checksum256, { optional: true })
          proposal_hash?:Checksum256
    }
    @Struct.type("cancel")
    export class cancel extends Struct {
        @Struct.field(Name)
          proposer!:Name

        @Struct.field(Name)
          proposal_name!:Name

        @Struct.field(Name)
          canceler!:Name
    }
    @Struct.type("exec")
    export class exec extends Struct {
        @Struct.field(Name)
          proposer!:Name

        @Struct.field(Name)
          proposal_name!:Name

        @Struct.field(Name)
          executer!:Name
    }
    @Struct.type("extension")
    export class extension extends Struct {
        @Struct.field(UInt16)
          type!:UInt16

        @Struct.field(Bytes)
          data!:Bytes
    }
    @Struct.type("invalidate")
    export class invalidate extends Struct {
        @Struct.field(Name)
          account!:Name
    }
    @Struct.type("invalidation")
    export class invalidation extends Struct {
        @Struct.field(Name)
          account!:Name

        @Struct.field(TimePoint)
          last_invalidation_time!:TimePoint
    }
    @Struct.type("old_approvals_info")
    export class old_approvals_info extends Struct {
        @Struct.field(Name)
          proposal_name!:Name

        @Struct.field(permission_level, { array: true })
          requested_approvals!:permission_level[]

        @Struct.field(permission_level, { array: true })
          provided_approvals!:permission_level[]
    }
    @Struct.type("proposal")
    export class proposal extends Struct {
        @Struct.field(Name)
          proposal_name!:Name

        @Struct.field(Bytes)
          packed_transaction!:Bytes

        @Struct.field(TimePoint, { optional: true })
          earliest_exec_time?:TimePoint
    }
    @Struct.type("transaction_header")
    export class transaction_header extends Struct {
        @Struct.field(TimePointSec)
          expiration!:TimePointSec

        @Struct.field(UInt16)
          ref_block_num!:UInt16

        @Struct.field(UInt32)
          ref_block_prefix!:UInt32

        @Struct.field(VarUInt)
          max_net_usage_words!:VarUInt

        @Struct.field(UInt8)
          max_cpu_usage_ms!:UInt8

        @Struct.field(VarUInt)
          delay_sec!:VarUInt
    }
    @Struct.type("transaction")
    export class transaction extends transaction_header {
        @Struct.field(action, { array: true })
          context_free_actions!:action[]

        @Struct.field(action, { array: true })
          actions!:action[]

        @Struct.field(extension, { array: true })
          transaction_extensions!:extension[]
    }
    @Struct.type("propose")
    export class propose extends Struct {
        @Struct.field(Name)
          proposer!:Name

        @Struct.field(Name)
          proposal_name!:Name

        @Struct.field(permission_level, { array: true })
          requested!:permission_level[]

        @Struct.field(transaction)
          trx!:transaction
    }
    @Struct.type("unapprove")
    export class unapprove extends Struct {
        @Struct.field(Name)
          proposer!:Name

        @Struct.field(Name)
          proposal_name!:Name

        @Struct.field(permission_level)
          level!:permission_level
    }
}
export const TableMap = {
  approvals: Types.old_approvals_info,
  approvals2: Types.approvals_info,
  invals: Types.invalidation,
  proposal: Types.proposal
}
export interface TableTypes {
    approvals:Types.old_approvals_info
    approvals2:Types.approvals_info
    invals:Types.invalidation
    proposal:Types.proposal
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any
export type ActionNames = keyof ActionNameParams
export type TableNames = keyof TableTypes
