# CA Metadata Model

Module EA normalizes public KRC-20 issue-mode CA data into small objects that real dapps can use.

## EntitlementAsset

```text
network
ca
displayId
name
decimals
mode
state
issuerAddress
maxRaw
limitRaw
preRaw
mintedRaw
burnedRaw
totalSupplyRaw
totalBurnedRaw
holderTotal
transferTotal
mintTotal
opScoreAdd
opScoreMod
hashRev
knownTokenDepotIssued
registryPurpose
```

## EntitlementHolding

```text
network
walletAddress
ca
name
balanceRaw
balanceDisplay
lockedRaw
decimals
opScoreMod
knownTokenDepotIssued
registryPurpose
entitlementStatus
```

## Trust rule

The public API reports metadata and balances. Token Depot-issued status is assigned only by the Token Depot known-CA registry, not by public metadata alone.

## Amount handling

Raw token amounts are strings. App logic must avoid floating-point math for raw balances. Use `BigInt` or strings internally, and format display amounts only for UI.
