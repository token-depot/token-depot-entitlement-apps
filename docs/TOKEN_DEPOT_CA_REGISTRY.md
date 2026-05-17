# Token Depot CA Registry

Token Depot-issued status is a registry label, not an assumption made from public metadata.

The first public registry is:

```text
fixtures/token-depot-known-cas.json
```

The apps can inspect any CA, but only CAs listed in the registry are labeled as Token Depot-known.

## Current mainnet entries

| Name | CA | Decimals | Purpose |
| --- | --- | ---: | --- |
| TDUSDC | `6f685f85d679d5b7b5d702ebe4a249fb31ddc9edbb7c9f49971daef7cc7fe48f` | 6 | Token Depot wrapped/demo entitlement |
| MMXXVI | `2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc` | 0 | Token Depot license / membership entitlement |

## Registry checks

A dapp should:

1. Normalize the CA.
2. Fetch public metadata.
3. Look up the normalized CA in the registry.
4. Show public metadata even when the CA is not in the registry.
5. Label a token as Token Depot-known only when the registry contains that CA.
