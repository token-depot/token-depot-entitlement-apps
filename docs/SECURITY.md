# Security

These apps are read-only public reference apps.

## They do not use

```text
private keys
mnemonics
seed phrases
wallet keyfiles
wallet passphrases
wallet unlock
signing
Token Depot admin tokens
AWS credentials
tenant secrets
Compliance Node custody keys
Broker-Custody Wallet signer material
```

## Browser demo warning

The browser apps are useful for learning and client-side display. Real production gates should verify entitlements server-side because frontend-only access checks can be bypassed.

## Token Depot-issued label

Do not trust a token as Token Depot-issued from public metadata alone. The apps use the public known-CA registry to assign that label.

## API availability

The apps depend on public indexer API availability. Production dapps should plan for timeouts, rate limits, retries, and server-side verification.
