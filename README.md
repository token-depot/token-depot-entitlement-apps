# Token Depot Entitlement Apps

Reference apps for discovering, viewing, and verifying Token Depot-issued KRC-20 CA issue-mode tokens in real-world dapps.

This repository is intentionally app-first, not SDK-first. The first examples are plain HTML/JavaScript so developers can see the exact public API calls and normalized data model without framework scaffolding.

## Current status

```text
v0.1.2
EA-1 CA Token Explorer: working
EA-2 Wallet Entitlement Viewer: working
EA-3 Token Gate Demo: added for testing
Address-path handling: fixed for Kasplex address tokenlist endpoints
```

## What this repo demonstrates

- How to look up a KRC-20 issue-mode token by CA.
- How to recover public CA metadata such as name, decimals, mode, state, supply, holders, and operation counters.
- How to view CA issue-mode token balances for a Kaspa address.
- How to make a simple read-only token-gate decision from CA balance proof.
- How to distinguish public token metadata from Token Depot's known-CA registry.
- How to prepare for real-world entitlement, coupon, membership, license, and redemption flows.

## Current apps

| App | Path | Purpose |
| --- | --- | --- |
| CA Token Explorer | `apps/ca-token-explorer/web-js/` | Enter a CA and recover public metadata. |
| Wallet Entitlement Viewer | `apps/wallet-entitlement-viewer/web-js/` | Enter a Kaspa address and view CA issue-mode entitlements. |
| Token Gate Demo | `apps/token-gate-demo/web-js/` | Enter wallet + CA + minimum amount and receive an access decision. |

## Quick start

Serve the repo locally so browser ES modules load correctly:

```bash
npm run check
python3 -m http.server 8088
```

Then open:

```text
http://127.0.0.1:8088/apps/ca-token-explorer/web-js/
http://127.0.0.1:8088/apps/wallet-entitlement-viewer/web-js/
http://127.0.0.1:8088/apps/token-gate-demo/web-js/
```

No wallet connection is used. No private keys, mnemonics, passphrases, keyfiles, signing, or Token Depot hosted infrastructure are required.

## Known Token Depot CA examples

```text
TDUSDC  6f685f85d679d5b7b5d702ebe4a249fb31ddc9edbb7c9f49971daef7cc7fe48f
MMXXVI  2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc
```

Useful mainnet holder address for demos:

```text
kaspa:qpkxn24070npk7cx336vlfa6wcj8cvcgrwd482rxdeqn9qrsd6gkzkpt9sr94
```

## Public API bases

```text
mainnet  https://api.kasplex.org/v1
tn10     https://tn10api.kasplex.org/v1
```

## Important trust rule

Public API metadata proves that a CA exists and what the indexer reports about it. Token Depot-issued status is a separate trust label and comes only from `fixtures/token-depot-known-cas.json` or another Token Depot-approved public registry.

## Browser demo warning

Frontend-only token gates are educational. Production dapps should verify entitlements server-side before granting protected access.

## Scope boundary

This repository does not contain Token Depot hosted platform code, Compliance Node custody internals, Broker-Custody Wallet custody logic, wallet signing code, private keys, mnemonics, admin tokens, AWS credentials, tenant secrets, or production infrastructure.
