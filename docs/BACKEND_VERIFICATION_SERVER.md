# EA-5 — Backend Verification Server

EA-5 shows how a real dapp should move entitlement and redemption checks server-side.

The browser demos are useful for learning, but frontend-only access checks can be bypassed. A production dapp should verify the public KRC-20 proof on a backend before granting access, delivering goods, or marking a coupon/redeem flow complete.

## Start

```bash
npm run check
npm run start:backend
```

Default server:

```text
http://127.0.0.1:8091
```

Health / route info:

```bash
curl -sS http://127.0.0.1:8091/health | python3 -m json.tool
```

## Verify holding

This endpoint is the backend version of EA-3 Token Gate Demo.

```text
POST /verify/holding
```

Example:

```bash
curl -sS http://127.0.0.1:8091/verify/holding \
  -H 'content-type: application/json' \
  -d '{
    "network": "mainnet",
    "walletAddress": "kaspa:qpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94",
    "ca": "2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc",
    "minimumAmount": "1"
  }' | python3 -m json.tool
```

Expected decision for the default sample:

```text
ACCESS_GRANTED
```

To test denial, change `minimumAmount` to `101`.

## Verify redeem

This endpoint is the backend version of EA-4 Merchant Redeem Verifier.

```text
POST /verify/redeem
```

Example:

```bash
curl -sS http://127.0.0.1:8091/verify/redeem \
  -H 'content-type: application/json' \
  -d '{
    "network": "mainnet",
    "proofId": "4293125140000",
    "ca": "2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc",
    "expectedAmount": "1",
    "merchantAddress": "kaspa:qrp6qd9jx8tj3f0rsyqz04a9052dsf0u7dtf0emstjefccmucp4n5yxvz0mmw",
    "customerAddress": "kaspa:qpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94"
  }' | python3 -m json.tool
```

Expected decision for the default sample:

```text
REDEEM_VERIFIED
```

To test rejection, change `expectedAmount` to `2` or change the merchant address.

## What the backend verifies

Holding proof:

```text
1. Fetch CA metadata.
2. Convert the required display amount to raw units using token decimals.
3. Fetch wallet balance for the CA.
4. Compare BigInt(balanceRaw) >= BigInt(requiredRaw).
```

Redeem proof:

```text
1. Fetch CA metadata.
2. Convert the expected display amount to raw units using token decimals.
3. Fetch operation proof by opScore or 64-character proof id.
4. Verify operation type is transfer.
5. Verify operation CA matches expected CA.
6. Verify operation amount is sufficient.
7. Verify recipient matches merchant address.
8. Verify sender matches customer address when supplied.
9. Verify txAccept === "1".
10. Verify opAccept === "1".
11. Verify opError is empty.
```

## Boundary

EA-5 is still a reference app. It does not contain accounts, sessions, business rules, merchant settlement, custody logic, wallet signing, private keys, Token Depot hosted infrastructure, or Compliance Node internals.
