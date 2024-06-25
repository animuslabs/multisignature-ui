import { API, Name } from "@wharfkit/session"

// multising signers store
export interface Signer {
  actor:string;
  permission:string;
}

export interface ActionField {
  name:string;
  type:string;
}

export interface ActionStructure {
  fields:ActionField[];
}

export interface SimpleAccountObject {
  account_name:string;
  permissions:API.v1.AccountPermission[];
}

export interface BlankAction {
  name:string;
  account:string;
  data:Record<string, string|number|object>;
  authorization:{ actor:string; permission:string }[];
}


// hyperion
export interface ApiResponse {
  query_time:string | null;
  cached:boolean;
  total:Total;
  proposals:Proposal[];
  query_time_ms:number;
  last_indexed_block:number;
  last_indexed_block_time:string;
}

interface Total {
  value:number;
  relation:"eq" | "gte";
}

interface Proposal {
  provided_approvals:Approval[];
  block_num:number;
  proposer:string;
  requested_approvals:Approval[];
  executed:boolean;
  proposal_name:string;
  primary_key:string;
}

interface Approval {
  actor:string;
  permission:string;
  time:string; // ISO date string
}
