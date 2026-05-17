# Module EA — Entitlement Apps

Module EA replaces the earlier SDK-first framing with practical reference apps for real-world dapp usage of KRC-20 CA issue-mode tokens.

## Goal

Provide complete, inspectable examples showing how a dapp can:

1. Discover a CA token.
2. Recover public metadata.
3. Identify whether the CA is in Token Depot's known-CA registry.
4. View a wallet's CA issue-mode balances.
5. Prepare for future token-gating and merchant redemption verification.

## Current scope

The first release includes:

- EA-1: CA Token Explorer.
- EA-2: Wallet Entitlement Viewer.
- Shared JavaScript helpers for CA normalization, public API access, amount formatting, and registry matching.

## Deferred scope

The following are intentionally deferred until the current model is proven:

- Token Gate Demo.
- Merchant Redeem Verifier.
- Backend Verification Server.
- Python/FastAPI port.
- Swift implementation.
- Reusable SDK package.

## Non-goals

- No wallet unlock.
- No signing.
- No private keys.
- No mnemonics.
- No keyfiles.
- No Token Depot hosted platform dependency.
- No Compliance Node or Broker-Custody Wallet custody logic.
