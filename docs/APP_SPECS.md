# App Specs

## EA-1 — CA Token Explorer

### Purpose

Enter a CA and recover public metadata.

### Inputs

```text
network: mainnet | tn10
ca: raw 64-char CA or CA:<64-char-ca>
```

### Output sections

```text
Token Identity
Issuer / Owner
Supply
Activity
Technical Proof
Known Token Depot Registry Match
```

### Status behavior

```text
valid CA + public metadata + registry match = Token found, Token Depot-known
valid CA + public metadata + no registry match = Public CA found, not Token Depot-known
valid CA + empty API result = CA not found
invalid CA = Invalid CA format
```

## EA-2 — Wallet Entitlement Viewer

### Purpose

Enter a Kaspa address and view CA issue-mode token holdings.

### Inputs

```text
network: mainnet | tn10
wallet address: kaspa:... or kaspatest:...
filter: all issue-mode CAs | Token Depot-known only | specific CA
```

### Output sections

```text
Wallet Summary
Entitlement Cards
Raw Proof
```

### Status behavior

```text
balanceRaw > 0 = active
balanceRaw == 0 = not held
lockedRaw > 0 = locked balance exists
registry match = Token Depot-known label
no registry match = public CA only
```

## EA-3 — Token Gate Demo

### Purpose

Enter a wallet address, required CA, and minimum amount. The app returns a read-only access decision:

```text
ACCESS GRANTED
ACCESS DENIED
```

### Inputs

```text
network: mainnet | tn10
wallet address: kaspa:... or kaspatest:...
required CA: raw 64-char CA or CA:<64-char-ca>
minimum amount: human display amount using the token decimals
```

### Data flow

```text
1. Fetch CA metadata with GET /krc20/token/{ca}.
2. Read token decimals from metadata.
3. Convert minimum display amount to raw units.
4. Fetch wallet balance with GET /krc20/address/{address}/token/{ca}.
5. Compare BigInt(balanceRaw) >= BigInt(requiredRaw).
6. Show access decision and raw proof.
```

### Output sections

```text
Access Decision
Token / CA
Wallet address
Required amount
Wallet balance
Raw proof endpoint
Raw API response
```

### Status behavior

```text
balanceRaw >= requiredRaw = ACCESS GRANTED
balanceRaw < requiredRaw = ACCESS DENIED
invalid CA = Invalid CA format
missing token metadata = Required CA was not found
invalid wallet/network mismatch = Address prefix does not match selected network
```

### Security note

This browser demo is educational. Production dapps should perform the same entitlement check server-side before granting protected access.

## EA-4 — Merchant Redeem Verifier

### Purpose

Enter an operation proof id and expected redemption details. The app verifies whether a public KRC-20 transfer operation satisfies the merchant redemption rule.

```text
REDEEM VERIFIED
REDEEM REJECTED
```

### Inputs

```text
network: mainnet | tn10
operation proof id: opScore digits or 64-character hex id
expected CA: raw 64-char CA or CA:<64-char-ca>
expected amount: human display amount using token decimals
merchant receive address: kaspa:... or kaspatest:...
customer address: optional kaspa:... or kaspatest:...
```

### Data flow

```text
1. Fetch expected CA metadata with GET /krc20/token/{ca}.
2. Read token decimals from metadata.
3. Convert expected display amount to raw units.
4. Fetch operation proof with GET /krc20/op/{id}.
5. Verify op === transfer.
6. Verify operation CA matches expected CA.
7. Verify BigInt(operation.amt) >= BigInt(requiredRaw).
8. Verify operation.to matches merchant address.
9. Verify operation.from matches customer address when supplied.
10. Verify txAccept === "1".
11. Verify opAccept === "1".
12. Verify opError is empty.
13. Show verified/rejected decision and raw proof.
```

### Output sections

```text
Redeem Decision
Verification Checks
Token / CA
Expected Amount
Operation Amount
From / To
opScore
hashRev
Raw proof endpoint
Raw API response
```

### Status behavior

```text
all checks pass = REDEEM VERIFIED
one or more checks fail = REDEEM REJECTED
invalid CA = Invalid CA format
missing token metadata = Expected CA was not found
missing operation = Operation proof was not found
invalid merchant/customer network mismatch = Address prefix does not match selected network
```

### Security note

This browser demo is educational. Production merchants should verify redemption proof server-side before delivering goods, services, benefits, or off-chain value.
