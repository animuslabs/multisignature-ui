export const contractName = "boid"
export interface NetworkConfig {
  name:string
  chainId:string
  nodeUrl:string
  logo:string
}

interface Endpoint {
  name:string;
  url:string;
}

export interface ChainEndpoints {
  chain:string;
  endpoints:Endpoint[];
}

export const chainEndpoints:ChainEndpoints[] = [
  {
    chain: "eos",
    endpoints: [
      { name: "Boid BP", url: "https://eos.api.boid.animus.is" },
      { name: "EOSphere", url: "https://eos.eosphere.io" },
      { name: "EOS Nation", url: "https://eos.api.eosnation.io" },
      { name: "EOS Amsterdam", url: "https://mainnet.eosamsterdam.net" },
      { name: "EOSeoul", url: "https://api.eoseoul.io" }
    ]
  },
  {
    chain: "telos",
    endpoints: [
      { name: "Boid BP", url: "https://telos.api.boid.animus.is" },
      { name: "EOSphere", url: "https://telos.eosphere.io" },
      { name: "EOS Nation", url: "https://telos.api.eosnation.io" },
      { name: "Caleos", url: "https://telos.caleos.io" },
      { name: "EOS Dublin", url: "https://telos.eosdublin.io" }
    ]
  },
  {
    chain: "telostestnet",
    endpoints: [
      { name: "Boid BP", url: "https://telos.testnet.boid.animus.is" },
      { name: "EOSphere", url: "https://telos-testnet.eosphere.io" },
      { name: "EOS Nation", url: "https://telostest.api.eosnation.io" },
      { name: "Teleology One", url: "https://testnet.telos.teleology.one" }
    ]
  }
  // {
  //   chain: "wax",
  //   endpoints: [
  //     { name: "AlohaWAX", url: "https://api.wax.alohaeos.com" }
  //   ]
  // }
]


export const hyperionEndpoints:ChainEndpoints[] = [
  {
    chain: "telos",
    endpoints: [
      { name: "Telos Madrid", url: "https://hyperion.telosmadrid.io" },
      { name: "Boid BP", url: "https://hyperion.telos.animus.is" },
      { name: "Telos Unlimited", url: "https://hyperion.telosunlimited.io" },
      { name: "Telos Arabia", url: "https://api.telosarabia.net" },
      { name: "EOSUSA", url: "https://telos.eosusa.io" },
      { name: "eoSphere", url: "https://telos.eosphere.io" },
      { name: "Kainos BP", url: "https://api.kainosbp.com" }
    ]
  },
  {
    chain: "eos",
    endpoints: [
      { name: "EOSUSA", url: "https://eos.eosusa.io" }
    ]
  },
  {
    chain: "telostestnet",
    endpoints: [
      { name: "Boid BP", url: "https://hyperion.telos-testnet.animus.is" },
      { name: "Telos Teleology", url: "https://telos.teleology.one:343" }
    ]
  }
  // {
  //   chain: "wax",
  //   endpoints: [
  //     { name: "LedgerWise", url: "http://waxapi.ledgerwise.io" },
  //     { name: "AlohaEOS", url: "http://api.wax.alohaeos.com" },
  //     { name: "EOS Arabia", url: "http://api-wax.eosarabia.net" },
  //     { name: "CryptoLions", url: "http://wax.cryptolions.io" }
  //   ]
  // }
]

export const networks:NetworkConfig[] = [
  // default network should be first!!!
  {
    name: "telos",
    chainId: "4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11",
    nodeUrl: "", // value is managed by the apiStore
    logo: "/Telos-circle.png"
  },
  {
    name: "telostestnet",
    chainId: "1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f",
    nodeUrl: "", // value is managed by the apiStore
    logo: "/Telos-circle.png"
  },
  {
    name: "eos",
    chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
    nodeUrl: "", // value is managed by the apiStore
    logo: "https://bloks.io/img/chains/eos.png"
  }
  // {
  //   name: "wax",
  //   chainId: "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
  //   nodeUrl: "", // value is managed by the apiStore
  //   logo: "https://wax.bloks.io/img/chains/wax.png"
  // }
]

