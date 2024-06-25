# multisignature-ui

```
yarn install
```

```
yarn quasar dev
```


## how changing chain and url works
apiStore.ts
- chainUrls and hyperionUrls take default data from config.ts
- we can run a getUrlForChain to return an active url on that chain
- we can update the chain url using updateChainUrl action

|
|
\/

sessionStore.ts
has a default chainUrl setup as Telos Mainnet
it uses session.ts file where sessionKit is setup with all of the chains and chain urls that are taken from the apiStore.ts

contractStore.ts
uses BlockchainManager class that creates a new object when run with the latest sessionStore chainUrl
