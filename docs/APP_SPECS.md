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