export function getNetworkByChainId(chainId:string):NetworkConfig {
  const network = networks.find((n) => n.chainId === chainId)
  if (!network) {
    throw new Error(`No network found for chainId ${chainId}`)
  }
  return network
}

export function activeNetwork():NetworkConfig {
  if (networks[0] === undefined) {
    throw new Error("No networks defined")
  }
  return networks[0]
}

export const predefinedActions = [
  //add key [0]
  [{
    account: "eosio",
    name: "updateauth",
    data: {
      account: "testaccount1",
      permission: "active",
      parent: "owner",
      auth: {
        threshold: 1,
        keys: [{ key: "EOS8d9DmipxtKRK5cpWZnGdE8yKQMhfLuCsoiSaSXgk68eLJmBnBc", weight: 1 }],
        accounts: [],
        waits: []
      }
    },
    authorization: [{ actor: "testaccount1", permission: "active" }]
  }],
  // vote for producers on Telos [1]
  [{
    account: "eosio",
    name: "voteproducer",
    data: {
      voter: "testaccount1",
      proxy: "",
      producers: "[amsterdam, argentinatls, bp.boid, caleosblocks, eosauthority, eosiodetroit, eosphereiobp, eosriobrazil, fortisblocks, goodblocktls, kainosblkpro, katalyotelos, nation.tlos, persiantelos, southafrica1, teamgreymass, teleologytls, telosarabia1, teloscentral, telosglobal1, telosgreenbp, telosuknodes, telosunlimit, theteloscope, votetelosusa]"
    },
    authorization: [{ actor: "testaccount1", permission: "active" }]
  }],
  // payroll [2]
  [{
    account: "payroll.boid",
    name: "pay",
    data: {
      pay_id: 174
    },
    authorization: [{ actor: "testaccount1", permission: "active" }]
  }],
  // make an ibc transfer from eos to telos [3]
  [{
    account: "ibc.wt.tlos",
    name: "retire",
    data: { beneficiary: "testaccount1", owner: "testaccount1", quantity: "2487.0056 TLOS" },
    authorization: [{ actor: "testaccount1", permission: "active" }]
  }],
  // create new account [4]
  [
    {
      account: "eosio",
      name: "newaccount",
      data: {
        creator: "boid",
        name: "animus1.boid",
        owner: {
          accounts: [],
          keys: [
            {
              key: "EOS53eZ7vvu54zkxLeHKGXW8jqMPfrp4C8YPULMQtrRZ6zh2Hm4cz",
              weight: 1
            }
          ],
          waits: [],
          threshold: 1
        },
        active: {
          accounts: [],
          keys: [
            {
              key: "EOS53eZ7vvu54zkxLeHKGXW8jqMPfrp4C8YPULMQtrRZ6zh2Hm4cz",
              weight: 1
            }
          ],
          waits: [],
          threshold: 1
        }
      },
      authorization: [
        {
          actor: "boid",
          permission: "active"
        }
      ]
    },
    {
      account: "eosio",
      name: "buyrambytes",
      data: {
        payer: "boid",
        receiver: "animus1.boid",
        bytes: 11000000
      },
      authorization: [
        {
          actor: "boid",
          permission: "active"
        }
      ]
    },
    {
      account: "eosio",
      name: "delegatebw",
      data: {
        from: "boid",
        receiver: "animus1.boid",
        stake_net_quantity: "1000.0000 GPU",
        stake_cpu_quantity: "1000.0000 GPU",
        transfer: true
      },
      authorization: [
        {
          actor: "boid",
          permission: "active"
        }
      ]
    }
  ]
]
export const actionDisplayNames = [
  "Update Auth - Add Key",
  "vote for producers on Telos",
  "payroll",
  "make an ibc transfer from eos to telos",
  "create new account"
]
