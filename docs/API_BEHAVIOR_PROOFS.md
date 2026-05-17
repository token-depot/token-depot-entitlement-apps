# API Behavior Proofs

This document captures the live public API behavior proven before and during the first Module EA app tests.

## Public API base

```text
mainnet: https://api.kasplex.org/v1
```

## Proved endpoint: CA metadata

```text
GET /krc20/token/{ca}
```

### TDUSDC

Input CA:

```text
6f685f85d679d5b7b5d702ebe4a249fb31ddc9edbb7c9f49971daef7cc7fe48f
```

Live proof returned:

```text
message: successful
name: TDUSDC
ca: 6f685f85d679d5b7b5d702ebe4a249fb31ddc9edbb7c9f49971daef7cc7fe48f
dec: 6
mod: issue
state: deployed
minted: 20000000
holderTotal: 1
transferTotal: 3
```

### MMXXVI

Input CA:

```text
2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc
```

Live proof returned:

```text
message: successful
name: MMXXVI
ca: 2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc
dec: 0
mod: issue
state: deployed
minted: 211
burned: 106
holderTotal: 4
transferTotal: 8
```

Runtime result:

```text
EA-1 CA Token Explorer successfully recovered MMXXVI metadata from:
https://api.kasplex.org/v1/krc20/token/2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc
```

## Proved endpoint: address token list

```text
GET /krc20/address/{address}/tokenlist
```

### Zero-balance address proof

Tested address:

```text
kaspa:pqfx3245ec4trdntqzpkj2zq2yf52amuk2uctc0kkfdzl3yttkd0x8mvyuf5d
```

Result:

```text
message: successful
result: []
```

Conclusion: tokenlist can return an empty list for a valid address with no current holdings.

### Non-zero entitlement wallet proof

Tested address:

```text
kaspa:qpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94
```

After v0.1.1 fixed address path handling, EA-2 Wallet Entitlement Viewer successfully read:

```text
https://api.kasplex.org/v1/krc20/address/kaspa:qpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94/tokenlist
```

Runtime proof returned 15 token rows:

```text
5 CA issue-mode rows
10 ticker rows
```

The CA rows included:

```text
eea25275fe4e10cb411fe630214f89c4c23fa541bdcf438d272cdc43a94dcb46  balance 51100      dec 2
b837cb95c23b2e0b04b52d31103537d833ee66727e262589a548b85fbb765661  balance 6320000    dec 6
6f685f85d679d5b7b5d702ebe4a249fb31ddc9edbb7c9f49971daef7cc7fe48f  balance 20000000   dec 6
49e89914133110d7be0c9d438bbe08775ae3b1b1c63e76b174c97523f6a8181d  balance 996994756  dec 6
2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc  balance 100        dec 0
```

Conclusion: tokenlist is the correct source for wallet-level CA entitlement discovery.

## Proved endpoint: explicit address/CA balance

```text
GET /krc20/address/{address}/token/{ca}
```

The zero-balance address returned valid explicit balance objects for TDUSDC and MMXXVI:

```text
balance: 0
locked: 0
opScoreMod: 0
```

Conclusion: explicit CA balance checks can distinguish "not held" without treating it as an API failure.

## Proved endpoint: operation list by CA

```text
GET /krc20/oplist?tick={ca}
```

MMXXVI operation history returned accepted operations with fields needed for future redemption verification:

```text
op
ca
amt
from
to
name
opScore
hashRev
txAccept
opAccept
opError
```

First returned accepted transfer:

```text
op: transfer
ca: 2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc
amt: 1
from: kaspa:qpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94
to: kaspa:qrp6qd9jx8tj3f0rsyqz04a9052dsf0u7dtf0emstjefccmucp4n5yxvz0mmw
opScore: 4293125140000
txAccept: 1
opAccept: 1
opError: empty
```

## v0.1.1 address-path fix proof

Initial EA-2 testing produced:

```text
HTTP 403 from https://api.kasplex.org/v1/krc20/address/kaspa%3Aqpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94/tokenlist
```

Root cause:

```text
Kaspa addresses must not be URI-encoded inside the Kasplex path segment.
```

Fix:

```text
shared/js/kasplex-client.js now preserves kaspa:<address> and kaspatest:<address> path strings after validating the address format.
```

Runtime result:

```text
EA-2 Wallet Entitlement Viewer works after v0.1.1.
```

## Remaining proof for future EA-4

The Merchant Redeem Verifier still needs a separate proof for:

```text
GET /krc20/op/{id}
```

The open question is whether the most reliable ID for that app should be:

```text
opScore
hashRev
reveal transaction id
```

EA-1 and EA-2 do not depend on that proof.
